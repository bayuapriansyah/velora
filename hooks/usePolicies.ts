"use client";

import { useCallback, useEffect, useState } from "react";
import { Policy } from "@/types/policy";
import { useVeloraContract } from "./useVeloraContract";

export function usePolicies(owner: string | null) {
  const { getPoliciesByOwner, getPolicy } = useVeloraContract();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!owner) {
      setPolicies([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const ids = await getPoliciesByOwner(owner);
      const loaded = await Promise.all(ids.map((id) => getPolicy(id)));
      // newest first
      setPolicies(loaded.reverse());
    } catch (err: any) {
      setError(err?.message ?? "Failed to load policies.");
    } finally {
      setIsLoading(false);
    }
  }, [owner, getPoliciesByOwner, getPolicy]);

  useEffect(() => {
    load();
  }, [load]);

  return { policies, isLoading, error, refresh: load };
}
