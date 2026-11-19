"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useUrlFilters } from "@/components/use-url-filters";
import { yearRange } from "@/lib/format";
import type { Project } from "@/lib/types";

type ThemeOpt = { id: string; short: string };
const KEYS = ["theme", "status"] as const;

export function ProjectExplorer({ projects, themes }: { projects: Project[]; themes: ThemeOpt[] }) {
  const { values, update } = useUrlFilters(KEYS);
  const { theme, status } = values;
  const set = (k: (typeof KEYS)[number], v: string) => update({ [k]: v });

  const rows = useMemo(
    () => projects.filter((p) => (!theme || p.themes.includes(theme as never)) && (!status || p.status === status)),
    [projects, theme, status],
  );
  const themeName = Object.fromEntries(themes.map((t) => [t.id, t.short]));

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-stone pb-8 lg:flex-row lg:items-center lg:justify-between" role="group" aria-label="Filter projects">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={!theme} onClick={() => set("theme", "")}>All themes</button>
          {themes.map((t) => (
            <button key={t.id} type="button" className="chip" aria-pressed={theme === t.id} onClick={() => set("theme", theme === t.id ? "" : t.id)}>
              {t.short}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[["", "All"], ["active", "Active"], ["completed", "Completed"]].map(([v, l]) => (
            <button key={l} type="button" className="chip" aria-pressed={status === v} onClick={() => set("status", v)}>{l}</button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">{rows.length} {rows.length === 1 ? "project" : "projects"}</p>

      <ol className="mt-4 divide-y divide-stone border-b border-stone">
        {rows.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="group grid gap-3 py-7 md:grid-cols-12 md:gap-8">
              <span className="text-sm text-muted md:col-span-2">
                <span className="block font-serif text-lg text-gold-ink">{yearRange(p.periodStart, p.periodEnd)}</span>
                <span className={`mt-1 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.14em] ${p.status === "active" ? "text-forest" : ""}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${p.status === "active" ? "bg-forest" : "bg-stone"}`} />
                  {p.status === "active" ? "Active" : "Completed"}
                </span>
              </span>
              <span className="md:col-span-7">
                <span className="block font-serif text-[1.4rem] leading-snug text-pine transition-transform duration-500 group-hover:translate-x-1">{p.title}</span>
                <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted">{p.abstract}</span>
              </span>
              <span className="text-xs leading-relaxed text-muted md:col-span-3">
                <span className="block text-ink">{p.funder}</span>
                <span className="mt-1 block">{p.themes.map((t) => themeName[t]).filter(Boolean).join(" · ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
