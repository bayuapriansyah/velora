"use client";

import { useEffect, useState } from "react";
import { Contract, EventLog } from "ethers";
import { getProvider, getVeloraContract } from "@/lib/ethers";
import { ActivityEvent } from "@/types/policy";

const EVENT_NAMES: ActivityEvent["type"][] = [
  "PolicyCreated",
  "ExecutionApproved",
  "ExecutionRejected",
  "PolicyCancelled",
  "BudgetWithdrawn",
];

function toActivityEvent(name: ActivityEvent["type"], log: EventLog): ActivityEvent {
  return {
    type: name,
    policyId: log.args[0] as bigint,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: log.transactionHash ?? "",
    data: Object.fromEntries(
      (log.fragment?.inputs ?? []).map((input, i) => [input.name, log.args[i]])
    ),
  };
}

export function usePolicyEvents(owner: string | null, isCorrectNetwork: boolean) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!owner || !isCorrectNetwork) return;
    let contract: Contract | undefined;
    let cancelled = false;

    const listeners: { name: string; handler: (...args: any[]) => void }[] = [];

    (async () => {
      try {
        const provider = getProvider();
        contract = await getVeloraContract(provider);
      } catch (err) {
        console.warn("usePolicyEvents: could not attach to Velora contract:", err);
        return;
      }
      if (cancelled || !contract) return;

      // 1) Backfill: pull past events so a fresh page load isn't empty.
      try {
        const results = await Promise.all(
          EVENT_NAMES.map((name) => contract!.queryFilter(contract!.filters[name]()))
        );
        const historical = results
          .flatMap((logs, i) => logs.map((log) => toActivityEvent(EVENT_NAMES[i], log as EventLog)))
          .sort((a, b) => b.txHash.localeCompare(a.txHash)); // newest-ish first
        if (!cancelled) setEvents(historical.reverse());
      } catch (err) {
        console.warn("usePolicyEvents: failed to backfill past events:", err);
      }

      // 2) Live: keep listening for new events from here on.
      for (const name of EVENT_NAMES) {
        const handler = (...args: any[]) => {
          const log = args[args.length - 1] as EventLog;
          setEvents((prev) => [toActivityEvent(name, log), ...prev]);
        };
        contract.on(name, handler);
        listeners.push({ name, handler });
      }
    })();

    return () => {
      cancelled = true;
      if (contract) {
        for (const { name, handler } of listeners) {
          contract.off(name, handler);
        }
      }
    };
  }, [owner, isCorrectNetwork]);

  return events;
}