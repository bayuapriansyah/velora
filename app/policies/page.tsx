"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { PolicyTable } from "@/components/dashboard/policy-table";
import { useWallet } from "@/hooks/useWallet";
import { usePolicies } from "@/hooks/usePolicies";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { PolicyStatus } from "@/types/policy";

export default function PoliciesPage() {
  const { account, isCorrectNetwork } = useWallet();
  const { policies, isLoading, refresh } = usePolicies(account);
  const { cancelPolicy, withdrawRemainingBudget } = useVeloraContract();
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-[280px]">
        <TopBar title="Policies"/>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Policies</h1>
          </div>
          <PolicyTable
            policies={policies}
            onCancel={handleCancel}
            onWithdraw={handleWithdraw}
            busyId={busyId}
          />
        </main>
      </div>
    </div>
  );
}
