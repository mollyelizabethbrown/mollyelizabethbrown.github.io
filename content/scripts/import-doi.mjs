#!/usr/bin/env node
/**
 * Add a publication from its DOI (Crossref metadata) — command-line version.
 *   npm run import:doi -- 10.1073/pnas.1905228116 --theme climate-risk --theme food-security [--selected]
 * The usual no-code route is the "Add a publication" issue form on GitHub (see docs/ADMIN-HANDBOOK.md).
 */
import { publicationFromDoi, savePublication } from "./lib/content-db.mjs";

const args = process.argv.slice(2);
const doi = args.find((a) => /^(https?:\/\/(dx\.)?doi\.org\/|doi:)?10\./i.test(a));
const themes = args.flatMap((a, i) => (a === "--theme" ? [args[i + 1]] : []));
if (!doi) {
  console.error("Usage: npm run import:doi -- <DOI> [--theme <key>]… [--selected]");
  process.exit(1);
}
try {
  const pub = await publicationFromDoi(doi, themes);
  savePublication(pub, { selected: args.includes("--selected") });
  const r = pub.record;
  console.log(`Added ${r.id} → ${pub.file}\n  ${r.authors.slice(0, 4).join(", ")}${r.authors.length > 4 ? " et al." : ""} (${r.year}) ${r.title}. ${r.container ?? ""}`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
