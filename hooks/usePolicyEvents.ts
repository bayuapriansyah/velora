"use client";

import { useEffect, useState } from "react";
import { Contract, EventLog } from "ethers";
import { getProvider, getVeloraContract } from "@/lib/ethers";
import { ActivityEvent } from "@/types/policy";

const CHUNK_SIZE = 10000;

const OWNER_EVENT_NAMES: ActivityEvent["type"][] = ["PolicyCreated", "PolicyCancelled", "BudgetWithdrawn"];
const POLICY_EVENT_NAMES: ActivityEvent["type"][] = ["ExecutionApproved", "ExecutionRejected"];

interface EventQuery {
  name: ActivityEvent["type"];
  filter: ReturnType<Contract["filters"][string]>;
}

function toActivityEvent(name: ActivityEvent["type"], log: EventLog, blockTimestamp: number): ActivityEvent {
  return {
    type: name,
    policyId: log.args[0] as bigint,
    timestamp: blockTimestamp,
    txHash: log.transactionHash ?? "",
    data: Object.fromEntries(
      (log.fragment?.inputs ?? []).map((input, i) => [input.name, log.args[i]])
    ),
  };
}

function eventKey(event: ActivityEvent) {
  return `${event.txHash}-${event.type}-${event.policyId.toString()}`;
}

function mergeEvents(current: ActivityEvent[], incoming: ActivityEvent[]) {
  const byKey = new Map(current.map((event) => [eventKey(event), event]));
  for (const event of incoming) byKey.set(eventKey(event), event);
  return Array.from(byKey.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export function usePolicyEvents(owner: string | null, isCorrectNetwork: boolean, policyIds: bigint[] = []) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const policyIdKey = policyIds.map((id) => id.toString()).join(",");

  useEffect(() => {
    if (!owner || !isCorrectNetwork) {
      setEvents([]);
      return;
    }

    setEvents([]);

    let contract: Contract | undefined;
    let cancelled = false;

    const listeners: { filter: ReturnType<Contract["filters"][string]>; handler: (...args: any[]) => void }[] = [];
    const selectedPolicyIds = policyIdKey ? policyIdKey.split(",").map((id) => BigInt(id)) : [];

    (async () => {
      try {
        const provider = getProvider();
        contract = await getVeloraContract(provider);
      } catch (err) {
        console.warn("usePolicyEvents: could not attach to Velora contract:", err);
        return;
      }
      if (cancelled || !contract) return;

      // 1) Backfill: scan in chunks from genesis so old dashboard activity is not silently missed.
      try {
        const provider = getProvider();
        const currentBlock = await provider.getBlockNumber();
        const blockCache = new Map<number, number>();

        const ownerEventQueries = OWNER_EVENT_NAMES.map((name) => ({
          name,
          filter: contract!.filters[name](null, owner),
        }));
        const policyEventQueries = selectedPolicyIds.flatMap((policyId) =>
          POLICY_EVENT_NAMES.map((name) => ({
            name,
            filter: contract!.filters[name](policyId),
          }))
        );
        const eventQueries = [...ownerEventQueries, ...policyEventQueries];

        const resolveTimestamp = async (blockNumber: number) => {
          if (!blockCache.has(blockNumber)) {
            try {
              const block = await provider.getBlock(blockNumber);
              blockCache.set(blockNumber, block?.timestamp ?? Math.floor(Date.now() / 1000));
            } catch {
              blockCache.set(blockNumber, Math.floor(Date.now() / 1000));
            }
          }
          return blockCache.get(blockNumber)!;
        };

        const queryLogsInRange = async (
          filter: ReturnType<Contract["filters"][string]>,
          start: number,
          end: number
        ): Promise<EventLog[]> => {
          try {
            return (await contract!.queryFilter(filter, start, end)) as EventLog[];
          } catch (err) {
            if (end <= start) {
              console.warn("usePolicyEvents: failed to query event block:", start, err);
              return [];
            }

            const mid = Math.floor((start + end) / 2);
            const older = await queryLogsInRange(filter, start, mid);
            const newer = await queryLogsInRange(filter, mid + 1, end);
            return [...older, ...newer];
          }
        };

        const scanQuery = async ({ name, filter }: EventQuery) => {
          for (let end = currentBlock; end >= 0 && !cancelled; end -= CHUNK_SIZE) {
            const start = Math.max(0, end - CHUNK_SIZE + 1);
            const logs = await queryLogsInRange(filter, start, end);
            if (logs.length > 0) {
              const nextEvents = await Promise.all(
                logs.map(async (log) => toActivityEvent(name, log, await resolveTimestamp(log.blockNumber)))
              );
              if (!cancelled) {
                setEvents((prev) => mergeEvents(prev, nextEvents));
              }
            }
          }
        };

        await Promise.all(eventQueries.map(scanQuery));
      } catch (err) {
        console.warn("usePolicyEvents: failed to backfill past events:", err);
      }

      // 2) Live: keep listening for new events from here on.
      const liveOwnerFilters = OWNER_EVENT_NAMES.map((name) => ({
        name,
        filter: contract!.filters[name](null, owner),
      }));
      const livePolicyFilters = selectedPolicyIds.flatMap((policyId) =>
        POLICY_EVENT_NAMES.map((name) => ({
          name,
          filter: contract!.filters[name](policyId),
        }))
      );

      for (const { name, filter } of [...liveOwnerFilters, ...livePolicyFilters]) {
        const handler = (...args: any[]) => {
          const log = args[args.length - 1] as EventLog;
          const ts = Math.floor(Date.now() / 1000);
          setEvents((prev) => [toActivityEvent(name, log, ts), ...prev]);
        };
        contract.on(filter, handler);
        listeners.push({ filter, handler });
      }
    })();

    return () => {
      cancelled = true;
      if (contract) {
        for (const { filter, handler } of listeners) {
          contract.off(filter, handler);
        }
      }
    };
  }, [owner, isCorrectNetwork, policyIdKey]);

  return events;
}
