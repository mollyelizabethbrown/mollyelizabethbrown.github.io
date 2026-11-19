import Link from "next/link";
import type { Publication } from "@/lib/types";

export const shortCite = (p: Publication) => {
  const first = p.authors[0]?.split(",")[0] ?? "";
  const etal = p.authors.length > 2 ? " et al." : p.authors.length === 2 ? ` & ${p.authors[1].split(",")[0]}` : "";
  return `${first}${etal} (${p.year})`;
};

/** Inline list of supporting publications, linked to their pages on this site. */
export function EvidenceRefs({ pubs, label = "Evidence", tone = "paper" }: { pubs: Publication[]; label?: string; tone?: "paper" | "pine" }) {
  if (!pubs.length) return null;
  return (
    <p className={`text-xs leading-relaxed ${tone === "pine" ? "text-mist" : "text-muted"}`}>
      <span className="font-semibold uppercase tracking-[0.12em]">{label}: </span>
      {pubs.map((p, i) => (
        <span key={p.id}>
          {i > 0 && "; "}
          <Link href={`/publications/${p.id}/`} className={`link-underline ${tone === "pine" ? "text-gold" : "text-gold-ink"}`}>
            {shortCite(p)}
          </Link>
          {p.container ? <span>, {p.container}</span> : null}
        </span>
      ))}
    </p>
  );
}
