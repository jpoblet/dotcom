import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { RANGES, type Range } from "@/lib/admin-insights";

/**
 * The admin's building blocks, in the site's own language: DM Mono for
 * names and figures, hairline section heads like the Work panel's, ink-only
 * charts (one series each, so no colour key is needed), and the dark
 * tooltip of the chat's privacy note on hover.
 */

export function PageHead({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 font-mono text-xs text-foreground-secondary">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** The time range, as a row of pills; keeps the page's other filters. */
export function RangePicker({
  path,
  current,
  params = {},
}: {
  path: string;
  current: Range;
  params?: Record<string, string | undefined>;
}) {
  return (
    <nav aria-label="Time range" className="flex gap-1 rounded-full border border-background-inverse/10 p-1">
      {RANGES.map((range) => {
        const query = new URLSearchParams(
          Object.entries({ ...params, range: range.id as string }).filter(
            (e): e is [string, string] => Boolean(e[1]),
          ),
        );
        const active = range.id === current.id;
        return (
          <Link
            key={range.id}
            href={`${path}?${query}`}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              active
                ? "bg-background-inverse text-foreground-inverse"
                : "text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground"
            }`}
          >
            {range.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** A section title over a hairline, as in the Work panel, with an optional count or link. */
export function SectionHead({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <h2 className="flex items-baseline justify-between gap-4 border-b border-background-inverse/15 pb-3 text-xs font-medium">
      {title}
      {aside !== undefined && (
        <span className="font-mono font-normal tabular-nums text-foreground-secondary">{aside}</span>
      )}
    </h2>
  );
}

/** A quiet link for a section head: "See all ->". */
export function HeadLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group/link inline-flex items-center font-sans text-xs hover:text-foreground">
      {children}
      <ArrowUpRight size={13} aria-hidden="true" className="ml-0.5 transition-transform duration-200 group-hover/link:-translate-y-px group-hover/link:translate-x-px" />
    </Link>
  );
}

export const formatNumber = (n: number, digits = 0) =>
  n.toLocaleString("en-GB", { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const formatShare = (share: number) => `${Math.round(share * 100)}%`;

/** A headline figure, with the change against the previous period. */
export function Stat({
  label,
  value,
  change,
  note,
}: {
  label: string;
  value: string;
  change?: number | null;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-background-inverse/15 pt-4">
      <dt className="text-xs text-foreground-secondary">{label}</dt>
      <dd className="font-mono text-3xl font-medium tracking-tight tabular-nums">{value}</dd>
      {change === 0 ? (
        <dd className="text-xs text-foreground-secondary">No change on the period before</dd>
      ) : change !== undefined && change !== null ? (
        <dd className="flex items-center gap-0.5 font-mono text-xs text-foreground-secondary">
          {change > 0 ? <ArrowUpRight size={13} aria-hidden="true" /> : <ArrowDownRight size={13} aria-hidden="true" />}
          <span className="tabular-nums">
            {change > 0 ? "+" : "−"}
            {Math.abs(change)}%
          </span>
          <span className="ml-1 font-sans">vs the period before</span>
        </dd>
      ) : (
        note && <dd className="text-xs text-foreground-secondary">{note}</dd>
      )}
    </div>
  );
}

/** The dark hover label of a bar (the chat's privacy-note look). */
function Tip({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "start" | "end" }) {
  const position =
    align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-md bg-background-inverse px-2.5 py-1.5 text-xs text-background opacity-0 transition-opacity duration-150 group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100 ${position}`}
    >
      {children}
    </span>
  );
}

export type BarRow = {
  key: string;
  label: React.ReactNode;
  /** Shown before the label in mono, e.g. a country code. */
  code?: string;
  count: number;
  href?: string;
};

/** A ranked list with a bar under each row, scaled to the largest. */
export function RankedBars({
  rows,
  total,
  limit = 8,
  empty = "Nothing yet.",
}: {
  rows: BarRow[];
  total: number;
  limit?: number;
  empty?: string;
}) {
  const shown = rows.slice(0, limit);
  const max = Math.max(1, ...shown.map((r) => r.count));
  if (shown.length === 0) return <p className="mt-4 text-sm text-foreground-secondary">{empty}</p>;
  return (
    <ol className="mt-3">
      {shown.map((row) => {
        const body = (
          <>
            <span className="flex items-baseline justify-between gap-4 text-sm">
              <span className="flex min-w-0 items-baseline gap-2">
                {row.code && (
                  <span className="w-6 shrink-0 font-mono text-xs text-foreground-secondary">{row.code}</span>
                )}
                <span className="truncate">{row.label}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs tabular-nums">
                <span className="text-foreground-secondary">{total ? formatShare(row.count / total) : ""}</span>
                <span className="w-8 text-right">{row.count}</span>
              </span>
            </span>
            <span className="mt-1.5 block h-1 rounded-full bg-background-inverse/6">
              <span
                className="block h-full rounded-full bg-foreground/80 transition-[background-color] group-hover/row:bg-foreground"
                style={{ width: `${Math.max(row.count ? 1.5 : 0, (row.count / max) * 100)}%` }}
              />
            </span>
          </>
        );
        return (
          <li key={row.key}>
            {row.href ? (
              <Link href={row.href} className="group/row -mx-2 block rounded-md px-2 py-2 transition-colors hover:bg-background-inverse/4">
                {body}
              </Link>
            ) : (
              <div className="group/row py-2">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const shortDay = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDay = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
const monthName = (key: string) =>
  new Date(`${key}-15T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/** Vertical bars on a shared baseline, with a hover label on each. */
function Columns({
  points,
  labelOf,
  tipOf,
  axis,
  height = "h-40",
}: {
  points: { key: string; count: number }[];
  labelOf: (key: string) => string;
  tipOf: (key: string, count: number) => string;
  /** Indexes of the points to label under the axis. */
  axis: number[];
  height?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.count));
  // A rounded top on the scale: 1, 2, 5, 10, 20, 50...
  const step = [1, 2, 5].map((m) => m * 10 ** Math.floor(Math.log10(max))).find((s) => s >= max / 4) ?? max;
  const top = Math.max(step, Math.ceil(max / step) * step);
  return (
    <div className="mt-5">
      <div className={`relative ${height}`}>
        {/* Recessive gridlines: the top value and the middle. */}
        {[1, 0.5].map((at) => (
          <div key={at} className="absolute inset-x-0 border-t border-dashed border-background-inverse/10" style={{ bottom: `${at * 100}%` }}>
            <span className="absolute -top-2.5 right-0 bg-background pl-1.5 font-mono text-[0.75rem] tabular-nums text-foreground-secondary">
              {formatNumber(top * at, top * at < 1 ? 1 : 0)}
            </span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px] border-b border-background-inverse/20 pr-8">
          {points.map((p, i) => (
            <button
              key={p.key}
              type="button"
              aria-label={tipOf(p.key, p.count)}
              className="group/bar relative flex h-full min-w-0 flex-1 items-end focus:outline-none"
            >
              <span
                className="block w-full rounded-t-[4px] bg-foreground/80 transition-colors group-hover/bar:bg-foreground group-focus-visible/bar:bg-foreground"
                style={{ height: p.count ? `${Math.max(2, (p.count / top) * 100)}%` : 0 }}
              />
              <Tip align={i < 3 ? "start" : i > points.length - 4 ? "end" : "center"}>{tipOf(p.key, p.count)}</Tip>
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-2 mr-8 h-5 font-mono text-[0.75rem] text-foreground-secondary">
        {axis.map((i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap"
            style={{
              left: `${((i + 0.5) / points.length) * 100}%`,
              transform: i === 0 ? "none" : i === points.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {labelOf(points[i].key)}
          </span>
        ))}
      </div>
    </div>
  );
}

const plural = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`;

/** Questions per day (or per month, for long spans). */
export function Timeline({ points, monthly }: { points: { key: string; count: number }[]; monthly: boolean }) {
  const n = points.length;
  const ticks = n <= 1 ? [0] : n <= 8 ? points.map((_, i) => i) : [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];
  return (
    <Columns
      points={points}
      axis={[...new Set(ticks)]}
      labelOf={monthly ? monthName : shortDay}
      tipOf={(key, count) => `${monthly ? monthName(key) : longDay(key)}: ${plural(count, "question", "questions")}`}
    />
  );
}

/** Questions by hour of the day, in Madrid time. */
export function HourChart({ hours }: { hours: number[] }) {
  const pad = (h: number) => String(h).padStart(2, "0");
  return (
    <Columns
      height="h-28"
      points={hours.map((count, h) => ({ key: String(h), count }))}
      axis={[0, 6, 12, 18, 23]}
      labelOf={(key) => `${pad(Number(key))}:00`}
      tipOf={(key, count) => `${pad(Number(key))}:00–${pad(Number(key))}:59: ${plural(count, "question", "questions")}`}
    />
  );
}

/** A small "label · value" line, for lists like outcomes. */
export function KeyValues({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="mt-3 divide-y divide-background-inverse/8">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4 py-2 text-sm">
          <dt>{row.label}</dt>
          <dd className="font-mono text-xs tabular-nums text-foreground-secondary">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Country code -> English name ("ES" -> "Spain"). */
export function countryName(code: string) {
  if (!code || code === "unknown") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const SOURCE_LABELS: Record<string, string> = {
  typed: "Typed their own",
  starter: "Suggested starter",
  follow_up: "Follow-up chip",
  project_page: "From a project page",
};

export const OUTCOME_LABELS: Record<string, string> = {
  answered: "Answered",
  refusal: "Declined by safety filters",
  error: "Error",
  aborted: "Left before the reply finished",
  rate_limited: "Rate limited",
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });

/** A card shown under a reply: "project:medal" -> "Medal"; the others by name. */
export function cardLabel(key: string, projects: Map<string, string>) {
  if (key.startsWith("project:")) return projects.get(key.slice(8)) ?? key.slice(8);
  const names: Record<string, string> = { timeline: "Career timeline", cv: "CV", contact: "Contact card" };
  return names[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, " ");
}
