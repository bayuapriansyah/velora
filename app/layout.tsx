import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Velora — Delegate tasks, not your wallet.",
  description:
    "Safely authorize AI agents through programmable blockchain policies. The smart contract holds the budget, enforces the rules, and is the single source of truth.",
  openGraph: {
    title: "Velora — Delegate tasks, not your wallet.",
    description: "Safely authorize AI agents through programmable blockchain policies.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
