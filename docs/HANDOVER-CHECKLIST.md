# Hosting and handover checklist

Hosting: **GitHub Pages**, free organization **`mollyelizabethbrown`**, public repository **`mollyelizabethbrown.github.io`** → https://mollyelizabethbrown.github.io

## 1. Repository settings (once)

- [x] Organization and repository created; first deploy live
- [ ] **Settings → Pages → Source: GitHub Actions**
- [ ] **Settings → Actions → General → Workflow permissions: "Read and write permissions"** (lets the issue-form workflow commit content and comment on issues)
- [ ] **Issues → Labels → New label**: create `content: publication` and `content: news` (optional — the workflow also recognises the forms by their titles)
- [ ] Do **not** add branch protection that blocks `github-actions[bot]` from pushing to `main` (the content workflow commits there)
- [ ] Test: open an "Add a publication" issue with an existing DOI → you should get a ⚠️ "already on the website" reply within a minute

## 2. Give Dr. Brown access

- [ ] Ask Dr. Brown for her GitHub username (or help her create a free account)
- [ ] Organization → **People → Invite member** as **Owner** (or add her to the repository as a collaborator with *Write* access)
- [ ] Send her `docs/ADMIN-HANDBOOK.md` (it is also linked from the issue-form chooser)
- [ ] Walk through one publication form and one text edit together

## 3. Content approval (Dr. Brown)

Send the private report `content/private/CONTENT-VERIFICATION.md` (not in the repository).

- [ ] Portrait confirmed (currently her LinkedIn photo)
- [ ] Positioning line, short and extended biography, contributions, NASA section and impact items approved
- [ ] Flagship project questions and outcomes approved
- [ ] People list confirmed (roles taken from her CV, pp. 54–56)
- [ ] Public email confirmed; redacted CV supplied or "available on request" kept

## 4. Launch

- [ ] **Settings → Secrets and variables → Actions → Variables** → `ALLOW_INDEXING` = `true`
- [ ] **Actions → Deploy site → Run workflow**; check https://mollyelizabethbrown.github.io/robots.txt now allows crawling
- [ ] Optional custom domain: Settings → Pages → Custom domain; then update `NEXT_PUBLIC_SITE_URL` in `.github/workflows/deploy.yml`

## 5. Continuity

- [ ] Two-factor authentication on every owner account; backup codes stored offline
- [ ] At least two owners of the organization (Walid and Dr. Brown)
- [ ] Keep a copy of `content/private/` outside your laptop — it is not on GitHub
