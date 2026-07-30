// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/Velora.sol";

contract SafetyNetTest is Test {
    Velora velora;
    address owner = address(0x1);
    address destination = address(0x2);
    address seedSender = address(0x3);

    uint256 feeBps = 100; // 1%
    uint256 minThreshold = 0.1 ether;
    uint256 cooldown = 24 hours;
    uint256 maxClaim = 10 ether;

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(seedSender, 100 ether);
        velora = new Velora(feeBps, minThreshold, cooldown, maxClaim);
    }

    function testFeeLogic() public {
        vm.prank(owner);
        uint256 policyId = velora.createPolicy{value: 1 ether}(
            "Test Policy", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 10, 1 ether, 1 hours
        );

        vm.prank(owner);
        velora.executeRequest(policyId, 1 ether, destination, Velora.ActionType.Transfer);

        (uint256 pool, , , ) = velora.getSafetyNetStats();
        assertEq(pool, 0.01 ether); // 1% of 1 ether
        assertEq(velora.policyContribution(policyId), 0.01 ether);
    }

    function testPermissionlessSeed() public {
        uint256 seedAmount = 1 ether;
        vm.prank(seedSender);
        velora.seedSafetyNet{value: seedAmount}();

        (uint256 pool, , uint256 totalSeeded, ) = velora.getSafetyNetStats();
        assertEq(pool, seedAmount);
        assertEq(totalSeeded, seedAmount);
        
        // Ensure no policy contribution created
        // Seeded pool has no policy ID, check with dummy ID 999
        assertEq(velora.policyContribution(999), 0);
    }

    function testClaimQuotaFormula() public {
        vm.prank(owner);
        uint256 policyId = velora.createPolicy{value: 10 ether}(
            "Test Policy", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 10, 1 ether, 1 hours
        );

        // 1 ether executed = 0.01 ether fee
        vm.prank(owner);
        velora.executeRequest(policyId, 1 ether, destination, Velora.ActionType.Transfer);
        
        // Manual calculate quota: (0.01 * 0.7) = 0.007
        // Claim 0.004
        vm.warp(block.timestamp + 25 hours);
        vm.prank(owner);
        velora.claimFromSafetyNet(policyId, 0.004 ether, "Test claim");

        (uint256 cont, uint256 paid, uint256 quota, ) = velora.getPolicySafetyNetInfo(policyId);
        assertEq(cont, 0.01 ether);
        assertEq(paid, 0.004 ether);
        // Quota = (0.01 * 0.7) - 0.004 = 0.007 - 0.004 = 0.003
        assertEq(quota, 0.003 ether);
    }

    function testCooldownEnforced() public {
        vm.prank(owner);
        uint256 policyId = velora.createPolicy{value: 10 ether}(
            "Test", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 10, 1 ether, 1 hours
        );

        vm.prank(owner);
        velora.executeRequest(policyId, 1 ether, destination, Velora.ActionType.Transfer);
        vm.warp(block.timestamp + 25 hours);
        
        vm.prank(owner);
        velora.claimFromSafetyNet(policyId, 0.001 ether, "First");

        vm.prank(owner);
        vm.expectRevert("Cooldown active");
        velora.claimFromSafetyNet(policyId, 0.001 ether, "Second");
    }

    function testMaxClaimPerTxCap() public {
        // Setup: Contribute a large amount to ensure quota > maxClaimPerTx (10 ether)
        // Set fee to 10% (1000 bps) to get 10 ether fee from 100 ether execution
        // We need a contract redeploy with higher fee for this specific test
        Velora v2 = new Velora(1000, 0.1 ether, 24 hours, 10 ether);
        
        vm.deal(owner, 200 ether);
        vm.prank(owner);
        uint256 policyId = v2.createPolicy{value: 100 ether}("Policy", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 1, 100 ether, 1 hours);

        vm.prank(owner);
        v2.executeRequest(policyId, 100 ether, destination, Velora.ActionType.Transfer);

        // Fee is 10 ether. Contribution is 10 ether. 70% of 10 is 7.
        // Wait, 10% of 100 is 10. Quota is 7. 
        // MaxClaimPerTx is 10.
        // My math was off. Let's make it simple: 
        // Contrib 20. Quota 14. MaxClaim 10.
        // Fee 1000 bps = 10%. To get 20 contrib, need 200 execution.
        
        vm.deal(owner, 300 ether);
        vm.prank(owner);
        uint256 policyId2 = v2.createPolicy{value: 200 ether}("Policy", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 1, 200 ether, 1 hours);
        vm.prank(owner);
        v2.executeRequest(policyId2, 200 ether, destination, Velora.ActionType.Transfer);

        // Contrib = 20. Quota = 14. MaxClaim = 10.
        vm.warp(block.timestamp + 25 hours);
        
        // Try claim 11 (revert)
        vm.prank(owner);
        vm.expectRevert("Exceeds max per tx");
        v2.claimFromSafetyNet(policyId2, 11 ether, "Exceed cap");

        // Try claim 10 (success)
        vm.prank(owner);
        v2.claimFromSafetyNet(policyId2, 10 ether, "Success");
        
        (, uint256 paid, , ) = v2.getPolicySafetyNetInfo(policyId2);
        assertEq(paid, 10 ether);
    }

    function testNoProfitFromSelfClaim() public {
        vm.prank(owner);
        uint256 policyId = velora.createPolicy{value: 10 ether}("Policy", destination, Velora.ActionType.Transfer, block.timestamp + 1 days, 10, 1 ether, 1 hours);
        
        vm.prank(owner);
        velora.executeRequest(policyId, 1 ether, destination, Velora.ActionType.Transfer);
        
        // Quota: 0.01 * 0.7 = 0.007
        vm.warp(block.timestamp + 25 hours);
        vm.prank(owner);
        velora.claimFromSafetyNet(policyId, 0.007 ether, "Drain quota");

        vm.warp(block.timestamp + 25 hours);
        vm.prank(owner);
        vm.expectRevert("Exceeds quota");
        velora.claimFromSafetyNet(policyId, 0.001 ether, "Over drain");

        (, uint256 paid, , ) = velora.getPolicySafetyNetInfo(policyId);
        assertEq(paid, 0.007 ether);
    }
}
