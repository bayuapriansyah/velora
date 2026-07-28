"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getEthereum } from "@/lib/ethers";
import { BOT_CHAIN, switchToBotChain } from "@/lib/network";

interface WalletState {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
}

let globalState: WalletState = {
  account: null,
  chainId: null,
  isConnecting: false,
  isCorrectNetwork: false,
  error: null,
};

const listeners = new Set<(state: WalletState) => void>();

function setGlobalState(update: Partial<WalletState> | ((s: WalletState) => WalletState)) {
  if (typeof update === "function") {
    globalState = update(globalState);
  } else {
    globalState = { ...globalState, ...update };
  }
  listeners.forEach((l) => l(globalState));
}

let isRefreshing = false;

async function performRefresh() {
  if (isRefreshing) return;
  if (typeof window !== "undefined" && localStorage.getItem("walletDisconnected") === "true") {
    setGlobalState({ account: null, chainId: null, isConnecting: false, isCorrectNetwork: false, error: null });
    return;
  }
  isRefreshing = true;
  try {
    const ethereum = getEthereum();
    if (!ethereum) return;
    const provider = new BrowserProvider(ethereum);
    const accounts = await provider.send("eth_accounts", []);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    setGlobalState({
      account: accounts[0] ?? null,
      chainId,
      isCorrectNetwork: chainId === BOT_CHAIN.chainIdDecimal,
      error: null,
    });
  } catch (err) {
    // Ignore refresh errors
  } finally {
    isRefreshing = false;
  }
}

// Setup Ethereum event listeners only once
if (typeof window !== "undefined") {
  const ethereum = getEthereum();
  if (ethereum) {
    ethereum.on?.("accountsChanged", performRefresh);
    ethereum.on?.("chainChanged", performRefresh);
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    performRefresh();
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setGlobalState({ error: "MetaMask not found. Install it to use Velora." });
      return;
    }
    setGlobalState({ isConnecting: true, error: null });
    try {
      const provider = new BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      await switchToBotChain(ethereum);
      if (typeof window !== "undefined") {
        localStorage.removeItem("walletDisconnected");
      }
      await performRefresh();
    } catch (err: any) {
      setGlobalState({ error: err?.message ?? "Failed to connect wallet.", isConnecting: false });
    } finally {
      setGlobalState({ isConnecting: false });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("walletDisconnected", "true");
    }
    setGlobalState({ account: null, chainId: null, isConnecting: false, isCorrectNetwork: false, error: null });
  }, []);

  return { ...state, connect, disconnect };
}
