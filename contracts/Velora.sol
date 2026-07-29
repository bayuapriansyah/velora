// SPDX-License-Identifier: MIT                                                                                                                                 
  pragma solidity ^0.8.24;                                                                                                                                        
                                                                                                                                                                  
  contract Velora {                                                                                                                                               
      uint256 private _locked = 1;                                                                                                                                
                                                                                                                                                                  
      modifier nonReentrant() {                                                                                                                                   
          require(_locked == 1, "Reentrant call");                                                                                                                
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
          uint256 paymentInterval                                                                                                                                 
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
          if (msg.value < amountPerExecution) revert BudgetTooSmall();                                                                                            
                                                                                                                                                                  
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
              lastExecutionTime: 0                                                                                                                                
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
              paymentInterval                                                                                                                                     
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
      ) external nonReentrant returns (bool approved) {                                                                                                           
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
          if (amount > p.remainingBudget) {                                                                                                                       
              emit ExecutionRejected(policyId, RejectReason.InsufficientBudget, destination, amount);                                                             
              return false;                                                                                                                                       
          }                                                                                                                                                       
                                                                                                                                                                  
          if (p.executionCount >= p.maxExecutions) {                                                                                                              
              p.status = PolicyStatus.Exhausted;                                                                                                                  
              emit ExecutionRejected(policyId, RejectReason.ExecutionLimitReached, destination, amount);                                                          
              return false;                                                                                                                                       
          }                                                                                                                                                       
                                                                                                                                                                  
          p.remainingBudget -= amount;                                                                                                                            
          p.executionCount += 1;                                                                                                                                  
          if (p.executionCount >= p.maxExecutions) {                                                                                                              
              p.status = PolicyStatus.Exhausted;                                                                                                                  
          }                                                                                                                                                       
                                                                                                                                                                  
          p.lastExecutionTime = block.timestamp;                                                                                                                  
                                                                                                                                                                  
          emit ExecutionApproved(policyId, destination, amount, p.remainingBudget, p.executionCount);                                                             
                                                                                                                                                                  
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
  } 