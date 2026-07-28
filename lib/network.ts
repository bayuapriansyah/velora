// BOT Chain network parameters — sourced from https://dev-docs.botchain.ai
// Default here is Testnet (chainId 968), since that's what hackathons typically use
// with the tBOT faucet. If your event uses Mainnet instead, swap the values below
// for the commented-out Mainnet block.

export const BOT_CHAIN = {
  chainIdHex: "0x3C8", // Testnet = 968
  chainIdDecimal: 968,
  chainName: "BOT Chain Testnet",
  nativeCurrency: {
    name: "tBOT",
    symbol: "tBOT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.bohr.life"],
  blockExplorerUrls: ["https://scan.bohr.life"], // verify this against dev-docs before demo day

  // --- Mainnet values, if your event runs on BOT Chain Mainnet instead ---
  // chainIdHex: "0x2A5",       // 677
  // chainIdDecimal: 677,
  // chainName: "BOT Chain Mainnet",
  // nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  // rpcUrls: ["https://rpc.botchain.ai"],
  // blockExplorerUrls: ["https://scan.botchain.ai"],
};

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