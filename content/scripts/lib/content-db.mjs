/**
 * Shared helpers for writing to the content database (content/data/*.json).
 * Used by import-doi.mjs (command line) and content-from-issue.mjs (GitHub issue forms).
 */
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..", "..");
export const DATA = path.join(ROOT, "content", "data");
export const THEMES = ["earth-observation", "food-security", "climate-risk", "applications", "sustainable-food-systems"];
export const THEME_LABELS = {
  "Earth Observation and Environmental Change": "earth-observation",
  "Agriculture and Food Security": "food-security",
  "Climate Risk and Human Well-being": "climate-risk",
  "Earth Science Applications and Decision Support": "applications",
  "Sustainable Development and Resilient Food Systems": "sustainable-food-systems",
};

export const readData = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
export const writeData = (f, d) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2) + "\n", "utf8");
export const today = () => new Date().toISOString().slice(0, 10);

export const normalizeDoi = (raw) =>
  String(raw || "").trim().replace(/^doi:\s*/i, "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/[.\s]+$/, "");
export const isDoi = (d) => /^10\.\d{4,9}\/\S+$/.test(d);

export function slugify(s, max = 6) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/).filter(Boolean).slice(0, max).join("-");
}

/** Fetch Crossref metadata and build a publication record (not yet saved). Throws with a readable message. */
export async function publicationFromDoi(rawDoi, themes) {
  const doi = normalizeDoi(rawDoi);
  if (!isDoi(doi)) throw new Error(`“${rawDoi}” is not a DOI. A DOI starts with 10. — for example 10.1073/pnas.1905228116`);
  for (const t of themes) if (!THEMES.includes(t)) throw new Error(`Unknown theme “${t}”`);

  const all = [...readData("publications.refereed.json"), ...readData("publications.other.json")];
  const existing = all.find((p) => p.doi?.toLowerCase() === doi.toLowerCase());
  if (existing) throw new Error(`This DOI is already on the website: “${existing.title}” (${existing.year}).`);

  const res = await fetch(`https://api.crossref.org/works/${doi.split("/").map(encodeURIComponent).join("/")}`, {
    headers: { "User-Agent": "scholarly-website-content-import/1.0" },
  });
  if (res.status === 404) throw new Error(`Crossref does not know the DOI ${doi}. Please check it for typos.`);
  if (!res.ok) throw new Error(`Crossref returned an error (${res.status}). Please try again later.`);
  const m = (await res.json()).message;

  const initials = (g = "") => g.split(/[\s-]+/).filter(Boolean).map((x) => `${x[0].toUpperCase()}.`).join("");
  const authors = (m.author ?? []).map((a) => (a.family ? `${a.family}, ${initials(a.given)}` : a.name)).filter(Boolean);
  if (!authors.some((a) => /^brown,\s*m\./i.test(a))) {
    throw new Error(`Crossref lists the authors as ${authors.slice(0, 6).join("; ")}${authors.length > 6 ? " …" : ""} — “Brown, M.” is not among them, so the paper was not added. If this is correct, ask the site maintainer to add it by hand.`);
  }
  const year = m.issued?.["date-parts"]?.[0]?.[0] ?? null;
  const title = [m.title?.[0], m.subtitle?.[0]].filter(Boolean).join(": ").replace(/<[^>]+>/g, "").trim();
  const type = { "journal-article": "journal-article", "book-chapter": "book-chapter", "proceedings-article": "conference-paper", report: "report", book: "book", monograph: "book", "posted-content": "report" }[m.type] ?? "journal-article";

  let id = [slugify((authors[0] ?? "anon").split(",")[0], 2), year, ...slugify(title).split("-").filter((w) => w.length > 2 && !["the", "and", "for", "from", "with", "into"].includes(w)).slice(0, 3)].join("-");
  while (all.some((p) => p.id === id)) id += "-b";

  return {
    file: type === "journal-article" ? "publications.refereed.json" : "publications.other.json",
    record: {
      id, type, status: "published", year, title, authors, authorsAsInCV: null,
      container: m["container-title"]?.[0] ?? null, volume: m.volume ?? null, issue: m.issue ?? null,
      pages: m.page ?? m["article-number"] ?? null, publisher: m.publisher ?? null, doi, url: null,
      cvSection: "Added after the Winter 2026 CV", cvPage: null, citationAsInCV: null,
      themes: themes.length ? themes : ["earth-observation"],
      verification: { status: "verified", issues: [`imported from Crossref ${today()}`, ...(themes.length ? [] : ["no theme chosen — defaulted to earth-observation"])] },
      publish: true,
    },
  };
}

export function savePublication({ file, record }, { selected = false } = {}) {
  const rows = readData(file);
  rows.unshift(record);
  writeData(file, rows);
  if (selected) {
    const s = readData("settings.json");
    if (!s.home.featuredPublicationDois.includes(record.doi)) s.home.featuredPublicationDois.unshift(record.doi);
    writeData("settings.json", s);
  }
}
