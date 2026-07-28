// Deployed Velora.sol addresses, keyed by chainId.
// Fill in VELORA_ADDRESS after deploying via Remix and verifying on the BOT Chain explorer.

export const VELORA_ADDRESSES: Record<number, `0x${string}`> = {
  968: "0x1893bd849B656fE9eBFf8392340C30FE04268C37",
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