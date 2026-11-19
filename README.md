# Molly E. Brown — research website

**Live:** https://mollyelizabethbrown.github.io · **Repo:** `mollyelizabethbrown/mollyelizabethbrown.github.io`

Next.js 16 (App Router, TypeScript, **static export**) · Tailwind CSS 4 · Sanity 6 (optional CMS, Studio hosted by Sanity) · GitHub Pages via GitHub Actions.

The site is fully static. At build time it reads from **Sanity** when the repository variable `SANITY_PROJECT_ID` is set, and otherwise from the **local content database** in `content/data/` — the verified dataset extracted from Dr. Brown's CV, which is also the seed for the CMS. Pages only call `lib/content/index.ts`, so both sources produce identical pages.

```
app/(site)/…          public pages (home, about, research, projects, publications, books, people, news, contact)
components/           UI components (header, footer, explorers, citations, figures)
lib/content/          data layer: index.ts (facade) · local.ts (JSON) · sanity.ts (GROQ, build-time)
lib/                  types, formatting/BibTeX, JSON-LD, site config
sanity/ + sanity.*.ts Sanity Studio: schemas, sidebar structure, "Fill from DOI" input
content/data/         content database (JSON, provenance + verification per record) — public
content/private/      GITIGNORED: unlisted records (unpublished manuscripts, people awaiting consent), audit reports
content/source/       GITIGNORED: raw CV (contains a private home address and phone number)
content/scripts/      CV extraction, DOI verification, DOI import, Sanity seed, verification report
scripts/              QA: content integrity, site crawler, screenshots, image optimisation
docs/                 admin handbook, handover checklist, design notes
.github/workflows/    build + deploy to GitHub Pages
```

> **The repository is public.** Anything committed is published. Unlisted records and audit reports live in `content/private/`, which is gitignored; `npm run check:content` fails if an unlisted record or an unpublished manuscript title appears anywhere in the public tree, or if the CV's private details leak.

## Develop

```bash
npm install
npm run dev                     # http://localhost:3000
npm run build                   # static site in out/
```

Node 20.9+ (22 LTS recommended).

## Publish (GitHub Pages)

Every push to `main` builds and deploys automatically (`.github/workflows/deploy.yml`, ~2 min). Watch it under the repository's **Actions** tab. A manual rebuild: Actions → *Deploy site* → **Run workflow**.

First-time setup is in `docs/HANDOVER-CHECKLIST.md` §1.

Search engines are blocked (`robots.txt: Disallow: /`) until the repository variable `ALLOW_INDEXING` is set to `true` — only after Dr. Brown approves the launch.

## Quality checks

| Command | What it checks |
|---|---|
| `npm run check:content` | Duplicate ids, unknown themes, dangling references, missing images, private CV details, unlisted records or confidential titles in public files |
| `npm run typecheck` | TypeScript |
| `npm run build` | Static export (240+ pages) |
| `npx serve out` / `python -m http.server -d out` then `npm run check:site -- http://localhost:<port>` | Crawls the built site: broken links/images, missing title/description/canonical, h1 count |
| `npm run verify:dois [-- --suggest]` | Re-checks every DOI against Crossref/DataCite → `content/private/reports/` |
| `node content/scripts/build-verification-report.mjs` | Regenerates `content/private/CONTENT-VERIFICATION.md` |
| `bash scripts/optimize-images.sh <files>` | Resizes new local images (≤2000 px) before committing |

The workflow runs `check:content`, `typecheck` and `build` before every deploy; a failure stops the deploy.

## Adding a publication without the CMS

`npm run import:doi -- 10.xxxx/yyyy --theme food-security` → review the new record at the top of `content/data/publications.refereed.json` → `npm run check:content` → commit and push.

## Optional: the Sanity CMS (for Dr. Brown to edit without git)

Done once, from **Dr. Brown's own Sanity account** (free plan is enough):

```bash
npx sanity login
npx sanity init --env .env.local                 # "create new project", dataset "production" (public)
# copy the project ID into .env.local as NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_STUDIO_PROJECT_ID
npm run sanity:seed                              # content/data (+ content/private if present) → content/seed/seed.ndjson
npx sanity dataset import content/seed/seed.ndjson production --replace
npx sanity deploy                                # Studio at https://mollyelizabethbrown.sanity.studio
```

Then, on GitHub: **Settings → Secrets and variables → Actions → Variables** → add `SANITY_PROJECT_ID`. From the next build on, the site reads from Sanity.

### Content updates (publish in Studio → site rebuilds)

Create a **fine-grained personal access token** on GitHub (repository: this one only; permission *Contents: Read and write*), then in **sanity.io/manage → API → Webhooks → Create**:

| Field | Value |
|---|---|
| URL | `https://api.github.com/repos/mollyelizabethbrown/mollyelizabethbrown.github.io/dispatches` |
| Trigger on | Create, Update, Delete · Filter: *(empty)* |
| Projection | `{"event_type": "sanity-publish"}` |
| HTTP method | POST |
| HTTP headers | `Authorization: Bearer <token>` · `Accept: application/vnd.github+json` |
| Drafts | off |

Each publish then triggers the deploy workflow; changes are live in ~2 minutes.

Sanity's CLI collects anonymous telemetry; `npx sanity telemetry disable` turns it off.

## Content rules baked into the code

- Records with `publish: false` (local) or `hidden: true` (CMS) never render — and unlisted local records are kept out of the repository.
- DOIs that fail verification are not linked.
- Third-party images always render their credit line; `/image-credits` lists sources and terms.
- Project funding amounts and effort percentages from the CV are never displayed.
