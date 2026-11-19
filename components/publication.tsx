import Link from "next/link";
import { STATUS_LABEL, TYPE_LABEL, authorList, doiUrl, isBrown, sourceLine } from "@/lib/format";
import type { Publication } from "@/lib/types";

export function Authors({ authors, max = 12 }: { authors: string[]; max?: number }) {
  const shown = authors.slice(0, max);
  return (
    <>
      {shown.map((a, i) => (
        <span key={`${a}-${i}`}>
          {isBrown(a) ? <strong className="font-semibold text-ink">{a}</strong> : a}
          {i < shown.length - 1 ? ", " : ""}
        </span>
      ))}
      {authors.length > max && <span>, et al. ({authors.length} authors)</span>}
    </>
  );
}

/** Compact citation used in lists across the site. */
export function PublicationCitation({ pub, headingLevel = "h3" }: { pub: Publication; headingLevel?: "h3" | "h4" }) {
  const H = headingLevel;
  return (
    <article className="group grid gap-2 py-6 md:grid-cols-[5rem_1fr] md:gap-8">
      <p className="font-serif text-xl text-gold-ink md:pt-0.5">{pub.year}</p>
      <div>
        <H className="font-serif text-[1.3rem] leading-snug text-pine">
          <Link href={`/publications/${pub.id}`} className="link-underline">{pub.title}</Link>
        </H>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <Authors authors={pub.authors} max={8} />
        </p>
        <p className="mt-1 text-sm text-muted">
          <em className="not-italic text-ink">{sourceLine(pub)}</em>
          {pub.status !== "published" && <span className="chip ml-2">{STATUS_LABEL[pub.status]}</span>}
        </p>
        {pub.doi && (
          <p className="mt-2 text-xs">
            <a href={doiUrl(pub.doi)} className="link-underline text-gold-ink" rel="noopener">
              doi:{pub.doi}
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

export function PublicationMeta({ pub }: { pub: Publication }) {
  return (
    <span className="text-xs uppercase tracking-[0.14em] text-muted">
      {TYPE_LABEL[pub.type]}
      {pub.status !== "published" ? ` · ${STATUS_LABEL[pub.status]}` : ""}
    </span>
  );
}

export { authorList };
