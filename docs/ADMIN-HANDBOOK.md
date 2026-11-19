# Managing your website — a handbook

*For Dr. Molly E. Brown. No coding is needed for anything in this guide.*

Your website has two parts:

- **The website** that visitors see: **https://mollyelizabethbrown.github.io**
- **The Studio**, a private editing dashboard: **https://mollyelizabethbrown.sanity.studio**. Everything on the site — biography, projects, publications, news, images, links, the homepage selection — is edited there.

Changes you **Publish** in the Studio appear on the website about **two minutes** later (the site is rebuilt automatically each time).

---

## 1. Logging in

1. Go to https://mollyelizabethbrown.sanity.studio.
2. Sign in with the Google account, GitHub account or email you used to create your Sanity account.
3. The left-hand menu lists everything you can edit:

| Menu item | What it controls |
|---|---|
| **Profile & biography** | Your name, title, homepage headline, biography, scientific approach, career, education, service, mailing address, portrait |
| **Site settings & homepage** | Hero image, featured projects and publications, scholarly links, public email, downloadable CV |
| **News & perspectives** | Posts on the News page |
| **Publications** | The bibliography |
| **Projects** | The Projects collection |
| **Research themes** | The five Research pages |
| **Books**, **People**, **Awards** | Those pages and sections |

> **Tip.** Every document has a **Publish** button at the bottom right. Until you press it, your edits are a *draft* that only you can see.

---

## 2. Everyday tasks

### Add a new publication (2 minutes)

1. **Publications → ✚ (Create new)**.
2. Paste the DOI (for example `10.1073/pnas.1905228116`) into the **DOI** field and press **Fill from DOI**. Title, authors, journal, year, volume, issue and pages are filled from Crossref.
3. Check the result. Authors should read `Family, Initials.` — for example `Brown, M.E.` (your name is bolded automatically wherever it appears).
4. Under **Web address (slug)** press **Generate**.
5. Open the **Themes & extras** tab and add one to three **Research themes** (the first is the main one). This is what makes the paper appear on the right Research page.
6. Optional: tick **Selected publication** to include it in the "Selected publications only" filter.
7. Press **Publish**.

No DOI (a report or chapter)? Fill the fields by hand and add a **Web link** instead.

**Unpublished manuscripts:** set **Status** to *Submitted* or *In review* and switch on **Hide from website** (Verification tab) unless you want it listed.

### Feature something on the homepage

**Site settings & homepage → Homepage tab.**

- **Featured projects** — choose 3 to 6. Drag to reorder.
- **Selected publications** — up to 12. They are shown newest first.
- **Homepage hero image** — the large image at the top (see §3 on credits).

### Post news (a new paper, a lecture, an award)

1. **News & perspectives → ✚**.
2. Title, **Generate** slug, date, category, a one- or two-sentence **Summary**.
3. Write the post in **Body**. Use the toolbar for headings, bold, links and quotes.
4. Optional: add an image (with its credit), **Related publications** and **Related projects** — they are listed under the post.
5. **Publish**.

### Add or update a project

**Projects → ✚** (or open an existing one). Required: title, abstract, start year, status, funding institution, your role. Under **Links**, connect the research themes and the publications the project produced — the project then appears on those theme pages and on each publication's page.

When a project ends, change **Status** to *Completed* and fill the **End year**.

### Update your biography or career

**Profile & biography.** Each paragraph of the biography is its own box. To add a new appointment, open the **Career** tab → **Appointments → Add item**. Tick **current** for positions you still hold.

### Replace your CV

**Site settings & homepage → Site tab → CV file → Upload.**

> ⚠️ **Only upload a version without your home address and personal phone number.** The original CV file contains both.

Until a CV is uploaded the About page says "A full curriculum vitae is available on request."

### Add your portrait

**Profile & biography → Identity tab → Portrait → Upload**, then drag the circle on the image (the *hotspot*) onto your face so crops stay centred. Fill in the alternative text.

### Add a student or collaborator

**People → ✚**. Choose the category (graduate researcher, postdoc, collaborator, alumni). New people are **not listed** until you switch on **Show on website** — please ask them first.

### Change scholarly links or the public email

**Site settings & homepage → Site tab → Scholarly & institutional links** (ORCID, Google Scholar, UMD…) and **Public email address**.

---

## 3. Images and credits

Every image field asks for a **Credit line**, and the site prints it under the image. Please keep it exactly as the source requests.

- **NASA imagery** (Earth Observatory, Visible Earth, SVS) is generally not copyrighted and may be used with credit, e.g. *"NASA Earth Observatory image by Lauren Dauphin, using Landsat data from the U.S. Geological Survey."*
- Your own figures: credit the paper, e.g. *"Figure 2 from Cooper et al. (2019), PNAS."* — check the journal's licence first.
- Avoid stock photography and images marked "non-commercial" or "no derivatives" unless you have permission.

Images are resized automatically; upload the largest version you have (JPEG or PNG).

---

## 4. Drafts and publishing

Everything you type is saved automatically as a **draft** that only Studio users can see. Nothing changes on the website until you press **Publish**; about two minutes later the site has been rebuilt with your change. If it hasn't appeared after five minutes, refresh the page in your browser (your browser may be showing a saved copy).

## 5. Undoing a mistake

Every document keeps a full history. Open the document → the **clock icon** (top right) → choose an earlier version → **Restore**. Deleted documents can also be restored from history for a period that depends on your Sanity plan.

## 6. Things to avoid

- **Don't change the "Web address (slug)" of something already published** — links people have saved would break.
- **Don't change the "Theme key"** of the five research themes.
- **Never enter a home address or personal phone number** anywhere.
- Don't delete the *Profile* or *Site settings* documents (the Studio prevents it).

## 7. Who to ask

- **Studio or content questions** — Sanity's help centre: https://www.sanity.io/docs
- **Website hosting** — GitHub Pages, repository https://github.com/mollyelizabethbrown/mollyelizabethbrown.github.io (the **Actions** tab shows each rebuild; a red ✗ means a rebuild failed and the previous version is still online).
- **Something looks broken** — Walid Ouaret, or any web developer familiar with Next.js; the code and its documentation are in the repository.
