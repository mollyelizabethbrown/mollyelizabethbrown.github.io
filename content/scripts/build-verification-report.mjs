#!/usr/bin/env node
/**
 * Regenerate content/private/CONTENT-VERIFICATION.md (gitignored) from the content database.
 *   node content/scripts/build-verification-report.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const DATA = path.join(ROOT, "content", "data");
const PRIV = path.join(ROOT, "content", "private");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const readPriv = (f) => (fs.existsSync(path.join(PRIV, f)) ? JSON.parse(fs.readFileSync(path.join(PRIV, f), "utf8")) : []);
const today = new Date().toISOString().slice(0, 10);

// The report names unlisted manuscripts, so it is written to the gitignored private folder.
const ref = read("publications.refereed.json");
const oth = read("publications.other.json");
const pubs = [...ref, ...oth, ...readPriv("publications.unlisted.json")];
const projects = [...read("projects.json"), ...readPriv("projects.unlisted.json")];
const profile = read("profile.json");
const settings = read("settings.json");
const books = read("books.json");
const media = read("media.json");
const doiReport = fs.existsSync(path.join(PRIV, "reports", "doi-verification.json")) ? JSON.parse(fs.readFileSync(path.join(PRIV, "reports", "doi-verification.json"), "utf8")) : { report: [] };

const count = (arr, fn) => arr.reduce((m, x) => ((m[fn(x)] = (m[fn(x)] ?? 0) + 1), m), {});
const table = (obj) => Object.entries(obj).map(([k, v]) => `| ${k} | ${v} |`).join("\n");
const visible = pubs.filter((p) => p.publish !== false);
const hidden = pubs.filter((p) => p.publish === false);
const issuesWith = (p, re) => (p.verification?.issues ?? []).filter((i) => re.test(i));

const L = [];
L.push(`# Content verification report`, ``, `Generated ${today} from \`content/data/\`. Source of record: *CV_molly_Winter_2026.pdf* (59 pp.), cross-checked against the .docx version, Crossref/DataCite, publisher pages, ORCID and the UMD faculty profile. Re-run with \`node content/scripts/build-verification-report.mjs\`.`, ``);

L.push(`## 1. Summary`, ``);
L.push(`| Dataset | Records | Shown on site |`, `|---|---|---|`);
L.push(`| Publications (all CV output sections) | ${pubs.length} | ${visible.length} |`);
L.push(`| Projects (from Grants section + positions) | ${projects.length} | ${projects.filter((p) => p.publish !== false).length} |`);
L.push(`| Books | ${books.length} | ${books.length} |`);
L.push(`| Appointments | ${profile.appointments.length} | ${profile.appointments.length} |`);
L.push(`| Awards | ${profile.awards.length} | ${profile.awards.length} |`);
L.push(`| Leadership & service roles | ${profile.leadership.length} | ${profile.leadership.length} |`);
L.push(`| Images (NASA, credited) | ${media.length} | ${media.length} |`, ``);
L.push(`**Publication verification status**`, ``, `| Status | Records |`, `|---|---|`, table(count(pubs, (p) => p.verification.status)), ``);
L.push(`- **verified** — DOI resolves in Crossref/DataCite and the registered title matches the CV title.`);
L.push(`- **cv-only** — no DOI in the CV (most book chapters, proceedings, reports); bibliographic data as given in the CV.`);
L.push(`- **conflict** — DOI resolves to the same work but under a different title (see §4.3).`, ``);
L.push(`**Publications by type (shown on site)**`, ``, `| Type | Records |`, `|---|---|`, table(count(visible, (p) => p.type)), ``);

L.push(`## 2. Privacy exclusions (enforced)`, ``);
L.push(`- The CV header's **home address and phone number** are not in any dataset, page or image. \`npm run check:content\` fails the build if either string reappears anywhere in \`content/data\`, \`app\`, \`components\`, \`lib\` or \`public\`.`);
L.push(`- The raw CV (\`content/source/\`) and this report (\`content/private/\`) are excluded from the public repository (\`.gitignore\`). **It must not be uploaded as the downloadable CV.** The About page shows "available on request" until a redacted PDF is uploaded in the CMS.`);
L.push(`- Students and mentees listed in the CV are recorded as **unpublished** People entries; none is shown until they agree.`);
L.push(`- **Unpublished manuscripts** (submitted / in review) are hidden by default (see §4.1).`, ``);

L.push(`## 3. Decisions needed before launch`, ``);
L.push(`| # | Item | Default chosen | Who decides |`, `|---|---|---|---|`);
const decisions = [
  ["Portrait", "Her LinkedIn profile photo (supplied by Walid Ouaret, metadata stripped) on the homepage, About and People pages.", "Dr. Brown to confirm"],
  ["Positioning line and short biography", "New homepage line (replaces the earlier slogan) and a concise biography; both syntheses of CV facts.", "Dr. Brown"],
  ["Homepage highlights", "NASA mission-applications section and four 'Scientific impact' items, each with its CV page or DOI evidence (content/data/highlights.json).", "Dr. Brown"],
  ["Flagship projects", "Seven flagship pages with research questions (editorial) and outcomes (restating linked publication titles).", "Dr. Brown"],
  ["People", "Students, alumni and mentees published from the CV supervision list (pp. 54–56) with CV roles only; two high-school students listed in the CV are excluded as minors. Spelling: CV 'Monica Ilhi' vs publication 'Monica Ihli' (site uses Ihli); CV 'Michael Farhner' vs report author 'M. Fahrner' (site uses the CV spelling).", "Dr. Brown"],
  ["Downloadable CV", "Withheld; 'available on request'. Needs a redacted PDF.", "Dr. Brown"],
  ["Public email", `${settings.contactEmail ?? "none"} (the address shown on her UMD profile)`, "Dr. Brown"],
  ["Book cover images", "Publisher artwork displayed (Springer, Routledge).", "Dr. Brown"],
  ["6th Grain appointment", "Shown as current (CV and ORCID agree).", "Dr. Brown"],
  ["Mailing address ZIP", "CV says 'College Park, MD 20171' (a Herndon, VA ZIP). Site uses the department's 20742.", "Dr. Brown"],
  ["Search-engine indexing", "Disabled (robots.txt disallow) until launch is approved; then set the GitHub repository variable ALLOW_INDEXING=true.", "Dr. Brown"],
];
decisions.forEach((d, i) => L.push(`| ${i + 1} | ${d[0]} | ${d[1]} | ${d[2]} |`));
L.push(``);

L.push(`## 4. Publications needing review`, ``);
L.push(`### 4.1 Hidden by default`, ``);
for (const p of hidden) L.push(`- **${p.title}** (${p.year}; ${p.status}; \`${p.id}\`) — ${(p.verification.issues.filter((i) => /unpublished|curation|co-author|not published|duplicate/i.test(i))[0] ?? p.verification.issues[0] ?? "").replace(/^curation: /, "")}`);
// Records a co-author asked to keep private are called out from the (private) data, never hard-coded here.
for (const p of hidden.filter((p) => p.verification.issues.some((i) => /co-author has asked/i.test(i)))) {
  L.push(``, `> *${p.title}* must stay hidden: the co-author has asked that this in-development work not be shown publicly.`);
}
L.push(``);

L.push(`### 4.2 Registered year differs from CV year (${doiReport.report.filter((e) => e.yearMismatch).length})`, ``);
L.push(`Usually online-first vs. print year. The site shows the CV year; consider aligning with the publisher's year.`, ``);
for (const e of doiReport.report.filter((e) => e.yearMismatch)) L.push(`- \`${e.id}\` — CV ${e.cvYear}, registered ${e.registered?.year} (doi:${e.doi})`);
L.push(``);

L.push(`### 4.3 Title differs from the DOI's registered title`, ``);
for (const p of pubs.filter((p) => p.verification.status === "conflict")) {
  const e = doiReport.report.find((r) => r.id === p.id);
  L.push(`- **${p.title}** → registered: “${e?.registered?.title ?? "?"}” (doi:${p.doi}). Same authors/venue; the title appears to have changed at publication. **Recommend adopting the registered title.**`);
}
L.push(``);

L.push(`### 4.4 Corrections applied (documented on each record)`, ``);
for (const p of pubs) for (const i of issuesWith(p, /^corrected:|^curation: CV DOI|^audit /)) L.push(`- \`${p.id}\` — ${i.replace(/^curation: /, "")}`);
L.push(``);

L.push(`### 4.5 DOIs found for records without one (not applied — confirm, then add in the CMS)`, ``);
for (const p of pubs) for (const i of issuesWith(p, /^suggested-doi:/)) L.push(`- \`${p.id}\` (${p.year}) → ${i.replace(/^suggested-doi: /, "")}`);
L.push(``);

L.push(`## 5. Projects needing review`, ``);
for (const p of projects.filter((p) => p.verification?.status === "needs-review" || p.publish === false)) {
  L.push(`- **${p.title}** (\`${p.id}\`${p.publish === false ? ", hidden" : ""}) — ${p.verification.issues.join(" ")}`);
}
L.push(``, `Projects are marked **active** only when the CV period runs past the reporting date (one: ICESat-2 applications, 2021–2027). Funding amounts and percent effort from the CV are **not displayed**.`, ``);

L.push(`## 6. Profile items needing review`, ``);
const profIssues = [
  ...profile.verification.issues,
  ...profile.appointments.filter((a) => a.verification).flatMap((a) => a.verification.issues.map((i) => `${a.title}, ${a.organization}: ${i}`)),
  ...profile.leadership.filter((l) => l.verification).flatMap((l) => l.verification.issues.map((i) => `${l.body}: ${i}`)),
  ...profile.memberships.filter((m) => m.verification).flatMap((m) => m.verification.issues),
  ...profile.contact.verification.issues,
  ...settings.verification.issues,
];
for (const i of profIssues) L.push(`- ${i}`);
L.push(``);

L.push(`## 7. Other CV inconsistencies noticed (not imported sections)`, ``);
L.push(`The *Talks, Presentations and Posters* and *Public Outreach* sections were not imported (available for future News posts). While auditing them:`);
L.push(`- p.25: COP28 panel listed under 2023 but dated "December 3, 2024" (COP28 was December 2023).`);
L.push(`- p.23: three AGU posters listed under 2025 are dated December 2024.`);
L.push(`- p.38: two talks listed under 2011 are dated "December 6, 2012".`);
L.push(`- p.31: two talks listed under 2016 are dated 2017 (Chongqing, IFPRI).`);
L.push(`- p.2: GIMMS expanded as "Global Mapping and Modeling Systems" (usual name: Global Inventory Modeling and Mapping Studies).`);
L.push(`- p.54: "American Meteorological Association (AMU)" — presumably the American Meteorological Society.`, ``);

L.push(`## 8. External identifiers verified`, ``);
for (const l of settings.links) L.push(`- ${l.label}: ${l.url}`);
L.push(`- No current NASA Goddard staff page exists (legacy URLs return 404).`, ``);

L.push(`## Appendix — every publication issue`, ``, `<details><summary>${pubs.filter((p) => p.verification.issues.length).length} records with notes</summary>`, ``);
for (const p of pubs.filter((p) => p.verification.issues.length)) L.push(`- \`${p.id}\` [${p.verification.status}${p.publish === false ? ", hidden" : ""}] ${p.verification.issues.join(" · ")}`);
L.push(``, `</details>`, ``);

fs.mkdirSync(PRIV, { recursive: true });
fs.writeFileSync(path.join(PRIV, "CONTENT-VERIFICATION.md"), L.join("\n"));
console.log(`Wrote content/private/CONTENT-VERIFICATION.md (${L.length} lines)`);
