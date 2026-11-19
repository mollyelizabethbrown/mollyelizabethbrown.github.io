# Hosting and handover checklist

Hosting: **GitHub Pages**, free organization **`mollyelizabethbrown`** (owner: Walid Ouaret), repository **`mollyelizabethbrown.github.io`** → https://mollyelizabethbrown.github.io

Nothing goes public until Dr. Brown approves (search engines stay blocked until §3).

## 1. First publication (Walid)

- [ ] Create the free organization `mollyelizabethbrown` — https://github.com/account/organizations/new?plan=free
- [ ] Create the **public** repository `mollyelizabethbrown.github.io` in that organization, **empty** (no README, no .gitignore, no licence)
- [ ] Repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**
- [ ] Push from your own terminal (the local repository is already committed on `main`, remote set):
  ```
  cd D:\molly_brown_website
  git push -u origin main
  ```
- [ ] Repository → **Actions** → *Deploy site* finishes green (~2 min) → open https://mollyelizabethbrown.github.io
- [ ] Before pushing, confirm `git status --ignored` lists `content/private/` and `content/source/` as ignored

## 2. Content approval (Dr. Brown)

Send her the private report `content/private/CONTENT-VERIFICATION.md` (not in the repository) and the preview link.

- [ ] Open items in the report §3–6 decided
- [ ] Approved portrait (add via the CMS, or send the file to be committed to `public/images/` and set in `content/data/profile.json` → `photo.file`)
- [ ] Redacted CV, or decision to keep "available on request"
- [ ] Public email confirmed · book cover use confirmed · editorial texts approved
- [ ] Hidden manuscripts confirmed hidden

## 3. Launch

- [ ] Repository → Settings → Secrets and variables → Actions → **Variables** → `ALLOW_INDEXING` = `true`
- [ ] Actions → *Deploy site* → Run workflow; check https://mollyelizabethbrown.github.io/robots.txt now says `Allow: /`
- [ ] Optional custom domain: Settings → Pages → Custom domain, DNS records per GitHub's instructions; then change `NEXT_PUBLIC_SITE_URL` in `.github/workflows/deploy.yml`

## 4. Optional: CMS for Dr. Brown

See README → *Optional: the Sanity CMS*.

- [ ] Sanity project created **from Dr. Brown's own account**; she is Administrator; you are a member (remove later if she prefers)
- [ ] Content imported; Studio deployed at https://mollyelizabethbrown.sanity.studio
- [ ] Repository variable `SANITY_PROJECT_ID` set; webhook to GitHub created and tested (publish a small edit → Actions run → change visible)
- [ ] Dr. Brown can complete `ADMIN-HANDBOOK.md` §2 tasks unaided
- [ ] Add Dr. Brown as an **owner** of the GitHub organization too, so access never depends on one person

## 5. Recovery and continuity

- [ ] 2FA on GitHub (and Sanity), backup codes stored offline
- [ ] At least two owners on the GitHub organization
- [ ] Keep a copy of `content/private/` outside the laptop (it is not in GitHub): it holds unlisted records and the audit trail
- [ ] If using Sanity: periodic backup `npx sanity dataset export production backup.tar.gz`

## Accounts summary

| Service | URL | Owners | 2FA | Cost |
|---|---|---|---|---|
| GitHub org | https://github.com/mollyelizabethbrown | | | Free |
| GitHub Pages | https://mollyelizabethbrown.github.io | (org) | | Free |
| Sanity (optional) | https://www.sanity.io/manage | | | Free plan |
| Custom domain (optional) | | | | |
