"use client";

import { useEffect, useRef } from "react";

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas;
    const cx = ctx;

    let width = window.innerWidth;
    let height = window.innerHeight;
    cv.width = width;
    cv.height = height;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isMobile = width < 768;
    const particleCount = isMobile ? 60 : 130;
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const spriteSize = isMobile ? 12 : 14;
    const particleSprite = document.createElement("canvas");
    particleSprite.width = spriteSize;
    particleSprite.height = spriteSize;
    const spriteCtx = particleSprite.getContext("2d");
    if (spriteCtx) {
      const center = spriteSize / 2;
      const gradient = spriteCtx.createRadialGradient(center, center, 0, center, center, center);
      gradient.addColorStop(0, "rgba(254,150,140,0.95)");
      gradient.addColorStop(0.35, "rgba(254,77,71,0.55)");
      gradient.addColorStop(1, "rgba(254,77,71,0)");
      spriteCtx.fillStyle = gradient;
      spriteCtx.fillRect(0, 0, spriteSize, spriteSize);
    }

    const mouse = { x: -9999, y: -9999 };
    let animId: number | undefined;
    let time = 0;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.45 + 0.25,
      });
    }

    function noise(x: number, y: number, t: number) {
      return (
        Math.sin(x * 0.012 + t) * Math.cos(y * 0.012 + t * 0.7) +
        Math.sin(x * 0.025 - t * 0.5) * Math.cos(y * 0.018 + t * 0.3) * 0.5
      );
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = width;
      cv.height = height;
    };

    if (supportsHover) {
      window.addEventListener("mousemove", onMouseMove);
    }
    window.addEventListener("resize", onResize);

    function drawFrame() {
      cx.clearRect(0, 0, width, height);

      // Subtle connection lines on desktop only
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90) {
              cx.beginPath();
              cx.moveTo(a.x, a.y);
              cx.lineTo(b.x, b.y);
              cx.strokeStyle = `rgba(254,77,71,${(1 - dist / 90) * 0.07})`;
              cx.lineWidth = 0.5;
              cx.stroke();
            }
          }
        }
      }

      for (const p of particles) {
        const n = noise(p.x, p.y, time);
        const angle = n * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.008;
        p.vy += Math.sin(angle) * 0.008;

        if (supportsHover) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * 0.06;
            p.vy += (dy / dist) * force * 0.06;
          }
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const glowR = p.size * 3.5;
        if (spriteCtx) {
          const drawSize = glowR * 2;
          cx.globalAlpha = p.alpha;
          cx.drawImage(particleSprite, p.x - glowR, p.y - glowR, drawSize, drawSize);
          cx.globalAlpha = 1;
        } else {
          cx.beginPath();
          cx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          cx.fillStyle = `rgba(254,77,71,${p.alpha * 0.45})`;
          cx.fill();
        }

        if (!isMobile) {
          cx.beginPath();
          cx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          cx.fillStyle = `rgba(254,150,140,${p.alpha})`;
          cx.fill();
        }
      }
    }

    // Initial static frame so the canvas is never blank while paused.
    drawFrame();

    if (reducedMotion) {
      return () => {
        if (supportsHover) {
          window.removeEventListener("mousemove", onMouseMove);
        }
        window.removeEventListener("resize", onResize);
      };
    }

    // Only animate while the landing hero is on screen and the tab is visible.
    // The canvas is position:fixed, so pausing when the hero leaves the viewport
    // (and on any non-landing page) stops the constant rAF repaint.
    let running = false;
    let docVisible = !document.hidden;
    let heroVisible = false;

    const hero = document.getElementById("hero");

    function start() {
      if (running) return;
      running = true;
      const step = () => {
        time += 0.002;
        drawFrame();
        animId = requestAnimationFrame(step);
      };
      step();
    }

    function stop() {
      running = false;
      if (animId !== undefined) cancelAnimationFrame(animId);
    }

    function sync() {
      if (docVisible && heroVisible) start();
      else stop();
    }

    const onVisibility = () => {
      docVisible = !document.hidden;
      sync();
    };

    const io = new IntersectionObserver(
      (entries) => {
        heroVisible = entries.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin: "30% 0px 30% 0px" }
    );

    if (hero) io.observe(hero);
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (supportsHover) {
        window.removeEventListener("mousemove", onMouseMove);
      }
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-1]"
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    />
  );
}
