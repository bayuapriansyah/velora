"use client";

import { LazySection } from "./lazy-section";

export function LandingSections() {
  return (
    <>
      <LazySection
        loader={() => import("./problem").then((m) => ({ default: m.Problem }))}
        placeholderClass="min-h-[620px] md:min-h-[560px]"
      />
      <LazySection
        loader={() => import("./solution").then((m) => ({ default: m.Solution }))}
        placeholderClass="min-h-[1250px] md:min-h-[860px]"
      />
      <LazySection
        loader={() => import("./how-it-works").then((m) => ({ default: m.HowItWorks }))}
        placeholderClass="min-h-[1150px] md:min-h-[860px]"
      />
      <LazySection
        loader={() => import("./policy-fields").then((m) => ({ default: m.PolicyFields }))}
        placeholderClass="min-h-[1600px] md:min-h-[900px]"
      />
      <LazySection
        loader={() => import("./architecture").then((m) => ({ default: m.Architecture }))}
        placeholderClass="min-h-[1150px] md:min-h-[960px]"
      />
      <LazySection
        loader={() => import("./features").then((m) => ({ default: m.Features }))}
        placeholderClass="min-h-[1550px] md:min-h-[980px] lg:min-h-[1200px]"
      />
      <LazySection
        loader={() => import("./demo-preview").then((m) => ({ default: m.DemoPreview }))}
        placeholderClass="min-h-[520px] md:min-h-[560px]"
      />
    </>
  );
}
