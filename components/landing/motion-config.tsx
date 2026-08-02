"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

export function LandingMotionConfig({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
