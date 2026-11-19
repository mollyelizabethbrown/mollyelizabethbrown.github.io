import type { Publication, PublicationStatus, PublicationType } from "@/lib/types";

export const TYPE_LABEL: Record<PublicationType, string> = {
  "journal-article": "Journal article",
  "letter-commentary": "Letter / commentary",
  "magazine-article": "Magazine article",
  "book-review": "Book review",
  dataset: "Dataset",
  report: "Report",
  book: "Book",
  "book-chapter": "Book chapter",
  "conference-paper": "Conference paper",
  editorial: "Editorial",
  patent: "Patent",
};

/** Coarse groups used by the bibliography filter. */
export const TYPE_GROUP: Record<PublicationType, string> = {
  "journal-article": "Peer-reviewed articles",
  "letter-commentary": "Peer-reviewed articles",
  "book-review": "Other outputs",
  "magazine-article": "Other outputs",
  dataset: "Other outputs",
  report: "Reports",
  book: "Books",
  "book-chapter": "Book chapters",
  "conference-paper": "Conference papers",
  editorial: "Other outputs",
  patent: "Other outputs",
};

export const STATUS_LABEL: Record<PublicationStatus, string> = {
  published: "Published",
  "in-press": "In press",
  submitted: "Submitted",
  "in-review": "In review",
  pending: "Pending",
};

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

export const isBrown = (author: string) => /^brown,\s*m\.?\s*e\.?/i.test(author.trim());

export function authorList(authors: string[], max = 12): string {
  if (authors.length <= max) return authors.join(", ");
  return `${authors.slice(0, max).join(", ")}, et al. (${authors.length} authors)`;
}

/** Journal-style source line: "Container 12(3): 45–67" */
export function sourceLine(p: Publication): string {
  const parts: string[] = [];
  if (p.container) parts.push(p.container);
  let vol = p.volume ?? "";
  if (p.issue) vol += `(${p.issue})`;
  if (vol) parts.push(vol);
  let s = parts.join(" ");
  if (p.pages) s += `${s ? ": " : ""}${p.pages}`;
  if (p.type === "book" || p.type === "book-chapter" || p.type === "report") {
    const pub = [p.editors, p.publisher].filter(Boolean).join(". ");
    if (pub) s = [s, pub].filter(Boolean).join(". ");
  }
  return s;
}

export function citationText(p: Publication): string {
  const status = p.status !== "published" ? ` (${STATUS_LABEL[p.status]})` : "";
  const src = sourceLine(p);
  return `${p.authors.join(", ")} (${p.year}). ${p.title}.${src ? ` ${src}.` : ""}${p.doi ? ` https://doi.org/${p.doi}` : ""}${status}`;
}

const BIB_TYPE: Record<PublicationType, string> = {
  "journal-article": "article",
  "letter-commentary": "article",
  "magazine-article": "article",
  "book-review": "article",
  dataset: "misc",
  report: "techreport",
  book: "book",
  "book-chapter": "incollection",
  "conference-paper": "inproceedings",
  editorial: "article",
  patent: "misc",
};

const bibEscape = (s: string) => s.replace(/([{}&%$#_])/g, "\\$1");

/** Convert "Family, Initials." to BibTeX "Family, Initials." (already compatible) joined with " and ". */
export function toBibtex(p: Publication): string {
  const type = BIB_TYPE[p.type];
  const fields: [string, string | null | undefined][] = [
    ["title", p.title],
    ["author", p.authors.join(" and ")],
    ["year", String(p.year)],
    [type === "article" ? "journal" : type === "incollection" ? "booktitle" : type === "inproceedings" ? "booktitle" : "howpublished", type === "book" || type === "techreport" ? null : p.container],
    ["institution", type === "techreport" ? p.container ?? p.publisher : null],
    ["volume", p.volume],
    ["number", p.issue],
    ["pages", p.pages?.replace(/\s*[–-]\s*/, "--")],
    ["publisher", type !== "techreport" ? p.publisher : null],
    ["editor", p.editors],
    ["isbn", p.isbn],
    ["doi", p.doi],
    ["url", p.url],
    ["note", p.status !== "published" ? STATUS_LABEL[p.status] : null],
  ];
  const body = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = {${k === "url" || k === "doi" ? v : bibEscape(v as string)}}`)
    .join(",\n");
  return `@${type}{${p.id},\n${body}\n}`;
}

export const yearRange = (start: number, end: number | null) =>
  end === null ? `${start}–present` : start === end ? `${start}` : `${start}–${end}`;

export function formatMonthYear(ym: string): string {
  const [y, m] = ym.split("-");
  if (!m) return y;
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
