#!/usr/bin/env node
/**
 * Convert the content database (content/data/*.json) into a Sanity NDJSON import file.
 *
 *   npm run sanity:seed
 *   npx sanity dataset import content/seed/seed.ndjson production --replace
 *
 * Document IDs are deterministic (e.g. "publication.cooper-2019-mapping-effects-drought"), so
 * re-importing updates documents instead of duplicating them. Images are uploaded from
 * public/ via the `_sanityAsset` convention. Hidden records (publish: false) are imported
 * with `hidden: true` so nothing is lost but nothing private is shown.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const DATA = path.join(ROOT, "content", "data");
const OUT = path.join(ROOT, "content", "seed", "seed.ndjson");
const read = (f, fallback) => (fs.existsSync(path.join(DATA, f)) ? JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")) : fallback);
// Unlisted records (unpublished manuscripts, duplicates, people awaiting consent) are kept out of the public
// repository in content/private/. When that folder is present they are imported with hidden: true.
const PRIV = path.join(ROOT, "content", "private");
const readPriv = (f) => (fs.existsSync(path.join(PRIV, f)) ? JSON.parse(fs.readFileSync(path.join(PRIV, f), "utf8")) : []);

let k = 0;
const key = () => `k${(k++).toString(36).padStart(6, "0")}`;
const ref = (id) => ({ _type: "reference", _ref: id, _key: key() });
const keyed = (arr = []) => arr.map((o) => ({ _key: key(), ...o }));
const normDoi = (d) => (d ? d.trim().toLowerCase() : null);
const asset = (publicPath) => {
  const abs = path.join(ROOT, "public", publicPath);
  if (!fs.existsSync(abs)) throw new Error(`Missing image ${abs}`);
  return `image@${pathToFileURL(abs).href}`;
};

const media = Object.fromEntries(read("media.json", []).map((m) => [m.id, m]));
const figure = (id) => {
  const m = media[id];
  if (!m) return undefined;
  return { _type: "figure", _sanityAsset: asset(m.file), alt: m.title, title: m.title, caption: m.caption, credit: m.credit, sourceUrl: m.sourcePage, license: m.license, licenseUrl: m.licenseUrl ?? undefined };
};

const docs = [];

// Publications
const pubs = [...read("publications.refereed.json", []), ...read("publications.other.json", []), ...readPriv("publications.unlisted.json")];
const pubIdByDoi = new Map(pubs.filter((p) => p.doi).map((p) => [normDoi(p.doi), `publication.${p.id}`]));
const settings = read("settings.json", {});
const featuredDois = new Set((settings.home?.featuredPublicationDois ?? []).map(normDoi));
for (const p of pubs) {
  docs.push({
    _id: `publication.${p.id}`, _type: "publication",
    title: p.title, slug: { _type: "slug", current: p.id }, doi: p.doi ?? undefined, authors: p.authors, year: p.year,
    type: p.type, status: p.status, container: p.container ?? undefined, volume: p.volume ?? undefined, issue: p.issue ?? undefined,
    pages: p.pages ?? undefined, publisher: p.publisher ?? undefined, editors: p.editors ?? undefined, isbn: p.isbn ?? undefined, url: p.url ?? undefined,
    themes: p.themes.map((t) => ref(`theme.${t}`)),
    featured: featuredDois.has(normDoi(p.doi)),
    cvSection: p.cvSection, hidden: p.publish === false,
    verificationStatus: p.verification?.status === "doi-unresolved" ? "needs-review" : p.verification?.status ?? "cv-only",
    verificationNotes: p.verification?.issues ?? [],
  });
}

// Themes
for (const t of read("themes.json", [])) {
  docs.push({
    _id: `theme.${t.id}`, _type: "researchTheme",
    title: t.title, themeId: { _type: "slug", current: t.id }, order: t.order, short: t.short, kicker: t.kicker, summary: t.summary,
    introduction: t.introduction, questions: t.questions, methods: t.methods,
    findings: keyed(t.findings.filter((f) => pubIdByDoi.has(normDoi(f.doi))).map((f) => ({ _type: "object", text: f.text, publication: { _type: "reference", _ref: pubIdByDoi.get(normDoi(f.doi)) } }))),
    image: figure(t.imageId),
  });
}

// Projects
for (const p of [...read("projects.json", []), ...readPriv("projects.unlisted.json")]) {
  docs.push({
    _id: `project.${p.id}`, _type: "project",
    title: p.title, slug: { _type: "slug", current: p.id }, abstract: p.abstract, goals: p.goals,
    periodStart: p.periodStart, periodEnd: p.periodEnd ?? undefined, status: p.status, funder: p.funder, program: p.program ?? undefined,
    role: p.role, leadPI: p.leadPI ?? undefined, collaborators: p.collaborators, geography: p.geography, methods: p.methods,
    themes: p.themes.map((t) => ref(`theme.${t}`)),
    publications: p.publicationDois.map(normDoi).filter((d) => pubIdByDoi.has(d)).map((d) => ref(pubIdByDoi.get(d))),
    related: (p.related ?? []).map((id) => ref(`project.${id}`)),
    featured: p.featured, hidden: p.publish === false,
    verificationStatus: p.verification?.status ?? "cv-only", verificationNotes: p.verification?.issues ?? [],
  });
}

// Books
for (const b of read("books.json", [])) {
  docs.push({
    _id: `book.${b.id}`, _type: "book", title: b.title, slug: { _type: "slug", current: b.id }, year: b.year, publisher: b.publisher,
    series: b.series ?? undefined, pages: b.pages ?? undefined, doi: b.doi ?? undefined, isbn: b.isbn ?? undefined, publisherUrl: b.publisherUrl ?? undefined,
    summary: b.summary, cover: b.cover ? { _type: "image", _sanityAsset: asset(b.cover.file) } : undefined,
    themes: b.themes.map((t) => ref(`theme.${t}`)),
  });
}

// People
[...read("people.json", []), ...readPriv("people.unlisted.json")].forEach((p, i) => docs.push({
  _id: `person.${p.id}`, _type: "person", name: p.name, slug: { _type: "slug", current: p.id }, category: p.category, role: p.role,
  affiliation: p.affiliation, period: p.period ?? undefined, bio: p.bio ?? undefined, orderRank: i, published: p.publish !== false,
}));

// News
for (const n of read("news.json", [])) {
  docs.push({ _id: `news.${n.id}`, _type: "news", title: n.title, slug: { _type: "slug", current: n.id }, date: n.date, category: n.category, excerpt: n.excerpt });
}

// Profile singleton + awards
const pr = read("profile.json", {});
docs.push({
  _id: "profile", _type: "profile",
  name: pr.name, postNominal: pr.postNominal, designation: pr.designation, institution: pr.institution, department: pr.department,
  tagline: pr.tagline, statement: pr.statement, summary: pr.summary,
  biography: pr.biography, approach: pr.approach,
  chain: keyed(pr.chain), contributions: keyed((pr.contributions ?? []).map(({ title, text }) => ({ title, text }))),
  appointments: keyed(pr.appointments.map(({ title, organization, start, end, current, featured, category, summary }) => ({ title, organization, start, end: end ?? undefined, current, featured, category, summary }))),
  education: keyed(pr.education.map(({ degree, institution, year, detail }) => ({ degree, institution, year, detail: detail ?? undefined }))),
  teaching: keyed(pr.teaching.map(({ title, organization, period, detail }) => ({ title, organization, period, detail: detail ?? undefined }))),
  leadership: keyed(pr.leadership.map(({ role, body, period, featured }) => ({ role, body, period: period ?? undefined, featured }))),
  reviewing: pr.reviewing,
  memberships: keyed(pr.memberships.map(({ body, period }) => ({ body, period }))),
  contactAddress: pr.contact?.address ?? [],
});
for (const a of pr.awards) docs.push({ _id: `award.${a.id}`, _type: "award", title: a.title, year: a.year, detail: a.detail ?? undefined, featured: a.featured });

// Site settings singleton
docs.push({
  _id: "siteSettings", _type: "siteSettings",
  siteTitle: settings.siteTitle, siteDescription: settings.siteDescription,
  heroImage: figure(settings.heroImageId),
  featuredProjects: settings.home.featuredProjectIds.map((id) => ref(`project.${id}`)),
  featuredPublications: settings.home.featuredPublicationDois.map(normDoi).filter((d) => pubIdByDoi.has(d)).map((d) => ref(pubIdByDoi.get(d))),
  earthToDecisionsTitle: settings.home.earthToDecisionsTitle, earthToDecisionsText: settings.home.earthToDecisionsText,
  links: keyed(settings.links.filter((l) => l.verified !== false).map(({ label, url, kind }) => ({ _type: "linkItem", label, url, kind }))),
  contactEmail: settings.contactEmail ?? undefined,
});

const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, docs.map((d) => JSON.stringify(clean(d))).join("\n") + "\n", "utf8");
const byType = docs.reduce((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {});
console.log(`Wrote ${docs.length} documents to ${path.relative(ROOT, OUT)}`, byType);
