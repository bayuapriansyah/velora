import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import VeloraAbi from "@/contracts/Velora.abi.json";
import { resolveVeloraAddress } from "@/lib/velora-address";

let sdkProvider: any | undefined;

export function getEthereum(): any | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum ?? sdkProvider;
}

export async function getMetaMaskSDKProvider(): Promise<any | undefined> {
  if (typeof window === "undefined") return undefined;
  if ((window as any).ethereum) return (window as any).ethereum;
  if (sdkProvider) return sdkProvider;
  try {
    const { MetaMaskSDK } = await import("@metamask/sdk");
    const sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "Velora",
        url: window.location.origin,
      },
      useDeeplink: true,
      checkInstallationImmediately: false,
      enableAnalytics: false,
    });
    sdkProvider = sdk.getProvider();
    return sdkProvider;
  } catch {
    return undefined;
  }
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

export async function getBalance(address: string): Promise<bigint> {
  const provider = getProvider();
  return provider.getBalance(address);
}

export async function getVeloraContract(signerOrProvider: JsonRpcSigner | BrowserProvider) {
  const network = await (signerOrProvider instanceof BrowserProvider
    ? signerOrProvider.getNetwork()
    : signerOrProvider.provider!.getNetwork());
  const address = resolveVeloraAddress(Number(network.chainId));
  return new Contract(address, VeloraAbi, signerOrProvider);
}
