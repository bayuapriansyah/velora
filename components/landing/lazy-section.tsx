"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

type LazySectionProps = {
  loader: () => Promise<{ default: ComponentType }>;
  placeholderClass?: string;
};

export function LazySection({ loader, placeholderClass = "" }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [Section, setSection] = useState<ComponentType | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    loader().then((mod) => {
      if (alive) setSection(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, [inView, loader]);

  return (
    <div ref={ref} className={inView ? undefined : placeholderClass}>
      {Section ? <Section /> : null}
    </div>
  );
}
