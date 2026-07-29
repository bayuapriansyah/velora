// Mirrors Velora.sol exactly. Keep in lockstep with the contract's enum ordering —
// Solidity enums serialize as uint8 in declaration order.

export enum PolicyStatus {
  Active = 0,
  Cancelled = 1,
  Expired = 2,
  Exhausted = 3,
}

export enum ActionType {
  Transfer = 0,
  Swap = 1,
  ContractCall = 2,
}

export enum RejectReason {
  Expired = 0,
  DestinationMismatch = 1,
  ActionMismatch = 2,
  InsufficientBudget = 3,
  ExecutionLimitReached = 4,
  NotActive = 5,
  InvalidExecutionAmount = 6,
  PaymentNotDue = 7,
}

export interface Policy {
  id: bigint;
  owner: string;
  name: string;
  remainingBudget: bigint;
  totalBudget: bigint;
  allowedDestination: string;
  allowedAction: ActionType;
  expiration: bigint;
  maxExecutions: bigint;
  executionCount: bigint;
  status: PolicyStatus;
  amountPerExecution: bigint;
  paymentInterval: bigint;
  lastExecutionTime: bigint;
}

export const ACTION_LABELS: Record<ActionType, string> = {
  [ActionType.Transfer]: "Send BOT",
  [ActionType.Swap]: "Swap Tokens",
  [ActionType.ContractCall]: "Call Contract",
};

export const STATUS_LABELS: Record<PolicyStatus, string> = {
  [PolicyStatus.Active]: "Active",
  [PolicyStatus.Cancelled]: "Cancelled",
  [PolicyStatus.Expired]: "Expired",
  [PolicyStatus.Exhausted]: "Exhausted",
};

export const REJECT_REASON_LABELS: Record<RejectReason, string> = {
  [RejectReason.Expired]: "Policy expired",
  [RejectReason.DestinationMismatch]: "Destination doesn't match the policy",
  [RejectReason.ActionMismatch]: "Action type doesn't match the policy",
  [RejectReason.InsufficientBudget]: "Insufficient remaining budget",
  [RejectReason.ExecutionLimitReached]: "Execution limit reached",
  [RejectReason.NotActive]: "Policy is not active",
  [RejectReason.InvalidExecutionAmount]: "Invalid execution amount",
  [RejectReason.PaymentNotDue]: "Payment interval has not elapsed",
};

export interface ActivityEvent {
  type: "PolicyCreated" | "ExecutionApproved" | "ExecutionRejected" | "PolicyCancelled" | "BudgetWithdrawn";
  policyId: bigint;
  timestamp: number;
  txHash: string;
  data: Record<string, unknown>;
}
