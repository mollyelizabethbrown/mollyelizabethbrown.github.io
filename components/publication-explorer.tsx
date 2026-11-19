"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Authors } from "@/components/publication";
import { useUrlFilters } from "@/components/use-url-filters";
import { STATUS_LABEL, TYPE_GROUP, TYPE_LABEL, citationText, doiUrl, sourceLine, toBibtex } from "@/lib/format";
import type { Publication } from "@/lib/types";

type ThemeOpt = { id: string; short: string };

const GROUPS = ["Peer-reviewed articles", "Books", "Book chapters", "Conference papers", "Reports", "Other outputs"];

function fold(s: string) {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const KEYS = ["q", "theme", "type", "from", "to", "featured"] as const;

export function PublicationExplorer({ pubs, themes }: { pubs: Publication[]; themes: ThemeOpt[] }) {
  const { values, update: setParam, reset } = useUrlFilters(KEYS);
  const [q, setQ] = useState("");
  useEffect(() => setQ(values.q), [values.q]);
  const query = useDeferredValue(q);
  const theme = values.theme;
  const group = values.type;
  const from = Number(values.from) || 0;
  const to = Number(values.to) || 0;
  const featuredOnly = values.featured === "1";

  const years = useMemo(() => {
    const ys = pubs.map((p) => p.year);
    return { min: Math.min(...ys), max: Math.max(...ys), list: Array.from(new Set(ys)).sort((a, b) => b - a) };
  }, [pubs]);

  const index = useMemo(
    () => pubs.map((p) => ({ p, hay: fold([p.title, p.authors.join(" "), p.container ?? "", p.publisher ?? "", p.doi ?? "", String(p.year)].join(" ")) })),
    [pubs],
  );

  const rows = useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    return index
      .filter(({ p, hay }) =>
        terms.every((t) => hay.includes(t)) &&
        (!theme || p.themes.includes(theme as never)) &&
        (!group || TYPE_GROUP[p.type] === group) &&
        (!from || p.year >= from) &&
        (!to || p.year <= to) &&
        (!featuredOnly || p.featured),
      )
      .map(({ p }) => p);
  }, [index, query, theme, group, from, to, featuredOnly]);

  const byYear = useMemo(() => {
    const m = new Map<number, Publication[]>();
    for (const p of rows) m.set(p.year, [...(m.get(p.year) ?? []), p]);
    return Array.from(m.entries()).sort((a, b) => b[0] - a[0]);
  }, [rows]);

  const downloadBib = () => {
    const blob = new Blob([rows.map(toBibtex).join("\n\n") + "\n"], { type: "application/x-bibtex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "brown-publications.bib" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const filtersActive = Boolean(q || theme || group || from || to || featuredOnly);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      {/* Filters */}
      <aside className="lg:col-span-3" aria-label="Filter publications">
        <div className="space-y-8 lg:sticky lg:top-28">
          <div>
            <label htmlFor="pub-search" className="kicker">Search</label>
            <input
              id="pub-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => setParam({ q })}
              placeholder="Title, author, journal or DOI"
              className="mt-3 w-full border-0 border-b border-pine/60 bg-transparent px-0 py-2 font-serif text-lg placeholder:text-muted/70 focus:border-pine focus:ring-0"
            />
          </div>

          <fieldset>
            <legend className="kicker">Type</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={!group} onClick={() => setParam({ type: "" })}>All</button>
              {GROUPS.filter((g) => pubs.some((p) => TYPE_GROUP[p.type] === g)).map((g) => (
                <button key={g} type="button" className="chip" aria-pressed={group === g} onClick={() => setParam({ type: group === g ? "" : g })}>{g}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="kicker">Research theme</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={!theme} onClick={() => setParam({ theme: "" })}>All</button>
              {themes.map((t) => (
                <button key={t.id} type="button" className="chip" aria-pressed={theme === t.id} onClick={() => setParam({ theme: theme === t.id ? "" : t.id })}>{t.short}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="kicker">Years</legend>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <label className="sr-only" htmlFor="from">From year</label>
              <select id="from" value={from || ""} onChange={(e) => setParam({ from: e.target.value })} className="border-stone bg-transparent py-1.5 text-sm">
                <option value="">{years.min}</option>
                {years.list.slice().reverse().map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span aria-hidden>–</span>
              <label className="sr-only" htmlFor="to">To year</label>
              <select id="to" value={to || ""} onChange={(e) => setParam({ to: e.target.value })} className="border-stone bg-transparent py-1.5 text-sm">
                <option value="">{years.max}</option>
                {years.list.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={featuredOnly} onChange={(e) => setParam({ featured: e.target.checked ? "1" : "" })} className="h-4 w-4 accent-[#172D28]" />
            Selected publications only
          </label>

          {filtersActive && (
            <button type="button" className="link-underline text-sm text-gold-ink" onClick={() => { setQ(""); reset(); }}>
              Clear all filters
            </button>
          )}
        </div>
      </aside>

      {/* Results */}
      <div className="lg:col-span-9">
        <div className="flex flex-col gap-3 border-b border-pine pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-serif text-2xl text-pine">{rows.length}</span> of {pubs.length} publications
          </p>
          <button type="button" onClick={downloadBib} disabled={!rows.length} className="inline-flex items-center gap-2 self-start border border-pine px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-pine transition-colors hover:bg-pine hover:text-paper disabled:opacity-40">
            Export BibTeX ({rows.length})
          </button>
        </div>

        {rows.length === 0 && <p className="py-16 text-center font-serif text-xl text-muted">No publications match these filters.</p>}

        {byYear.map(([year, list]) => (
          <section key={year} aria-labelledby={`y-${year}`} className="grid gap-2 border-b border-stone py-6 md:grid-cols-[6rem_1fr] md:gap-8">
            <h2 id={`y-${year}`} className="font-serif text-3xl text-gold-ink md:sticky md:top-28 md:self-start">{year}</h2>
            <ol className="divide-y divide-stone/70">
              {list.map((p) => <PubRow key={p.id} p={p} />)}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function PubRow({ p }: { p: Publication }) {
  const [copied, setCopied] = useState<"" | "cite" | "bib">("");
  const copy = async (kind: "cite" | "bib") => {
    try {
      await navigator.clipboard.writeText(kind === "cite" ? citationText(p) : toBibtex(p));
      setCopied(kind);
      setTimeout(() => setCopied(""), 1800);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <li className="py-5 first:pt-0">
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">
        {TYPE_LABEL[p.type]}
        {p.status !== "published" && <span className="ml-2 text-gold-ink">{STATUS_LABEL[p.status]}</span>}
        {p.featured && <span className="ml-2 text-forest">· Selected</span>}
      </p>
      <h3 className="mt-1.5 font-serif text-[1.25rem] leading-snug text-pine">
        <Link href={`/publications/${p.id}`} className="link-underline">{p.title}</Link>
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted"><Authors authors={p.authors} max={10} /></p>
      <p className="mt-1 text-sm text-ink">{sourceLine(p)}</p>
      <details className="group mt-2 text-xs">
        <summary className="inline-flex cursor-pointer list-none items-center gap-4 text-gold-ink marker:hidden">
          {p.doi && (
            <a href={doiUrl(p.doi)} className="link-underline" rel="noopener" onClick={(e) => e.stopPropagation()}>doi:{p.doi}</a>
          )}
          <span className="link-underline">Cite <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span></span>
        </summary>
        <div className="mt-3 border-l-2 border-gold pl-4">
          <p className="font-serif text-sm leading-relaxed text-ink">{citationText(p)}</p>
          <div className="mt-2 flex gap-4">
            <button type="button" className="link-underline" onClick={() => copy("cite")}>{copied === "cite" ? "Copied" : "Copy citation"}</button>
            <button type="button" className="link-underline" onClick={() => copy("bib")}>{copied === "bib" ? "Copied" : "Copy BibTeX"}</button>
          </div>
        </div>
      </details>
    </li>
  );
}
