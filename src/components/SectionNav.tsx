"use client";

import { useEffect, useState } from "react";

interface Props {
  sections: { id: string; title: string }[];
}

/**
 * Sticky table of contents for a case study. Highlights the section being
 * read (the one crossing the upper third of the screen).
 */
export default function SectionNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sections" className="sticky top-24 hidden sm:block">
      <ol className="space-y-2 text-xs uppercase tracking-[0.12em]">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`flex gap-3 transition-colors duration-300 ${
                active === section.id ? "text-foreground" : "text-foreground-secondary/60 hover:text-foreground-secondary"
              }`}
            >
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span
                className={`transition-transform duration-300 ${active === section.id ? "translate-x-1" : ""}`}
              >
                {section.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
