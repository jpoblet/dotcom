"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Light / dark / system switcher. The inline script in layout.tsx applies
 * the saved theme before first paint; this keeps it in sync afterwards.
 * The menu opens upwards, since the switcher lives in the footer.
 */
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read the saved theme after hydration (localStorage isn't available on
  // the server, so reading it during render would mismatch).
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const timeout = setTimeout(() =>
      setTheme(saved === "light" || saved === "dark" ? saved : "system"),
    );
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!theme) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && media.matches),
      );
    apply();
    localStorage.setItem("theme", theme);
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  // Close the menu on outside taps/clicks and on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const Current = OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`-my-2 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-background hover:bg-background-inverse/10 rounded-full border transition-all duration-200 ${
          isOpen ? "border-background-inverse" : "border-background-inverse/10"
        }`}
      >
        <Current size={14} />
        <ChevronDown
          size={12}
          className={`hidden sm:block transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-background border border-background-inverse/10 rounded-lg shadow-lg py-2 min-w-[140px] animate-fade-in"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="menuitemradio"
              aria-checked={theme === value}
              disabled={theme === value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-background-secondary transition-colors disabled:text-foreground-secondary disabled:cursor-not-allowed"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
