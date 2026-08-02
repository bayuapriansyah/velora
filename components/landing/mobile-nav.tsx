"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m, MotionConfig } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export function MobileNav() {
  return (
    <MotionConfig reducedMotion="user">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface/60 text-ink backdrop-blur-md transition-colors hover:text-accent md:hidden"
          >
            <Menu size={18} strokeWidth={2} />
          </button>
        </Dialog.Trigger>

        <AnimatePresence>
          <Dialog.Portal>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <m.div
                className="fixed inset-x-0 top-0 z-[70] flex flex-col border-b border-hairline bg-surface/90 px-6 pb-8 pt-24 backdrop-blur-2xl md:hidden"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ label, href }) => (
                    <Dialog.Close asChild key={href}>
                      <Link
                        href={href}
                        className="rounded-xl px-4 py-3 text-base font-medium text-ink transition-colors hover:bg-white/[0.06] hover:text-accent"
                      >
                        {label}
                      </Link>
                    </Dialog.Close>
                  ))}
                </nav>

                <div className="mt-6 border-t border-hairline pt-6">
                  <Dialog.Close asChild>
                    <Link
                      href="/dashboard"
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      Launch App
                    </Link>
                  </Dialog.Close>
                </div>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="absolute right-6 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline text-ink transition-colors hover:text-accent"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </Dialog.Close>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        </AnimatePresence>
      </Dialog.Root>
    </MotionConfig>
  );
}
