import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

export async function GET() {
  try {
    const fromProcess: Record<string, string | undefined> = {
      RPC_URL: process.env.RPC_URL,
      AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY,
    };
    const hasProcessEnv = Boolean(fromProcess.RPC_URL && fromProcess.AGENT_PRIVATE_KEY);
    let fileEnv: Record<string, string> = {};
    if (!hasProcessEnv) {
      try {
        fileEnv = dotenv.parse(readFileSync(join(process.cwd(), "agent", ".env")));
      } catch {
        fileEnv = {};
      }
    }
    const RPC_URL = fromProcess.RPC_URL ?? fileEnv.RPC_URL;
    const AGENT_PRIVATE_KEY = fromProcess.AGENT_PRIVATE_KEY ?? fileEnv.AGENT_PRIVATE_KEY;

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
