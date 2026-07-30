import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

export async function GET() {
  try {
    const envPath = join(process.cwd(), "agent", ".env");
    const envConfig = dotenv.parse(readFileSync(envPath));
    const { RPC_URL, AGENT_PRIVATE_KEY } = envConfig;

    if (!RPC_URL || !AGENT_PRIVATE_KEY) {
      return NextResponse.json({ error: "Missing RPC_URL or AGENT_PRIVATE_KEY" }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);

    return NextResponse.json({
      address: wallet.address,
      balance: balance.toString(),
      balanceBot: ethers.formatEther(balance),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
