"use client";

import { useEffect, useRef } from "react";

const GAP = 18; // distance between dots, px
const BASE = 1.1; // dot radius at rest, px
const REACH = 130; // cursor influence radius, px

/**
 * A field of fine dots, after the speaker grilles of Dieter Rams' Braun
 * radios. It breathes slowly on its own; dots near the pointer swell and
 * darken. Drawn on a canvas in the current text colour. Pauses when off
 * screen, and stays still for visitors who prefer reduced motion.
 */
export default function DotGrille({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dots: { x: number; y: number; scale: number }[] = [];
    let pointer = { x: -9999, y: -9999 };
    let frame = 0;
    let visible = true;
    let colour = "#000";

    const readColour = () => {
      colour = getComputedStyle(canvas).color;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) dots.push({ x, y, scale: 1 });
      }
      readColour();
      draw(performance.now());
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colour;
      const t = time / 1000;
      for (const dot of dots) {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);
        const near = Math.max(0, 1 - distance / REACH);
        const breathe = reduceMotion ? 0 : Math.sin(t * 0.9 + dot.x * 0.018 + dot.y * 0.012) * 0.22;
        const target = 1 + breathe + near * near * 2.4;
        dot.scale += (target - dot.scale) * 0.12;
        ctx.globalAlpha = Math.min(0.85, 0.2 + near * 0.55);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, BASE * dot.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduceMotion && visible && !frame) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (reduceMotion) draw(performance.now());
    };
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(canvas);
    // The theme switcher toggles the "dark" class: pick up the new colour.
    const themeObserver = new MutationObserver(readColour);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    start();

    return () => {
      stop();
      sizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none text-foreground ${className}`} />;
}
