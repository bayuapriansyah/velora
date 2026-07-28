import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import VeloraAbi from "@/contracts/Velora.abi.json";
import { getVeloraAddress } from "@/contracts/addresses";

export function getEthereum(): any | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum;
}

export function getProvider(): BrowserProvider {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not found. Install MetaMask to use Velora.");
  }
  return new BrowserProvider(ethereum);
}

export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = getProvider();
  return provider.getSigner();
}

export async function getVeloraContract(signerOrProvider: JsonRpcSigner | BrowserProvider) {
  const network = await (signerOrProvider instanceof BrowserProvider
    ? signerOrProvider.getNetwork()
    : signerOrProvider.provider!.getNetwork());
  const address = getVeloraAddress(Number(network.chainId));
  return new Contract(address, VeloraAbi, signerOrProvider);
}
