"use client";

import { useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

/** The green "online" dot. */
export function Online() {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full bg-[oklch(0.62_0.15_150)] shadow-[0_0_0_3px_oklch(0.62_0.15_150/0.18)]"
    />
  );
}

/** The time where Jordi is, ticking. Empty until mounted. */
function useLocalTime(timeZone: string): string {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(format.format(new Date()));
    const first = setTimeout(tick);
    const interval = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [timeZone]);
  return time;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-label text-xs text-foreground-secondary">{label}</dt>
      <dd className="mt-1 text-base">{children}</dd>
    </div>
  );
}

interface Props {
  name: string;
  title: string;
  /** "Lead Product Designer at Veriff", if there's a current role. */
  now?: string;
  timeZone: string;
  city: string;
  email: string;
  links: { label: string; href: string }[];
}

/**
 * Who's answering: status, a big hello with the first name, what I do and the job
 * right now in one line, and the time in Barcelona, with the links at the
 * foot. Sits on the same ground as the chat, with no fill or rule of its own.
 */
export default function ProfileCard({ name, title, now, timeZone, city, email, links }: Props) {
  const localTime = useLocalTime(timeZone);
  const firstName = name.split(" ")[0];
  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-10 pt-[2.375rem] pb-8">
      <p className="flex items-center gap-2 text-sm">
        <Online />
        Online · answers instantly
      </p>
      <h1 className="text-6xl xl:text-7xl font-bold leading-[0.92] tracking-[-0.035em]">
        Hi, I&apos;m
        <br />
        {firstName}.
      </h1>
      {/* One line, no label: the kind of work, then the job right now. */}
      <p className="-mt-2 max-w-[28rem] text-base leading-[1.6]">
        {now ? `${title}, currently ${now}.` : title}
      </p>
      <dl className="space-y-4">
        <Fact label="Local time">
          <span className="tabular-nums">{localTime || "--:--"}</span> in {city}
        </Fact>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6 text-xs text-foreground-secondary">
        <a href={`mailto:${email}`} className="hover:text-foreground truncate">
          {email}
        </a>
        <div className="flex items-center gap-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {link.label}
            </a>
          ))}
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
