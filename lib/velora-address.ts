import { getVeloraAddress } from "@/contracts/addresses";

export function resolveVeloraAddress(chainId: number): `0x${string}` {
  return getVeloraAddress(chainId);
}
