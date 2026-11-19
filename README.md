# Molly E. Brown — research website

**Live:** https://mollyelizabethbrown.github.io · **Repo:** `mollyelizabethbrown/mollyelizabethbrown.github.io`

Next.js 16 (App Router, TypeScript, **static export**) · Tailwind CSS 4 · GitHub Pages via GitHub Actions. No server, no database, no third-party CMS: all content is versioned JSON in `content/data/`.

```
app/(site)/…          pages: home, about, research (+5 themes), projects (+flagship pages), publications, books, people, news, contact
components/           header, footer, explorers (publications/projects), citations, evidence references
lib/content/          data layer: index.ts (facade used by pages) · local.ts (reads content/data)
lib/                  types, citation/BibTeX formatting, JSON-LD, site config
content/data/         content database — public (provenance + verification on every record)
content/private/      GITIGNORED: unlisted records (unpublished manuscripts), audit reports, privacy patterns
content/source/       GITIGNORED: raw CV (contains a private home address and phone number)
content/scripts/      CV extraction, DOI verification, DOI import, issue-form handler, verification report
scripts/              QA: content validation, link crawler, static server, screenshots, image optimisation
docs/                 admin handbook (for Dr. Brown), handover checklist, design notes
.github/              deploy workflow, issue-form workflow, issue forms
```

> **The repository is public.** Anything committed is published. Unpublished manuscripts, audit reports and the raw CV stay in gitignored folders; `npm run check:content` fails if an unlisted record, a confidential title or a private CV detail appears in public files.

## Editing content (no code)

See **`docs/ADMIN-HANDBOOK.md`**. In short:

| Task | How |
|---|---|
| Add a publication | Issue form **Add a publication** (DOI → Crossref import, validation, commit, deploy, reply on the issue) |
| Post news / talk / media coverage | Issue form **Post news, a talk or media coverage** |
| Edit existing text | Pencil-edit the JSON file on GitHub |

The issue workflow (`.github/workflows/content-from-issue.yml`) only acts on issues opened by repository owners, organization members or collaborators.

## Develop

```bash
npm install
npm run dev                     # http://localhost:3000
npm run build                   # static site in out/
npm run serve:out               # serve out/ like GitHub Pages on http://localhost:4173
```

Node 20.9+ (22 LTS recommended).

## Checks (run in CI before every deploy)

| Command | What it checks |
|---|---|
| `npm run check:content` | Publication metadata (DOI format, year, type, status, authors), duplicates, dangling references (projects, flagship outcomes, highlights, news, featured items, images), people sources, privacy leaks, unlisted records in public files |
| `npm run typecheck` | TypeScript |
| `npm run build` | Static export (~240 pages) |
| `npm run check:site -- http://localhost:4173` | Crawls the built site: broken internal links and images, missing title/description/canonical, one `h1` per page |

Occasional, manual:

| Command | Purpose |
|---|---|
| `npm run verify:dois [-- --suggest]` | Re-check every DOI against Crossref/DataCite → `content/private/reports/` |
| `node content/scripts/build-verification-report.mjs` | Regenerate `content/private/CONTENT-VERIFICATION.md` |
| `npm run import:doi -- <DOI> --theme <key> [--selected]` | Command-line equivalent of the publication form |
| `bash scripts/optimize-images.sh <files>` | Resize new images (≤2000 px) before committing |

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml` (checks → build → link check → GitHub Pages). Search engines are blocked until the repository variable `ALLOW_INDEXING` is `true`.

## Content rules baked into the code

- Records with `"publish": false` never render; unpublished manuscripts are not kept in the public repository at all.
- "Recent activity" shows only published work with a verified DOI.
- Recent collaborators are derived from co-authorship on verified publications — not presented as group membership.
- People are listed only with a source (CV page or confirmation).
- Third-party images always render their credit line.
- Funding amounts and effort percentages from the CV are never displayed; no citation counts or other metrics are shown.
