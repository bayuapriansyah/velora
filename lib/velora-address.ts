import { getVeloraAddress } from "@/contracts/addresses";

export const VELORA_ADDRESS_STORAGE_KEY = "velora.contractAddress";

export function isValidContractAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function getConfiguredVeloraAddress(): `0x${string}` | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(VELORA_ADDRESS_STORAGE_KEY);
  if (!stored) return null;
  const trimmed = stored.trim();
  return isValidContractAddress(trimmed) ? trimmed : null;
}

export function setConfiguredVeloraAddress(address: `0x${string}` | null): void {
  if (typeof window === "undefined") return;
  if (address) {
    window.localStorage.setItem(VELORA_ADDRESS_STORAGE_KEY, address);
  } else {
    window.localStorage.removeItem(VELORA_ADDRESS_STORAGE_KEY);
  }
}

export function resolveVeloraAddress(chainId: number): `0x${string}` {
  return getConfiguredVeloraAddress() ?? getVeloraAddress(chainId);
}
