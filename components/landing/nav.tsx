"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <m.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_0_rgba(0,0,0,0.5),0_6px_32px_rgba(0,0,0,0.6)]"
          : "bg-black/50 backdrop-blur-md border-b border-white/[0.05]"
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between gap-8">

        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <Image src="/velora.png" alt="Velora Logo" width={96} height={68} sizes="48px" className="h-12 w-12 rounded-xl object-contain shadow-[0_0_14px_#0f0f14]" priority />
          <span className="text-base text-xl font-semibold tracking-tight text-ink group-hover:text-accent transition-colors duration-200">
            Velora
          </span>
        </Link>

        {/* ── Centre nav links ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="
                relative px-4 py-2 rounded-lg
                text-lg font-medium text-muted
                hover:text-ink hover:bg-white/[0.06]
                transition-all duration-150
              "
            >
              {label}
            </a>
          ))}

        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Launch App CTA — desktop only, mobile lives in the hamburger menu */}
          <Link
            href="/dashboard"
            className="
              hidden md:inline-flex items-center gap-2
              h-10 px-5 rounded-xl
              bg-accent text-white
              text-sm font-medium tracking-tight
              hover:bg-accent/80
              transition-all duration-200
              shadow-[0_1px_2px_rgba(17,17,20,0.2)]
            "
          >
            Launch App
          </Link>

          <MobileNav />
        </div>

      </div>
    </m.header>
  );
}
