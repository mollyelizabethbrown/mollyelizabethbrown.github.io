#!/usr/bin/env node
/**
 * Add a publication to the local content database from its DOI (Crossref metadata).
 *   npm run import:doi -- 10.1073/pnas.1905228116 --theme climate-risk --theme food-security
 * The record is marked "verified" (metadata comes from the registry) and appended to
 * content/data/publications.refereed.json. Review it, then run `npm run check:content`.
 * Once the CMS is live, use the Studio's "Fill from DOI" button instead.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const FILE = path.join(ROOT, "content", "data", "publications.refereed.json");
const THEMES = ["earth-observation", "food-security", "climate-risk", "applications", "sustainable-food-systems"];

const args = process.argv.slice(2);
const doi = (args.find((a) => /^(https?:\/\/(dx\.)?doi\.org\/)?10\./i.test(a)) || "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
const themes = args.flatMap((a, i) => (a === "--theme" ? [args[i + 1]] : []));
if (!doi) { console.error("Usage: npm run import:doi -- <DOI> [--theme <key>]…"); process.exit(1); }
for (const t of themes) if (!THEMES.includes(t)) { console.error(`Unknown theme "${t}". Use: ${THEMES.join(", ")}`); process.exit(1); }

const rows = JSON.parse(fs.readFileSync(FILE, "utf8"));
const all = [...rows, ...JSON.parse(fs.readFileSync(path.join(ROOT, "content/data/publications.other.json"), "utf8"))];
if (all.some((p) => p.doi?.toLowerCase() === doi.toLowerCase())) { console.error(`DOI ${doi} is already in the database.`); process.exit(1); }

const res = await fetch(`https://api.crossref.org/works/${doi.split("/").map(encodeURIComponent).join("/")}`, { headers: { "User-Agent": "scholarly-website-content-import/1.0" } });
if (!res.ok) { console.error(`Crossref returned ${res.status} for ${doi}`); process.exit(1); }
const m = (await res.json()).message;
const initials = (g = "") => g.split(/[\s-]+/).filter(Boolean).map((x) => `${x[0].toUpperCase()}.`).join("");
const authors = (m.author ?? []).map((a) => (a.family ? `${a.family}, ${initials(a.given)}` : a.name)).filter(Boolean);
const year = m.issued?.["date-parts"]?.[0]?.[0] ?? null;
const title = [m.title?.[0], m.subtitle?.[0]].filter(Boolean).join(": ").replace(/<[^>]+>/g, "");
const slugWords = title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
  .filter((w) => w.length > 2 && !["the", "and", "for", "from", "with", "into"].includes(w)).slice(0, 3);
let id = [((authors[0] ?? "anon").split(",")[0]).toLowerCase().normalize("NFKD").replace(/[^a-z]/g, ""), year, ...slugWords].join("-");
while (all.some((p) => p.id === id)) id += "-b";
const type = { "journal-article": "journal-article", "book-chapter": "book-chapter", "proceedings-article": "conference-paper", report: "report", book: "book", monograph: "book" }[m.type] ?? "journal-article";

const rec = {
  id, type, status: "published", year, title, authors, authorsAsInCV: null,
  container: m["container-title"]?.[0] ?? null, volume: m.volume ?? null, issue: m.issue ?? null,
  pages: m.page ?? m["article-number"] ?? null, publisher: m.publisher ?? null, doi, url: null,
  cvSection: "Added after CV (Crossref import)", cvPage: null, citationAsInCV: null,
  themes: themes.length ? themes : ["earth-observation"],
  verification: { status: "verified", issues: [`imported from Crossref ${new Date().toISOString().slice(0, 10)}`, ...(themes.length ? [] : ["themes defaulted — set them"])] },
  publish: true,
};
rows.unshift(rec);
fs.writeFileSync(FILE, JSON.stringify(rows, null, 2) + "\n", "utf8");
console.log(`Added ${id}\n  ${authors.slice(0, 4).join(", ")}${authors.length > 4 ? " et al." : ""} (${year}) ${title}. ${rec.container ?? ""}`);
