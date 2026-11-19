#!/usr/bin/env node
/**
 * Verify every publication DOI against Crossref (falling back to DataCite / the DOI handle
 * system), compare the registered title and year with the CV record, and write results back
 * into each record's `verification` block. CV-derived fields are never overwritten.
 *
 *   npm run verify:dois                 # all records
 *   npm run verify:dois -- --suggest    # also search Crossref for records with no DOI (suggestions only)
 *
 * Outputs:  content/private/reports/doi-verification.json  (machine-readable; gitignored)
 *           content/private/reports/doi-verification.md    (human-readable summary; gitignored)
 *
 * Etiquette: sequential requests with a pause, generic User-Agent, no personal data sent.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const DATA = path.join(ROOT, "content", "data");
const PRIVATE = path.join(ROOT, "content", "private");
// Reports list every record (including unlisted ones), so they live in the gitignored private folder.
const REPORTS = path.join(PRIVATE, "reports");
const FILES = [
  path.join(DATA, "publications.refereed.json"),
  path.join(DATA, "publications.other.json"),
  path.join(PRIVATE, "publications.unlisted.json"),
];
const UA = "scholarly-website-content-audit/1.0 (DOI verification script)";
const SUGGEST = process.argv.includes("--suggest");
const TODAY = new Date().toISOString().slice(0, 10);
const AUTO_TAGS = /^(crossref|datacite|doi|suggested-doi):/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (res.status === 404) return { status: 404 };
      if (res.status === 429 || res.status >= 500) { await sleep(2000 * (attempt + 1)); continue; }
      if (!res.ok) return { status: res.status };
      return { status: 200, body: await res.json() };
    } catch {
      await sleep(1500 * (attempt + 1));
    }
  }
  return { status: 0 };
}

const norm = (s) =>
  (s || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function similarity(a, b) {
  const A = new Set(norm(a).split(" ").filter((w) => w.length > 2));
  const B = new Set(norm(b).split(" ").filter((w) => w.length > 2));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  // Overlap coefficient tolerates subtitles present in one source only.
  return inter / Math.min(A.size, B.size);
}

const enc = (doi) => doi.split("/").map(encodeURIComponent).join("/");

async function lookup(doi) {
  const cr = await getJson(`https://api.crossref.org/works/${enc(doi)}`);
  if (cr.status === 200) {
    const m = cr.body.message;
    const yearParts = (m.issued?.["date-parts"]?.[0] ?? m.published?.["date-parts"]?.[0]) || [];
    return {
      registry: "crossref",
      title: [m.title?.[0], m.subtitle?.[0]].filter(Boolean).join(": "),
      year: yearParts[0] ?? null,
      container: m["container-title"]?.[0] ?? null,
      volume: m.volume ?? null,
      issue: m.issue ?? null,
      pages: m.page ?? m["article-number"] ?? null,
      type: m.type ?? null,
    };
  }
  const dc = await getJson(`https://api.datacite.org/dois/${enc(doi)}`);
  if (dc.status === 200) {
    const a = dc.body.data?.attributes ?? {};
    return {
      registry: "datacite",
      title: a.titles?.[0]?.title ?? "",
      year: a.publicationYear ?? null,
      container: a.publisher ?? null, volume: null, issue: null, pages: null, type: a.types?.resourceTypeGeneral ?? null,
    };
  }
  const hdl = await getJson(`https://doi.org/api/handles/${enc(doi)}`);
  if (hdl.status === 200 && hdl.body.responseCode === 1) {
    return { registry: "handle-only", title: "", year: null, container: null, volume: null, issue: null, pages: null, type: null };
  }
  return null;
}

async function suggest(p) {
  const q = new URLSearchParams({ "query.bibliographic": `${p.title} ${p.authors?.[0] ?? ""} ${p.year}`, rows: "1", select: "DOI,title,issued" });
  const r = await getJson(`https://api.crossref.org/works?${q}`);
  const item = r.body?.message?.items?.[0];
  if (!item) return null;
  const sim = similarity(p.title, item.title?.[0]);
  const y = item.issued?.["date-parts"]?.[0]?.[0];
  return sim >= 0.9 ? { doi: item.DOI, title: item.title?.[0], year: y, sim } : null;
}

const report = [];
for (const fp of FILES) {
  const file = path.basename(fp);
  if (!fs.existsSync(fp)) continue;
  const rows = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const p of rows) {
    p.verification ??= { status: "cv-only", issues: [] };
    p.verification.issues = (p.verification.issues || []).filter((i) => !AUTO_TAGS.test(i));
    const entry = { id: p.id, file, cvYear: p.year, cvTitle: p.title, doi: p.doi ?? null };

    if (p.doi) {
      const hit = await lookup(p.doi);
      await sleep(120);
      if (!hit) {
        p.verification.status = "doi-unresolved";
        p.verification.issues.push(`doi: ${p.doi} does not resolve in Crossref, DataCite or the DOI handle system — hidden on the site until fixed`);
        entry.result = "unresolved";
      } else if (hit.registry === "handle-only") {
        p.verification.status = p.verification.status === "cv-only" ? "verified" : p.verification.status;
        p.verification.issues.push(`doi: resolves (non-Crossref/DataCite registrar); title not machine-checked`);
        entry.result = "resolves";
      } else {
        const sim = similarity(p.title, hit.title);
        entry.registry = hit.registry; entry.registered = hit; entry.titleSimilarity = Number(sim.toFixed(2));
        if (sim >= 0.75) {
          if (p.verification.status === "cv-only") p.verification.status = "verified";
          entry.result = "verified";
        } else {
          p.verification.status = "conflict";
          p.verification.issues.push(`${hit.registry}: DOI is registered to a different title — "${hit.title}" (similarity ${sim.toFixed(2)})`);
          entry.result = "title-mismatch";
        }
        if (hit.year && Number(hit.year) !== Number(p.year)) {
          p.verification.issues.push(`${hit.registry}: registered year ${hit.year} differs from CV year ${p.year}`);
          entry.yearMismatch = true;
        }
        if (hit.registry === "crossref" && hit.volume && p.volume && String(hit.volume) !== String(p.volume)) {
          p.verification.issues.push(`crossref: registered volume ${hit.volume} differs from CV volume ${p.volume}`);
        }
      }
      p.verification.checkedAt = TODAY;
    } else if (SUGGEST && ["journal-article", "letter-commentary", "book-chapter", "conference-paper"].includes(p.type)) {
      const s = await suggest(p);
      await sleep(150);
      if (s) {
        p.verification.issues.push(`suggested-doi: ${s.doi} — Crossref title "${s.title}" (${s.year}); confirm before adding`);
        entry.suggestion = s;
      }
      entry.result = "no-doi";
    } else {
      entry.result = "no-doi";
    }
    report.push(entry);
    process.stdout.write(`${entry.result.padEnd(15)} ${p.id}\n`);
  }
  fs.writeFileSync(fp, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(path.join(REPORTS, "doi-verification.json"), JSON.stringify({ checkedAt: TODAY, report }, null, 2) + "\n");

const count = (r) => report.filter((e) => e.result === r).length;
const lines = [
  `# DOI verification — ${TODAY}`,
  "",
  `Records: ${report.length} · verified: ${count("verified")} · resolves (unchecked title): ${count("resolves")} · title mismatch: ${count("title-mismatch")} · unresolved: ${count("unresolved")} · no DOI: ${count("no-doi")} · year differs: ${report.filter((e) => e.yearMismatch).length}`,
  "",
  "## Needs attention",
  "",
  ...report
    .filter((e) => ["title-mismatch", "unresolved"].includes(e.result) || e.yearMismatch)
    .map((e) => `- **${e.id}** (${e.result}${e.yearMismatch ? `, registered year ${e.registered?.year} vs CV ${e.cvYear}` : ""}) — doi:${e.doi}${e.result === "title-mismatch" ? ` → registered title: “${e.registered.title}”` : ""}`),
  "",
  "## DOI suggestions for records without a DOI (not applied)",
  "",
  ...report.filter((e) => e.suggestion).map((e) => `- **${e.id}** → ${e.suggestion.doi} (“${e.suggestion.title}”, ${e.suggestion.year})`),
  "",
];
fs.writeFileSync(path.join(REPORTS, "doi-verification.md"), lines.join("\n"));
console.log(`\n${lines[2]}`);
