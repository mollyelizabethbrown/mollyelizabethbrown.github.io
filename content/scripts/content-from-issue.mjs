#!/usr/bin/env node
/**
 * Turn a GitHub issue-form submission into a content change (run by .github/workflows/content-from-issue.yml).
 *
 * Env: ISSUE_BODY, ISSUE_LABELS (JSON array of label names), RESULT_FILE (markdown reply for the issue),
 *      GITHUB_OUTPUT (set by Actions; receives changed=true|false and summary=<commit message>).
 * Local test:  ISSUE_LABELS='["content: news"]' ISSUE_BODY="$(cat sample.md)" node content/scripts/content-from-issue.mjs
 */
import fs from "node:fs";
import { THEME_LABELS, isDoi, normalizeDoi, publicationFromDoi, readData, savePublication, slugify, writeData } from "./lib/content-db.mjs";

const NEWS_CATEGORIES = {
  "New publication": "publication", "Research update": "research-update", Conference: "conference", "Invited lecture": "lecture",
  Perspective: "perspective", "Project announcement": "project", Award: "award", "Media coverage": "media",
};

/** Parse the markdown an issue form produces: "### Label\n\nvalue" blocks; "_No response_" means empty. */
export function parseIssueForm(body) {
  const out = {};
  const parts = String(body || "").replace(/\r\n/g, "\n").split(/^### +/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const label = part.slice(0, nl === -1 ? undefined : nl).trim();
    const value = nl === -1 ? "" : part.slice(nl + 1).trim();
    out[label] = value === "_No response_" ? "" : value;
  }
  return out;
}

const checked = (v) => [...String(v || "").matchAll(/^- \[[xX]\] (.+)$/gm)].map((m) => m[1].trim());

async function handlePublication(f) {
  const themes = checked(f["Research themes"]).map((l) => THEME_LABELS[l]).filter(Boolean).slice(0, 3);
  const pub = await publicationFromDoi(f["DOI"], themes);
  const selected = /^yes$/i.test(f['Include in "Selected publications"?'] || "");
  savePublication(pub, { selected });
  const r = pub.record;
  return {
    summary: `Add publication ${r.doi}`,
    reply: [
      `✅ **Added to the website** — it will be live in about 3 minutes.`,
      ``,
      `> ${r.authors.slice(0, 8).join(", ")}${r.authors.length > 8 ? " et al." : ""} (${r.year}). **${r.title}**. *${r.container ?? ""}*${r.volume ? ` ${r.volume}` : ""}${r.issue ? `(${r.issue})` : ""}${r.pages ? `: ${r.pages}` : ""}. https://doi.org/${r.doi}`,
      ``,
      `Themes: ${r.themes.join(", ")}${selected ? " · listed under Selected publications" : ""}`,
      ``,
      `Page: https://mollyelizabethbrown.github.io/publications/${r.id}/`,
    ].join("\n"),
  };
}

function handleNews(f) {
  const errors = [];
  const title = (f["Headline"] || "").trim();
  const date = (f["Date"] || "").trim();
  const category = NEWS_CATEGORIES[(f["Type"] || "").trim()];
  const excerpt = (f["Summary"] || "").replace(/\s+/g, " ").trim();
  const body = (f["Full text (optional)"] || "").split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const url = (f["Link (optional)"] || "").trim();
  const label = (f["Link text (optional)"] || "").trim() || "Read more";
  const dois = (f["Related publication DOIs (optional)"] || "").split(/[,\s]+/).map(normalizeDoi).filter(Boolean);

  if (!title) errors.push("The headline is empty.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.push(`The date “${date}” is not in the form YYYY-MM-DD.`);
  if (!category) errors.push("Please choose a type.");
  if (!excerpt) errors.push("The summary is empty.");
  if (excerpt.length > 320) errors.push(`The summary is ${excerpt.length} characters; please shorten it to 320.`);
  if (url && !/^https:\/\/[^\s]+$/.test(url)) errors.push(`The link “${url}” must start with https://`);
  const known = new Set([...readData("publications.refereed.json"), ...readData("publications.other.json")].filter((p) => p.doi).map((p) => p.doi.toLowerCase()));
  for (const d of dois) {
    if (!isDoi(d)) errors.push(`“${d}” is not a DOI.`);
    else if (!known.has(d.toLowerCase())) errors.push(`The DOI ${d} is not on the website yet — add it first with the “Add a publication” form.`);
  }
  if (errors.length) throw new Error(errors.map((e) => `- ${e}`).join("\n"));

  const news = readData("news.json");
  let id = `${date.slice(0, 7)}-${slugify(title)}`;
  while (news.some((n) => n.id === id)) id += "-b";
  news.unshift({ id, title, date, category, excerpt, body, link: url ? { label, url } : null, relatedPublicationDois: dois, relatedProjectIds: [], imageId: null, publish: true });
  news.sort((a, b) => b.date.localeCompare(a.date));
  writeData("news.json", news);
  return {
    summary: `News: ${title}`,
    reply: `✅ **Posted** — it will be live in about 3 minutes at https://mollyelizabethbrown.github.io/news/${id}/`,
  };
}

async function main() {
  const labels = JSON.parse(process.env.ISSUE_LABELS || "[]");
  const title = process.env.ISSUE_TITLE || "";
  const fields = parseIssueForm(process.env.ISSUE_BODY);
  let result;
  try {
    if (labels.includes("content: publication") || title.startsWith("Add publication:")) result = await handlePublication(fields);
    else if (labels.includes("content: news") || title.startsWith("News:")) result = handleNews(fields);
    else throw new Error("This issue is not a content form.");
  } catch (e) {
    result = { error: true, reply: `⚠️ **Nothing was changed.**\n\n${e.message}\n\nEdit the issue to fix this, then close and reopen it to try again.` };
  }
  if (process.env.RESULT_FILE) fs.writeFileSync(process.env.RESULT_FILE, result.reply + "\n");
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result.error ? "false" : "true"}\nsummary=${(result.summary ?? "").replace(/\n/g, " ")}\n`);
  }
  console.log(result.reply);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) await main();
