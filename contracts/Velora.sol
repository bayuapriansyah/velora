// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Velora {
    uint256 private _locked = 1;

    error ReentrantCall();

    modifier nonReentrant() {
        if (_locked != 1) revert ReentrantCall();
        _locked = 2;
        _;
        _locked = 1;
    }

    enum PolicyStatus {
        Active,
        Cancelled,
        Expired,
        Exhausted
    }

    enum ActionType {
        Transfer,
        Swap,
        ContractCall
    }

    enum RejectReason {
        Expired,
        DestinationMismatch,
        ActionMismatch,
        InsufficientBudget,
        ExecutionLimitReached,
        NotActive,
        InvalidExecutionAmount,
        PaymentNotDue
    }

    struct Policy {
        uint256 id;
        address owner;
        string name;
        uint256 remainingBudget;
        uint256 totalBudget;
        address allowedDestination;
        ActionType allowedAction;
        uint256 expiration;
        uint256 maxExecutions;
        uint256 executionCount;
        PolicyStatus status;
        uint256 amountPerExecution;
        uint256 paymentInterval;
        uint256 lastExecutionTime;
        uint256 feeBps;
    }

    mapping(uint256 => Policy) private policies;
    uint256 private nextPolicyId;
    mapping(address => uint256[]) private ownerPolicyIds;

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed owner,
        string name,
        uint256 budget,
        address allowedDestination,
        ActionType allowedAction,
        uint256 expiration,
        uint256 maxExecutions,
        uint256 amountPerExecution,
        uint256 paymentInterval,
        uint256 feeBps
    );

    event ExecutionApproved(
        uint256 indexed policyId,
        address indexed destination,
        uint256 amount,
        uint256 remainingBudget,
        uint256 executionCount
    );

    event ExecutionRejected(
        uint256 indexed policyId,
        RejectReason reason,
        address attemptedDestination,
        uint256 attemptedAmount
    );

    event PolicyCancelled(uint256 indexed policyId, address indexed owner);

    event BudgetWithdrawn(uint256 indexed policyId, address indexed owner, uint256 amount);
    event SafetyNetContribution(uint256 indexed policyId, uint256 amount);
    event SafetyNetClaimPaid(uint256 indexed policyId, address indexed claimant, uint256 amount, string reason, uint256 timestamp);
    event SafetyNetSeeded(address indexed seeder, uint256 amount);

    error PolicyNotFound();
    error NotPolicyOwner();
    error ZeroDeposit();
    error InvalidExpiration();
    error InvalidDestination();
    error InvalidMaxExecutions();
    error InvalidAmountPerExecution();
    error InvalidPaymentInterval();
    error BudgetTooSmall();
    error PolicyNotActive();
    error NothingToWithdraw();
    error WithdrawTransferFailed();

    // ============ SAFETYNET STATE ============
    uint256 public immutable safetyNetFeeBps;
    uint256 public immutable minFeeThreshold;
    uint256 public immutable claimCooldown;
    uint256 public immutable maxClaimPerTx;

    uint256 public safetyNetPool;
    uint256 public totalSafetyNetFees;
    uint256 public totalSeeded;
    uint256 public totalClaimsPaid;

    mapping(uint256 => uint256) public policyContribution;
    mapping(uint256 => uint256) public policyClaimsPaid;
    mapping(uint256 => uint256) public lastClaimTimestamp;

    constructor(
        uint256 _safetyNetFeeBps,
        uint256 _minFeeThreshold,
        uint256 _claimCooldown,
        uint256 _maxClaimPerTx
    ) {
        require(_safetyNetFeeBps <= 100, "Fee too high");
        safetyNetFeeBps = _safetyNetFeeBps;
        minFeeThreshold = _minFeeThreshold;
        claimCooldown = _claimCooldown;
        maxClaimPerTx = _maxClaimPerTx;
    }

    function createPolicy(
        string calldata name,
        address allowedDestination,
        ActionType allowedAction,
        uint256 expiration,
        uint256 maxExecutions,
        uint256 amountPerExecution,
        uint256 paymentInterval
    ) external payable returns (uint256 policyId) {
        if (msg.value == 0) revert ZeroDeposit();
        if (expiration <= block.timestamp) revert InvalidExpiration();
        if (allowedDestination == address(0)) revert InvalidDestination();
        if (maxExecutions == 0) revert InvalidMaxExecutions();
        if (amountPerExecution == 0) revert InvalidAmountPerExecution();
        if (paymentInterval == 0) revert InvalidPaymentInterval();

        uint256 fee = amountPerExecution >= minFeeThreshold
            ? (amountPerExecution * safetyNetFeeBps) / 10000
            : 0;
        uint256 requiredBudget = (amountPerExecution + fee) * maxExecutions;
        if (msg.value < requiredBudget) revert BudgetTooSmall();

        policyId = nextPolicyId++;

        policies[policyId] = Policy({
            id: policyId,
            owner: msg.sender,
            name: name,
            remainingBudget: msg.value,
            totalBudget: msg.value,
            allowedDestination: allowedDestination,
            allowedAction: allowedAction,
            expiration: expiration,
            maxExecutions: maxExecutions,
            executionCount: 0,
            status: PolicyStatus.Active,
            amountPerExecution: amountPerExecution,
            paymentInterval: paymentInterval,
            lastExecutionTime: 0,
            feeBps: safetyNetFeeBps
        });

        ownerPolicyIds[msg.sender].push(policyId);

        emit PolicyCreated(
            policyId,
            msg.sender,
            name,
            msg.value,
            allowedDestination,
            allowedAction,
            expiration,
            maxExecutions,
            amountPerExecution,
            paymentInterval,
            safetyNetFeeBps
        );
    }

    function cancelPolicy(uint256 policyId) external {
        Policy storage p = policies[policyId];
        if (p.owner == address(0)) revert PolicyNotFound();
        if (p.owner != msg.sender) revert NotPolicyOwner();
        if (_effectiveStatus(p) != PolicyStatus.Active) revert PolicyNotActive();

        p.status = PolicyStatus.Cancelled;
        emit PolicyCancelled(policyId, msg.sender);
    }

    function executeRequest(
        uint256 policyId,
        uint256 amount,
        address destination,
        ActionType action
    ) external payable nonReentrant returns (bool approved) {
        Policy storage p = policies[policyId];
        if (p.owner == address(0)) revert PolicyNotFound();

        PolicyStatus effective = _effectiveStatus(p);
        if (effective == PolicyStatus.Expired) {
            if (p.status == PolicyStatus.Active) p.status = PolicyStatus.Expired;
            emit ExecutionRejected(policyId, RejectReason.Expired, destination, amount);
            return false;
        }
        if (effective != PolicyStatus.Active) {
            emit ExecutionRejected(policyId, RejectReason.NotActive, destination, amount);
            return false;
        }

        if (destination != p.allowedDestination) {
            emit ExecutionRejected(policyId, RejectReason.DestinationMismatch, destination, amount);
            return false;
        }
        if (action != p.allowedAction) {
            emit ExecutionRejected(policyId, RejectReason.ActionMismatch, destination, amount);
            return false;
        }
        if (amount != p.amountPerExecution) {
            emit ExecutionRejected(policyId, RejectReason.InvalidExecutionAmount, destination, amount);
            return false;
        }
        if (
            p.lastExecutionTime != 0 &&
            block.timestamp < p.lastExecutionTime + p.paymentInterval
        ) {
            emit ExecutionRejected(policyId, RejectReason.PaymentNotDue, destination, amount);
            return false;
        }

        uint256 fee = amount >= minFeeThreshold
            ? (amount * p.feeBps) / 10000
            : 0;
        uint256 totalCost = amount + fee;

        if (totalCost > p.remainingBudget) {
            emit ExecutionRejected(policyId, RejectReason.InsufficientBudget, destination, amount);
            return false;
        }

        if (p.executionCount >= p.maxExecutions) {
            p.status = PolicyStatus.Exhausted;
            emit ExecutionRejected(policyId, RejectReason.ExecutionLimitReached, destination, amount);
            return false;
        }

        p.remainingBudget -= totalCost;
        p.executionCount += 1;
        if (p.executionCount >= p.maxExecutions) {
            p.status = PolicyStatus.Exhausted;
        }

        p.lastExecutionTime = block.timestamp;

        emit ExecutionApproved(policyId, destination, amount, p.remainingBudget, p.executionCount);

        if (fee > 0) {
            safetyNetPool += fee;
            totalSafetyNetFees += fee;
            policyContribution[policyId] += fee;
            emit SafetyNetContribution(policyId, fee);
        }

        (bool sent, ) = destination.call{value: amount}("");
        require(sent, "BOT transfer failed");

        return true;
    }

    function withdrawRemainingBudget(uint256 policyId) external nonReentrant {
        Policy storage p = policies[policyId];
        if (p.owner == address(0)) revert PolicyNotFound();
        if (p.owner != msg.sender) revert NotPolicyOwner();

        PolicyStatus effective = _effectiveStatus(p);
        if (effective == PolicyStatus.Active) revert PolicyNotActive();
        if (p.status != effective) p.status = effective;

        uint256 amount = p.remainingBudget;
        if (amount == 0) revert NothingToWithdraw();

        p.remainingBudget = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert WithdrawTransferFailed();

        emit BudgetWithdrawn(policyId, msg.sender, amount);
    }

    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        Policy storage p = policies[policyId];
        if (p.owner == address(0)) revert PolicyNotFound();

        Policy memory result = p;
        result.status = _effectiveStatus(p);
        return result;
    }

    function getPoliciesByOwner(address owner) external view returns (uint256[] memory) {
        return ownerPolicyIds[owner];
    }

    function _effectiveStatus(Policy storage p) internal view returns (PolicyStatus) {
        if (p.status == PolicyStatus.Cancelled) return PolicyStatus.Cancelled;
        if (p.status == PolicyStatus.Exhausted) return PolicyStatus.Exhausted;
        if (block.timestamp > p.expiration) return PolicyStatus.Expired;
        return PolicyStatus.Active;
    }

    // ============ SAFETYNET FUNCTIONS ============

    function seedSafetyNet() external payable {
        totalSeeded += msg.value;
        safetyNetPool += msg.value;
        emit SafetyNetSeeded(msg.sender, msg.value);
    }

    function claimFromSafetyNet(uint256 policyId, uint256 amount, string calldata reason) external nonReentrant {
        Policy storage p = policies[policyId];
        if (p.owner == address(0)) revert PolicyNotFound();
        if (p.owner != msg.sender) revert NotPolicyOwner();

        require(block.timestamp >= lastClaimTimestamp[policyId] + claimCooldown, "Cooldown active");
        require(amount <= maxClaimPerTx, "Exceeds max per tx");
        require(amount <= safetyNetPool, "Insufficient pool");

        uint256 quota = (policyContribution[policyId] * 70) / 100 - policyClaimsPaid[policyId];
        require(amount <= quota, "Exceeds quota");

        policyClaimsPaid[policyId] += amount;
        lastClaimTimestamp[policyId] = block.timestamp;
        safetyNetPool -= amount;
        totalClaimsPaid += amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Claim transfer failed");

        emit SafetyNetClaimPaid(policyId, msg.sender, amount, reason, block.timestamp);
    }

    // ============ SAFETYNET VIEW FUNCTIONS ============

    function getSafetyNetStats() external view returns (uint256, uint256, uint256, uint256) {
        return (safetyNetPool, totalSafetyNetFees, totalSeeded, totalClaimsPaid);
    }

    function getPolicySafetyNetInfo(uint256 policyId) external view returns (uint256, uint256, uint256, uint256) {
        uint256 quota = (policyContribution[policyId] * 70) / 100 - policyClaimsPaid[policyId];
        uint256 cooldownEnds = lastClaimTimestamp[policyId] + claimCooldown;
        return (policyContribution[policyId], policyClaimsPaid[policyId], quota, cooldownEnds);
    }
}
