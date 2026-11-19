# Updating your website — a handbook

*For Dr. Molly E. Brown. Nothing in this guide requires writing code.*

- **Website:** https://mollyelizabethbrown.github.io
- **Where the content lives:** the GitHub repository https://github.com/mollyelizabethbrown/mollyelizabethbrown.github.io
- **What you need:** a free GitHub account that has been added to the repository (ask Walid once).

Every change goes through the same safety net: the site is rebuilt, the content and every internal link are checked, and only then is the new version published (about 3 minutes). If a check fails, nothing changes on the website and the previous version stays online.

---

## 1. Add a new publication (2 minutes)

1. Open https://github.com/mollyelizabethbrown/mollyelizabethbrown.github.io/issues/new/choose
2. Choose **Add a publication**.
3. Paste the **DOI** (for example `10.1073/pnas.1905228116`).
4. Tick one to three **research themes** (the first ticked is the main one).
5. Choose whether it should appear under **Selected publications**.
6. Press **Submit new issue**.

Within a minute a comment appears on the issue:

- ✅ **Added** — with the full citation as it will appear, and a link to its page. The issue closes itself and the site updates about two minutes later.
- ⚠️ **Nothing was changed** — with the reason (a typo in the DOI, a paper already on the site, or a DOI whose author list does not include you). Click **Edit** on the issue, correct it, then **Close issue** and **Reopen issue** to try again.

The title, authors, journal, volume, pages and year come directly from Crossref, the DOI registry, so they match the publisher's record.

## 2. Post news, a talk or media coverage

1. Open https://github.com/mollyelizabethbrown/mollyelizabethbrown.github.io/issues/new/choose
2. Choose **Post news, a talk or media coverage**.
3. Fill in the headline, date (`YYYY-MM-DD`), type (new publication, research update, conference, invited lecture, perspective, project announcement, award or media coverage), a one- or two-sentence summary, and optionally the full text, a link and the DOIs of related papers.
4. Press **Submit new issue**. You will get the same ✅ / ⚠️ reply.

The **News** page appears in the site's menu automatically once the first item is published.

## 3. Edit text that is already on the site

Short corrections — a sentence in the biography, a project description, an award — are made directly in the content files on GitHub. You do not need to understand the rest of the code.

1. Open the file in the repository (see the table), then click the **pencil icon** ("Edit this file").
2. Change only the text **between the quotation marks**. Keep the quotation marks, commas and brackets exactly as they are.
3. Scroll down, write a short description (e.g. "Update biography"), and press **Commit changes**.

| To change… | Open this file |
|---|---|
| Biography, short biography, positioning line, contributions, appointments, awards, service | `content/data/profile.json` |
| Homepage NASA section and "Scientific impact" items | `content/data/highlights.json` |
| Projects (descriptions, status, research questions, outcomes) | `content/data/projects.json` |
| Research theme pages | `content/data/themes.json` |
| Students, alumni and mentees | `content/data/people.json` |
| Selected publications, featured projects, links, public email | `content/data/settings.json` |
| A publication's details | `content/data/publications.refereed.json` (articles) or `publications.other.json` (books, chapters, reports) |

If a quotation mark or comma is accidentally removed, the automatic check catches it and the website simply is not updated; GitHub shows a red ✗ next to your change under **Actions**. Undo it with the **History** button on the file, or ask Walid.

**Mark a project as finished:** in `projects.json`, change `"status": "active"` to `"status": "completed"` and set `"periodEnd"` to the final year.

**Add a student:** copy an existing entry in `people.json`, change the name, role and affiliation, and set `"category"` to `"advisee"` (current doctoral student), `"alumni"` or `"mentee"`. Every entry needs a `"source"` (for example `"source": "confirmed by MEB, 2027-01"`); please list people only with their agreement.

## 4. Images

Images live in `public/images/`. To replace your portrait, upload a new square photo named `molly-brown.jpg` into `public/images/portrait/` (**Add file → Upload files**), replacing the old one.

Satellite images come from NASA and always carry their credit line under the image; the full list of sources is at https://mollyelizabethbrown.github.io/image-credits/. When adding new images, use only imagery you have the right to use (NASA imagery is generally free to use with credit), and record its credit in `content/data/media.json`.

## 5. Your CV

To offer a downloadable CV, upload a PDF **without your home address or personal phone number** to `public/cv/` and set `"cvFile": "/cv/<file name>.pdf"` in `settings.json`. Until then the site says "Curriculum vitae available on request."

## 6. Undoing a change

Every change is recorded. In the repository, open the file → **History** → choose the earlier version. Ask Walid if you would like a change rolled back.

## 7. Things to avoid

- Don't rename the `"id"` of something already published — saved links would break.
- Never enter a home address or personal phone number anywhere.
- Don't list a student or collaborator without their agreement.
