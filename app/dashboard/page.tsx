"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { WalletHero } from "@/components/dashboard/wallet-hero";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { PolicyTable } from "@/components/dashboard/policy-table";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { usePolicies } from "@/hooks/usePolicies";
import { usePolicyEvents } from "@/hooks/usePolicyEvents";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { getProvider } from "@/lib/ethers";
import { PolicyStatus } from "@/types/policy";

export default function DashboardPage() {
  const { account, isCorrectNetwork, connect } = useWallet();
  const { policies, isLoading, error, refresh } = usePolicies(account);
  const policyIds = useMemo(() => policies.map((policy) => policy.id), [policies]);
  const events = usePolicyEvents(account, isCorrectNetwork, policyIds);
  const { cancelPolicy, withdrawRemainingBudget } = useVeloraContract();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!account) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const provider = getProvider();
        setBalance(await provider.getBalance(account));
      } catch {
        setBalance(null);
      }
    })();
  }, [account]);

  const activePolicies = policies.filter((p) => p.status === PolicyStatus.Active);
  const totalBudget = policies.reduce((s, p) => s + p.totalBudget, 0n);
  const remainingBudget = policies.reduce((s, p) => s + p.remainingBudget, 0n);
  const approvedEvents = events.filter((e) => e.type === "ExecutionApproved").length;
  const rejectedEvents = events.filter((e) => e.type === "ExecutionRejected").length;

  async function handleCancel(id: bigint) {
    setBusyId(id.toString());
    try {
      await cancelPolicy(id);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleWithdraw(id: bigint) {
    setBusyId(id.toString());
    try {
      await withdrawRemainingBudget(id);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (!account) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
              <Wallet size={24} className="text-[var(--color-accent)]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">Connect your wallet</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Connect your wallet to manage AI agent policies and monitor on-chain activity.
            </p>
            <Button className="mt-6" onClick={connect}>
              <Wallet size={16} />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 items-center justify-center">
          <div className="text-center max-w-sm">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Wrong network</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Switch your wallet to BOT Chain to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="lg:ml-[280px] flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className="grid grid-cols-12 gap-6">

              <WalletHero
                account={account}
                balance={balance}
                isCorrectNetwork={isCorrectNetwork}
                activePoliciesCount={activePolicies.length}
                totalPoliciesCount={policies.length}
                isLoading={isLoading}
                onRefresh={refresh}
              />

              <div className="col-span-12">
                <h2 className="mb-5 text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                  Analytics
                </h2>
                <AnalyticsCards
                  totalPolicies={policies.length}
                  activePolicies={activePolicies.length}
                  approvedEvents={approvedEvents}
                  rejectedEvents={rejectedEvents}
                  totalBudget={totalBudget}
                  remainingBudget={remainingBudget}
                />
              </div>

              <div className="col-span-12">
                <h2 className="mb-4 text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                  Activity
                </h2>
                <div className="grid grid-cols-12 gap-6">
                  <ActivityTimeline
                    events={events}
                    approvedCount={approvedEvents}
                    rejectedCount={rejectedEvents}
                  />

                  <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm">
                      <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                        Summary
                      </p>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--color-muted)]">Total events</span>
                          <span className="text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                            {events.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--color-rule)] pt-4">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                            Approved
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-[var(--color-success)]">
                            {approvedEvents}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                            <span className="h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                            Rejected
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-[var(--color-danger)]">
                            {rejectedEvents}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--color-rule)] pt-4">
                          <span className="text-sm text-[var(--color-muted)]">Approval rate</span>
                          <span className="text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                            {approvedEvents + rejectedEvents > 0
                              ? `${Math.round((approvedEvents / (approvedEvents + rejectedEvents)) * 100)}%`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
