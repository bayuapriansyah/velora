"use client";

import { useCallback, useMemo } from "react";
import { Contract, parseEther } from "ethers";
import { getProvider, getSigner, getVeloraContract } from "@/lib/ethers";
import { ActionType, Policy } from "@/types/policy";

function mapPolicy(raw: any): Policy {
  return {
    id: raw.id,
    owner: raw.owner,
    name: raw.name,
    remainingBudget: raw.remainingBudget,
    totalBudget: raw.totalBudget,
    allowedDestination: raw.allowedDestination,
    allowedAction: Number(raw.allowedAction),
    expiration: raw.expiration,
    maxExecutions: raw.maxExecutions,
    executionCount: raw.executionCount,
    status: Number(raw.status),
    amountPerExecution: raw.amountPerExecution ?? 0n,
    paymentInterval: raw.paymentInterval ?? 0n,
    lastExecutionTime: raw.lastExecutionTime ?? 0n,
  };
}

export function useVeloraContract() {
  const readContract = useCallback(async (): Promise<Contract> => {
    const provider = getProvider();
    return getVeloraContract(provider);
  }, []);

  const writeContract = useCallback(async (): Promise<Contract> => {
    const signer = await getSigner();
    return getVeloraContract(signer);
  }, []);

  const createPolicy = useCallback(
    async (params: {
      name: string;
      allowedDestination: string;
      allowedAction: ActionType;
      expiration: number; // unix seconds
      maxExecutions: number;
      amountPerExecution: string;
      paymentInterval: number;
      depositWei: bigint;
    }) => {
      const contract = await writeContract();
      const amountPerExecWei = parseEther(params.amountPerExecution || "0");
      const paymentIntervalSec = BigInt(params.paymentInterval);
      
      const tx = await contract.createPolicy(
        params.name,
        params.allowedDestination,
        params.allowedAction,
        params.expiration,
        params.maxExecutions,
        amountPerExecWei,
        paymentIntervalSec,
        { value: params.depositWei }
      );
      return tx.wait();
    },
    [writeContract]
  );

  const executeRequest = useCallback(
    async (policyId: bigint, amountWei: bigint, destination: string, action: ActionType) => {
      const contract = await writeContract();
      const tx = await contract.executeRequest(policyId, amountWei, destination, action);
      return tx.wait();
    },
    [writeContract]
  );

  const cancelPolicy = useCallback(
    async (policyId: bigint) => {
      const contract = await writeContract();
      const tx = await contract.cancelPolicy(policyId);
      return tx.wait();
    },
    [writeContract]
  );

  const withdrawRemainingBudget = useCallback(
    async (policyId: bigint) => {
      const contract = await writeContract();
      const tx = await contract.withdrawRemainingBudget(policyId);
      return tx.wait();
    },
    [writeContract]
  );

  const getPolicy = useCallback(
    async (policyId: bigint): Promise<Policy> => {
      const contract = await readContract();
      const raw = await contract.getPolicy(policyId);
      return mapPolicy(raw);
    },
    [readContract]
  );

  const getPoliciesByOwner = useCallback(
    async (owner: string): Promise<bigint[]> => {
      const contract = await readContract();
      return contract.getPoliciesByOwner(owner);
    },
    [readContract]
  );

  return useMemo(
    () => ({
      createPolicy,
      executeRequest,
      cancelPolicy,
      withdrawRemainingBudget,
      getPolicy,
      getPoliciesByOwner,
      readContract,
      writeContract,
    }),
    [createPolicy, executeRequest, cancelPolicy, withdrawRemainingBudget, getPolicy, getPoliciesByOwner, readContract, writeContract]
  );
}
