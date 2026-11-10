"use client";

import { useEffect, useState } from "react";

/**
 * The random parts of the 404: the stars and what the dung ball has picked
 * up. Both are drawn fresh on every page load, in the browser (the page
 * itself is pre-rendered, so anything random on the server would be the
 * same for everyone). They appear just after mount, so hydration agrees.
 */
function useFreshEachLoad<T>(make: () => T): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const timeout = setTimeout(() => setValue(make()));
    return () => clearTimeout(timeout);
    // Once per load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * The night sky above the horizon: dung beetles steer by the Milky Way.
 * About a third of the stars gather in a faint diagonal band, at a random
 * slant each time; the rest are spread across the sky.
 */
export function NightSky() {
  const stars = useFreshEachLoad(() => {
    const rise = between(55, 85); // how steeply the band climbs, in %
    const start = between(70, 95);
    return Array.from({ length: 130 }, (_, i) => {
      const inBand = i % 3 === 0;
      const t = Math.random();
      const bright = Math.random() > 0.9;
      return {
        x: inBand ? t * 100 : Math.random() * 100,
        y: inBand ? start - t * rise + between(-8, 8) : Math.random() * 98,
        size: bright ? 2.5 : inBand ? between(1, 1.8) : between(1, 2.2),
        bright,
        delay: Math.random() * 5,
        duration: between(2.5, 6),
      };
    });
  });
  return (
    <>
      {stars?.map((star, i) => (
        <span
          key={i}
          className={`nf-star absolute rounded-full bg-foreground ${
            star.bright
              ? "shadow-[0_0_6px_1px_currentColor] text-foreground"
              : ""
          }`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </>
  );
}

/** The ball's hollow: centre and inner radius (the ring's inner edge). */
const CX = 300;
const CY = 129;
const HOLLOW = 41.5;

type Item = {
  kind: "twig" | "leaf";
  x: number;
  y: number;
  angle: number;
  scale: number;
};

/** A random point at most `r` from the hollow's centre. */
function pointWithin(r: number) {
  const a = Math.random() * Math.PI * 2;
  const d = Math.sqrt(Math.random()) * r;
  return { x: CX + d * Math.cos(a), y: CY + d * Math.sin(a) };
}

/**
 * What the ball picked up along the way, inside the hollow of the zero:
 * one twig, one leaf and a scatter of sand, placed and
 * turned at random on each load. Lives inside the rolling group, so it
 * turns with the ball.
 */
export function BallDebris() {
  const debris = useFreshEachLoad(() => {
    const items: Item[] = [];
    for (const kind of ["twig", "leaf"] as const) {
      // Room for the whole twig or leaf inside the hollow, apart from the others.
      for (let tries = 0; tries < 40; tries++) {
        const p = pointWithin(HOLLOW - 15);
        if (items.every((o) => Math.hypot(o.x - p.x, o.y - p.y) > 17)) {
          items.push({
            kind,
            ...p,
            angle: between(0, 360),
            scale: between(0.85, 1.15),
          });
          break;
        }
      }
    }
    const sand: { x: number; y: number; r: number }[] = [];
    const count = Math.round(between(14, 24));
    for (let tries = 0; sand.length < count && tries < 400; tries++) {
      const p = pointWithin(HOLLOW - 4);
      if (items.every((o) => Math.hypot(o.x - p.x, o.y - p.y) > 10)) {
        sand.push({
          ...p,
          r: [0.7, 0.9, 1.1, 1.3][Math.floor(Math.random() * 4)],
        });
      }
    }
    return { items, sand };
  });
  if (!debris) return null;
  return (
    <g className="text-[var(--boulder-500)]">
      <g className="fill-current" opacity="0.7">
        {debris.sand.map((grain, i) => (
          <circle key={i} cx={grain.x} cy={grain.y} r={grain.r} />
        ))}
      </g>
      {debris.items.map((item, i) => (
        <g
          key={i}
          transform={`translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.scale})`}
        >
          {item.kind === "twig" ? (
            // A twig with a little fork.
            <path
              d="M-12 0 L12 0 M4 0 L10 -5"
              className="stroke-current"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // A leaf, with its vein.
            <>
              <path d="M-8 0 Q-2 -6 8 0 Q-2 6 -8 0Z" className="fill-current" />
              <path
                d="M-7 0 L7 0"
                className="stroke-background"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      ))}
    </g>
  );
}
