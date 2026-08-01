// Deployed Velora.sol addresses, keyed by chainId.
// Fill in VELORA_ADDRESS after deploying via Remix and verifying on the BOT Chain explorer.

export const VELORA_ADDRESSES: Record<number, `0x${string}`> = {
  968: "0xACA2a171D9Aa41Cdeb9109ed22C86fC6B76099D8",
  677: "0xcaE9f3569486094b86Fc8b85024050B58815ddFe",
};

export function getVeloraAddress(chainId: number): `0x${string}` {
  const addr = VELORA_ADDRESSES[chainId];
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Velora is not deployed on chain ${chainId} yet.`
    );
  }
  return addr;
}