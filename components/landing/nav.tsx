"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-black/[0.07] shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_32px_rgba(0,0,0,0.06)]"
          : "bg-white/65 backdrop-blur-md border-b border-black/[0.05]"
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between gap-8">

        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span
            className="
              flex h-9 w-9 items-center justify-center rounded-xl
              bg-accent text-white
              shadow-[0_0_14px_rgba(91,91,246,0.35)]
              group-hover:shadow-[0_0_22px_rgba(91,91,246,0.55)]
              transition-shadow duration-300
            "
          >
            <Shield size={16} strokeWidth={2.5} />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink group-hover:text-accent transition-colors duration-200">
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
                text-sm font-medium text-muted
                hover:text-ink hover:bg-black/[0.04]
                transition-all duration-150
              "
            >
              {label}
            </a>
          ))}

          {/* Divider */}
          <div className="w-px h-4 bg-hairline mx-2" />
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Divider — desktop only */}
          <div className="hidden sm:block w-px h-4 bg-hairline mx-1" />

          {/* Launch App CTA */}
          <Link
            href="/dashboard"
            className="
              inline-flex items-center gap-2
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
        </div>

      </div>
    </motion.header>
  );
}
