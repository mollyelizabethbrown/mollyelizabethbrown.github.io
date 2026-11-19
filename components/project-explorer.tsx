"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useUrlFilters } from "@/components/use-url-filters";
import { yearRange } from "@/lib/format";
import type { Project } from "@/lib/types";

type ThemeOpt = { id: string; short: string };
const KEYS = ["q", "theme", "status"] as const;
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ProjectExplorer({ projects, themes }: { projects: Project[]; themes: ThemeOpt[] }) {
  const { values, update } = useUrlFilters(KEYS);
  const { q, theme, status } = values;

  const index = useMemo(
    () => projects.map((p) => ({ p, hay: fold([p.title, p.abstract, p.funder, p.program ?? "", p.role, p.leadPI ?? "", ...p.collaborators, ...p.geography, String(p.periodStart), String(p.periodEnd ?? "")].join(" ")) })),
    [projects],
  );
  const rows = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    return index
      .filter(({ p, hay }) => terms.every((t) => hay.includes(t)) && (!theme || p.themes.includes(theme as never)) && (!status || p.status === status))
      .map(({ p }) => p);
  }, [index, q, theme, status]);
  const themeName = Object.fromEntries(themes.map((t) => [t.id, t.short]));

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-stone pb-8" role="group" aria-label="Filter projects">
        <div className="max-w-xl">
          <label htmlFor="proj-search" className="kicker">Search projects</label>
          <input
            id="proj-search"
            type="search"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Title, funder, partner, country…"
            className="mt-3 w-full border-0 border-b border-pine/60 bg-transparent px-0 py-2 font-serif text-lg placeholder:text-muted/70 focus:border-pine focus:ring-0"
          />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={!theme} onClick={() => update({ theme: "" })}>All themes</button>
            {themes.map((t) => (
              <button key={t.id} type="button" className="chip" aria-pressed={theme === t.id} onClick={() => update({ theme: theme === t.id ? "" : t.id })}>{t.short}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {[["", "All"], ["active", "Active"], ["completed", "Completed"]].map(([v, l]) => (
              <button key={l} type="button" className="chip" aria-pressed={status === v} onClick={() => update({ status: v })}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">{rows.length} {rows.length === 1 ? "project" : "projects"}</p>

      <ol className="mt-4 divide-y divide-stone border-b border-stone">
        {rows.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}/`} className="group grid gap-3 py-7 md:grid-cols-12 md:gap-8">
              <span className="text-sm text-muted md:col-span-2">
                <span className="block font-serif text-lg text-gold-ink">{yearRange(p.periodStart, p.periodEnd)}</span>
                <span className={`mt-1 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.14em] ${p.status === "active" ? "text-forest" : ""}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${p.status === "active" ? "bg-forest" : "bg-stone"}`} />
                  {p.status === "active" ? "Active" : "Completed"}
                </span>
              </span>
              <span className="md:col-span-7">
                <span className="block font-serif text-[1.35rem] leading-snug text-pine">
                  {p.title}{p.flagship && <span className="ml-2 align-middle text-[0.65rem] font-sans uppercase tracking-[0.14em] text-gold-ink">Flagship</span>}
                </span>
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
