// BOT Chain network parameters — sourced from https://dev-docs.botchain.ai
// The app targets BOT Chain Mainnet (chainId 677). Testnet (968) values are
// kept below commented out in case you need to fall back to the tBOT faucet.

export const BOT_CHAIN = {
  chainIdHex: "0x2A5", // Mainnet = 677
  chainIdDecimal: 677,
  chainName: "BOT Chain Mainnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.botchain.ai"],
  blockExplorerUrls: ["https://scan.botchain.ai"],

  // --- Testnet values, if your event runs on BOT Chain Testnet instead ---
  // chainIdHex: "0x3C8",       // Testnet = 968
  // chainIdDecimal: 968,
  // chainName: "BOT Chain Testnet",
  // nativeCurrency: { name: "tBOT", symbol: "tBOT", decimals: 18 },
  // rpcUrls: ["https://rpc.bohr.life"],
  // blockExplorerUrls: ["https://scan.bohr.life"],
};

export function botScanLink(path: string): string {
  const base = BOT_CHAIN.blockExplorerUrls[0] ?? "https://scan.botchain.ai";
  const trimmed = path.replace(/^\/+/, "");
  return `${base}/${trimmed}`;
}

export async function switchToBotChain(ethereum: any) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT_CHAIN.chainIdHex }],
    });
  } catch (switchError: any) {
    // 4902 = chain not added to MetaMask yet
    if (switchError?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BOT_CHAIN.chainIdHex,
            chainName: BOT_CHAIN.chainName,
            nativeCurrency: BOT_CHAIN.nativeCurrency,
            rpcUrls: BOT_CHAIN.rpcUrls,
            blockExplorerUrls: BOT_CHAIN.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}
