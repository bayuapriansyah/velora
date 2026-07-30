// Deployed Velora.sol addresses, keyed by chainId.
// Fill in VELORA_ADDRESS after deploying via Remix and verifying on the BOT Chain explorer.

export const VELORA_ADDRESSES: Record<number, `0x${string}`> = {
  968: "0xe038d1F476ecdd4Af7dfd52e1d65e6F3774eA3c0",
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