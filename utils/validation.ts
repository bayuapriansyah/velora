import { ActionType, Policy, PolicyStatus, RejectReason } from "@/types/policy";

/**
 * Predicts how Velora.sol's executeRequest() would rule on a request, using the
 * exact same rule order as the contract (see Velora.sol §3 / SDD §5.4).
 *
 * IMPORTANT: this is UX-only, for instant feedback before a transaction is sent.
 * It is never the source of truth — only the transaction result and the emitted
 * ExecutionApproved/ExecutionRejected event are authoritative. The Simulation page
 * always re-derives its final verdict from the on-chain event, never from this.
 */
export interface PredictedResult {
  approved: boolean;
  reason?: RejectReason;
  ruleResults: { rule: string; passed: boolean }[];
}

export function predictExecution(
  policy: Policy,
  amountWei: bigint,
  destination: string,
  action: ActionType,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): PredictedResult {
  const ruleResults: { rule: string; passed: boolean }[] = [];

  const effectiveStatus =
    policy.status === PolicyStatus.Cancelled
      ? PolicyStatus.Cancelled
      : policy.status === PolicyStatus.Exhausted
      ? PolicyStatus.Exhausted
      : nowSeconds > Number(policy.expiration)
      ? PolicyStatus.Expired
      : PolicyStatus.Active;

  const notExpired = effectiveStatus !== PolicyStatus.Expired;
  ruleResults.push({ rule: "Not expired", passed: notExpired });
  if (!notExpired) {
    return { approved: false, reason: RejectReason.Expired, ruleResults };
  }

  const isActive = effectiveStatus === PolicyStatus.Active;
  ruleResults.push({ rule: "Policy active", passed: isActive });
  if (!isActive) {
    return { approved: false, reason: RejectReason.NotActive, ruleResults };
  }

  const destinationMatches = destination.toLowerCase() === policy.allowedDestination.toLowerCase();
  ruleResults.push({ rule: "Destination matches", passed: destinationMatches });
  if (!destinationMatches) {
    return { approved: false, reason: RejectReason.DestinationMismatch, ruleResults };
  }

  const actionMatches = action === policy.allowedAction;
  ruleResults.push({ rule: "Action matches", passed: actionMatches });
  if (!actionMatches) {
    return { approved: false, reason: RejectReason.ActionMismatch, ruleResults };
  }

  const budgetOk = amountWei <= policy.remainingBudget;
  ruleResults.push({ rule: "Budget sufficient", passed: budgetOk });
  if (!budgetOk) {
    return { approved: false, reason: RejectReason.InsufficientBudget, ruleResults };
  }

  const executionsLeft = policy.executionCount < policy.maxExecutions;
  ruleResults.push({ rule: "Execution limit not reached", passed: executionsLeft });
  if (!executionsLeft) {
    return { approved: false, reason: RejectReason.ExecutionLimitReached, ruleResults };
  }

  return { approved: true, ruleResults };
}
