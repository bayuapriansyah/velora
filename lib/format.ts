import { formatEther, parseEther } from "ethers";

export function formatBot(wei: bigint, maxDecimals = 4): string {
  const asString = formatEther(wei);
  const [whole, decimal = ""] = asString.split(".");
  const trimmed = decimal.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function botToWei(bot: string): bigint {
  return parseEther(bot || "0");
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export function formatTimestamp(unixSeconds: bigint | number): string {
  const ms = Number(unixSeconds) * 1000;
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(fromNowSeconds: bigint | number): string {
  const seconds = Number(fromNowSeconds) - Math.floor(Date.now() / 1000);
  if (seconds <= 0) return "Expired";
  const hours = Math.floor(seconds / 3600);
  if (hours < 1) return `${Math.max(1, Math.floor(seconds / 60))}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}
