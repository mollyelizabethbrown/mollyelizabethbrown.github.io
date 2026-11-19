#!/usr/bin/env node
/**
 * Content integrity checks for the local content database. Fails (exit 1) on:
 *  - duplicate ids, unknown theme keys, missing required fields
 *  - references to publications/projects/media that do not exist
 *  - image files that are missing from public/
 *  - any trace of the private details present in the source CV (home address, personal phone)
 * Warnings (exit 0) list items still awaiting PI review.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DATA = path.join(ROOT, "content", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const errors = [];
const warnings = [];
const THEMES = new Set(["earth-observation", "food-security", "climate-risk", "applications", "sustainable-food-systems"]);
const norm = (d) => (d ? d.trim().toLowerCase() : null);
const publicFile = (p) => fs.existsSync(path.join(ROOT, "public", p));

// 1. Privacy: details from the CV header (home address, personal phone) that must never be published.
// The patterns themselves are private, so they live in the gitignored content/private/privacy-patterns.json
// (a JSON array of regular-expression strings). Without that file (e.g. in CI) this check is skipped.
const patternsFile = path.join(ROOT, "content", "private", "privacy-patterns.json");
const PRIVATE = fs.existsSync(patternsFile) ? JSON.parse(fs.readFileSync(patternsFile, "utf8")).map((s) => new RegExp(s, "i")) : [];
if (!PRIVATE.length) warnings.push("privacy patterns file not present — CV-detail leak check skipped (runs on the maintainer's machine)");
for (const f of fs.readdirSync(DATA).filter((f) => f.endsWith(".json"))) {
  const text = fs.readFileSync(path.join(DATA, f), "utf8");
  for (const re of PRIVATE) if (re.test(text)) errors.push(`PRIVACY: ${f} contains a private detail matching ${re}`);
}
for (const dir of ["app", "components", "lib", "public"]) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(path.join(ROOT, dir)).filter((f) => /\.(tsx?|mjs|json|txt|html|md)$/.test(f))) {
    const text = fs.readFileSync(f, "utf8");
    for (const re of PRIVATE) if (re.test(text)) errors.push(`PRIVACY: ${path.relative(ROOT, f)} matches ${re}`);
  }
}
if (fs.existsSync(path.join(ROOT, "public")) && fs.readdirSync(path.join(ROOT, "public"), { recursive: true }).some((f) => /cv_molly/i.test(String(f)))) {
  errors.push("PRIVACY: the unredacted CV file is inside public/ — remove it");
}

// 1b. Public repository hygiene: unlisted records live only in content/private/ (gitignored).
const PRIV = path.join(ROOT, "content", "private");
const readPriv = (f) => (fs.existsSync(path.join(PRIV, f)) ? JSON.parse(fs.readFileSync(path.join(PRIV, f), "utf8")) : []);
for (const f of ["publications.refereed.json", "publications.other.json", "projects.json", "people.json"]) {
  for (const r of read(f)) if (r.publish === false) errors.push(`PUBLIC REPO: ${f} contains unlisted record ${r.id} — move it to content/private/`);
}
// Only confidential records are checked by title (hidden duplicates share titles with visible twins).
const unlistedTitles = [
  ...readPriv("publications.unlisted.json").filter((r) => ["submitted", "in-review"].includes(r.status)),
  ...readPriv("projects.unlisted.json"),
].map((r) => r.title).filter((t) => t && t.length > 20);
const publicFiles = ["content/data", "docs", "app", "components", "lib", "public", "scripts", "sanity", "README.md"]
  .map((p) => path.join(ROOT, p)).filter((p) => fs.existsSync(p))
  .flatMap((p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p, { recursive: true }).map((f) => path.join(p, String(f))) : [p]))
  .filter((f) => /\.(json|md|tsx?|mjs|txt)$/.test(f) && fs.statSync(f).isFile());
for (const f of publicFiles) {
  const text = fs.readFileSync(f, "utf8");
  for (const t of unlistedTitles) if (text.includes(t)) errors.push(`PUBLIC REPO: ${path.relative(ROOT, f)} mentions unlisted work “${t.slice(0, 60)}…”`);
}

// 2. Publications
const PUB_TYPES = new Set(["journal-article", "letter-commentary", "magazine-article", "book-review", "dataset", "report", "book", "book-chapter", "conference-paper", "editorial", "patent"]);
const PUB_STATUS = new Set(["published", "in-press", "submitted", "in-review", "pending"]);
const pubs =[...read("publications.refereed.json"), ...read("publications.other.json"), ...readPriv("publications.unlisted.json")];
const ids = new Set();
for (const p of pubs) {
  if (ids.has(p.id)) errors.push(`publication id duplicated: ${p.id}`);
  ids.add(p.id);
  for (const f of ["title", "year", "type", "status", "authors"]) if (p[f] == null || (Array.isArray(p[f]) && !p[f].length)) errors.push(`publication ${p.id}: missing ${f}`);
  for (const t of p.themes ?? []) if (!THEMES.has(t)) errors.push(`publication ${p.id}: unknown theme ${t}`);
  if (!p.verification) errors.push(`publication ${p.id}: missing verification block`);
  if (p.publish !== false && ["submitted", "in-review"].includes(p.status)) errors.push(`publication ${p.id}: unpublished manuscript is set to publish`);
  if (p.publish !== false && p.verification?.status === "conflict") warnings.push(`publication ${p.id}: DOI title conflict awaiting PI review`);
  // Metadata validation
  if (!/^[a-z0-9-]+$/.test(p.id)) errors.push(`publication ${p.id}: id must be lowercase letters, digits and hyphens`);
  if (p.doi && !/^10\.\d{4,9}\/\S+$/.test(p.doi)) errors.push(`publication ${p.id}: malformed DOI "${p.doi}"`);
  if (!Number.isInteger(p.year) || p.year < 1990 || p.year > new Date().getFullYear() + 1) errors.push(`publication ${p.id}: implausible year ${p.year}`);
  if (!PUB_TYPES.has(p.type)) errors.push(`publication ${p.id}: unknown type ${p.type}`);
  if (!PUB_STATUS.has(p.status)) errors.push(`publication ${p.id}: unknown status ${p.status}`);
  if (p.url && !/^https?:\/\//.test(p.url)) errors.push(`publication ${p.id}: url must start with http(s)://`);
  if (p.publish !== false && p.type === "journal-article" && !p.container) warnings.push(`publication ${p.id}: journal article without journal name`);
  if (p.publish !== false && !(p.authors ?? []).some((a) => /^brown,\s*m\.?\s*e?\.?/i.test(a)) && !/et al|Commission/i.test(JSON.stringify(p.verification?.issues ?? []))) {
    warnings.push(`publication ${p.id}: Dr. Brown not found in author list`);
  }
}
const liveDois = new Set(pubs.filter((p) => p.publish !== false && p.doi && p.verification?.status !== "doi-unresolved").map((p) => norm(p.doi)));
const dupDois = pubs.filter((p) => p.doi && p.publish !== false).map((p) => norm(p.doi)).filter((d, i, a) => a.indexOf(d) !== i);
for (const d of new Set(dupDois)) errors.push(`DOI used by more than one visible publication: ${d}`);

// 3. Media
const media = read("media.json");
const mediaIds = new Set(media.map((m) => m.id));
for (const m of media) {
  if (!publicFile(m.file)) errors.push(`media ${m.id}: file missing ${m.file}`);
  if (!m.credit) errors.push(`media ${m.id}: missing credit`);
}

// 4. Themes
const themes = read("themes.json");
for (const t of themes) {
  if (!THEMES.has(t.id)) errors.push(`theme ${t.id}: unknown key`);
  if (t.imageId && !mediaIds.has(t.imageId)) errors.push(`theme ${t.id}: image ${t.imageId} not in media.json`);
  for (const f of t.findings) if (!liveDois.has(norm(f.doi))) warnings.push(`theme ${t.id}: finding DOI ${f.doi} not in visible bibliography (links to doi.org instead)`);
}

// 5. Projects
const projects = read("projects.json");
const projectIds = new Set(projects.map((p) => p.id));
if (projectIds.size !== projects.length) errors.push("duplicate project ids");
for (const p of projects) {
  for (const f of ["title", "abstract", "periodStart", "status", "funder", "role"]) if (p[f] == null || p[f] === "") errors.push(`project ${p.id}: missing ${f}`);
  for (const t of p.themes) if (!THEMES.has(t)) errors.push(`project ${p.id}: unknown theme ${t}`);
  for (const d of p.publicationDois) if (!liveDois.has(norm(d))) errors.push(`project ${p.id}: publication DOI ${d} not in visible bibliography`);
  for (const r of p.related ?? []) if (!projectIds.has(r)) errors.push(`project ${p.id}: related project ${r} missing`);
  if (p.status === "active" && p.periodEnd && p.periodEnd < new Date().getFullYear()) errors.push(`project ${p.id}: marked active but ended ${p.periodEnd}`);
  if (p.verification?.status === "needs-review" && p.publish !== false) warnings.push(`project ${p.id}: needs PI review`);
}

// 6. Books, settings, profile
for (const b of read("books.json")) if (b.cover && !publicFile(b.cover.file)) errors.push(`book ${b.id}: cover missing`);
const settings = read("settings.json");
if (settings.heroImageId && !mediaIds.has(settings.heroImageId)) errors.push(`settings: hero image ${settings.heroImageId} missing`);
for (const id of settings.home.featuredProjectIds) if (!projectIds.has(id)) errors.push(`settings: featured project ${id} missing`);
for (const d of settings.home.featuredPublicationDois) if (!liveDois.has(norm(d))) errors.push(`settings: featured DOI ${d} not in visible bibliography`);
const profile = read("profile.json");
if (!profile.photo?.file) warnings.push("profile: no portrait yet");
else if (!publicFile(profile.photo.file)) errors.push(`profile: portrait file missing ${profile.photo.file}`);
else if (/interim/i.test(profile.photo.status ?? "")) warnings.push("profile: portrait is interim (UMD photo) — replace with the LinkedIn photo and confirm with Dr. Brown");
if (!settings.cvFile) warnings.push("settings: no redacted CV uploaded yet (About page shows 'available on request')");
else if (!publicFile(settings.cvFile)) errors.push(`settings: CV file missing ${settings.cvFile}`);
for (const c of profile.contributions ?? []) {
  for (const d of c.dois ?? []) if (!liveDois.has(norm(d))) errors.push(`profile contribution "${c.title}": DOI ${d} not in visible bibliography`);
  for (const id of c.projects ?? []) if (!projectIds.has(id)) errors.push(`profile contribution "${c.title}": project ${id} missing`);
}

// 7. Flagship projects
for (const p of projects.filter((p) => p.flagship)) {
  if (p.imageId && !mediaIds.has(p.imageId)) errors.push(`flagship ${p.id}: image ${p.imageId} not in media.json`);
  if (!(p.questions ?? []).length) warnings.push(`flagship ${p.id}: no research questions`);
  for (const o of p.outcomes ?? []) if (!liveDois.has(norm(o.doi))) errors.push(`flagship ${p.id}: outcome DOI ${o.doi} not in visible bibliography`);
}

// 8. Homepage highlights
const highlights = read("highlights.json");
if (highlights.nasa.imageId && !mediaIds.has(highlights.nasa.imageId)) errors.push(`highlights: NASA image ${highlights.nasa.imageId} missing`);
for (const id of highlights.nasa.projectIds) if (!projectIds.has(id)) errors.push(`highlights: NASA project ${id} missing`);
for (const it of highlights.impact) {
  if (!it.source) errors.push(`highlights: impact "${it.title}" has no source`);
  for (const e of it.evidence) if (e.doi && !liveDois.has(norm(e.doi))) errors.push(`highlights: impact "${it.title}" cites ${e.doi}, not in visible bibliography`);
}

// 9. News and people
const NEWS_CATS = new Set(["publication", "research-update", "conference", "lecture", "perspective", "project", "award", "media"]);
const newsIds = new Set();
for (const n of read("news.json")) {
  if (newsIds.has(n.id)) errors.push(`news id duplicated: ${n.id}`);
  newsIds.add(n.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.date ?? "")) errors.push(`news ${n.id}: date must be YYYY-MM-DD`);
  if (!NEWS_CATS.has(n.category)) errors.push(`news ${n.id}: unknown category ${n.category}`);
  if (!n.title || !n.excerpt) errors.push(`news ${n.id}: title and summary are required`);
  if (n.link && !/^https:\/\//.test(n.link.url ?? "")) errors.push(`news ${n.id}: link must start with https://`);
  if (n.imageId && !mediaIds.has(n.imageId)) errors.push(`news ${n.id}: image ${n.imageId} not in media.json`);
  for (const d of n.relatedPublicationDois ?? []) if (!liveDois.has(norm(d))) errors.push(`news ${n.id}: related DOI ${d} not in visible bibliography`);
  for (const id of n.relatedProjectIds ?? []) if (!projectIds.has(id)) errors.push(`news ${n.id}: related project ${id} missing`);
}
const PEOPLE_CATS = new Set(["pi", "advisee", "alumni", "mentee", "collaborator", "postdoc"]);
const personIds = new Set();
for (const p of read("people.json")) {
  if (personIds.has(p.id)) errors.push(`person id duplicated: ${p.id}`);
  personIds.add(p.id);
  if (!PEOPLE_CATS.has(p.category)) errors.push(`person ${p.id}: unknown category ${p.category}`);
  if (!p.name || !p.role) errors.push(`person ${p.id}: name and role are required`);
  if (p.category !== "pi" && !p.cvPage && !p.source) errors.push(`person ${p.id}: needs a source (cvPage or source) — never list people without verification`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\n${pubs.length} publications (${pubs.filter((p) => p.publish !== false).length} visible), ${projects.length} projects, ${themes.length} themes, ${media.length} images — ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
