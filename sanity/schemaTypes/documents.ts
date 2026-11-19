// @sanity/icons v5 exposes one module per icon.
import { BookIcon } from "@sanity/icons/Book";
import { CogIcon } from "@sanity/icons/Cog";
import { ComposeIcon } from "@sanity/icons/Compose";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { StarIcon } from "@sanity/icons/Star";
import { UserIcon } from "@sanity/icons/User";
import { UsersIcon } from "@sanity/icons/Users";
import { defineArrayMember, defineField, defineType } from "sanity";
import { DoiInput } from "../components/doi-input";
import { THEME_OPTIONS, verificationFields } from "./objects";

const themeRefs = defineField({
  name: "themes",
  title: "Research themes",
  type: "array",
  of: [defineArrayMember({ type: "reference", to: [{ type: "researchTheme" }] })],
  description: "First theme = primary theme. Controls where this item appears on the Research pages.",
  validation: (r) => r.unique(),
});

const slug = (source = "title") =>
  defineField({ name: "slug", title: "Web address (slug)", type: "slug", options: { source, maxLength: 80 }, description: "Click “Generate”. Changing it later breaks existing links.", validation: (r) => r.required() });

const paragraphs = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "array", of: [defineArrayMember({ type: "text", rows: 5 })], description: description ?? "One box per paragraph." });

// --- Singletons -------------------------------------------------------------------------

export const profile = defineType({
  name: "profile",
  title: "Profile & biography",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "bio", title: "Biography" },
    { name: "career", title: "Career" },
    { name: "service", title: "Service & memberships" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "postNominal", title: "Post-nominal letters", type: "string", group: "identity", initialValue: "PhD" }),
    defineField({ name: "designation", title: "Title", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "institution", type: "string", group: "identity" }),
    defineField({ name: "department", type: "string", group: "identity" }),
    defineField({ name: "tagline", type: "string", group: "identity", description: "Short line shown above the homepage headline." }),
    defineField({ name: "statement", title: "Homepage headline", type: "string", group: "identity" }),
    defineField({ name: "summary", title: "Short introduction", type: "text", rows: 4, group: "identity", description: "Two or three sentences used on the homepage and in search results." }),
    defineField({ name: "portrait", title: "Portrait", type: "image", group: "identity", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string", initialValue: "Portrait of Molly E. Brown" })] }),
    paragraphs("biography", "Biography"),
    defineField({ ...paragraphs("approach", "Scientific approach"), group: "bio" }),
    defineField({
      name: "chain", title: "Orbit-to-outcome steps", type: "array", group: "bio",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "step", type: "string" }), defineField({ name: "text", type: "text", rows: 2 })] })],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "contributions", title: "Scientific contributions", type: "array", group: "bio",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "text", rows: 3 })] })],
    }),
    defineField({
      name: "appointments", title: "Appointments", type: "array", group: "career",
      of: [defineArrayMember({
        type: "object",
        preview: { select: { title: "title", subtitle: "organization" } },
        fields: [
          defineField({ name: "title", type: "string", validation: (r) => r.required() }),
          defineField({ name: "organization", type: "string", validation: (r) => r.required() }),
          defineField({ name: "start", title: "Start (YYYY-MM)", type: "string", validation: (r) => r.regex(/^\d{4}(-\d{2})?$/) }),
          defineField({ name: "end", title: "End (YYYY-MM, blank if current)", type: "string" }),
          defineField({ name: "current", type: "boolean", initialValue: false }),
          defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: false }),
          defineField({ name: "category", type: "string", options: { list: ["academic", "industry", "nasa", "early"] } }),
          defineField({ name: "summary", type: "text", rows: 3 }),
        ],
      })],
    }),
    defineField({
      name: "education", type: "array", group: "career",
      of: [defineArrayMember({ type: "object", preview: { select: { title: "degree", subtitle: "institution" } }, fields: [
        defineField({ name: "degree", type: "string" }), defineField({ name: "institution", type: "string" }),
        defineField({ name: "year", type: "number" }), defineField({ name: "detail", type: "text", rows: 2 }),
      ] })],
    }),
    defineField({
      name: "teaching", type: "array", group: "career",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "title", type: "string" }), defineField({ name: "organization", type: "string" }),
        defineField({ name: "period", type: "string" }), defineField({ name: "detail", type: "text", rows: 2 }),
      ] })],
    }),
    defineField({
      name: "leadership", title: "Leadership & professional service", type: "array", group: "service",
      of: [defineArrayMember({ type: "object", preview: { select: { title: "role", subtitle: "body" } }, fields: [
        defineField({ name: "role", type: "string" }), defineField({ name: "body", title: "Organization / body", type: "string" }),
        defineField({ name: "period", type: "string" }), defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: false }),
      ] })],
    }),
    defineField({ name: "reviewing", title: "Journals reviewed for", type: "array", of: [defineArrayMember({ type: "string" })], group: "service" }),
    defineField({
      name: "memberships", type: "array", group: "service",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "body", type: "string" }), defineField({ name: "period", type: "string" })] })],
    }),
    defineField({ name: "contactAddress", title: "Public mailing address (one line per box)", type: "array", of: [defineArrayMember({ type: "string" })], group: "contact", description: "Institutional address only. Never enter a home address." }),
  ].map((f) => (f.name === "biography" ? { ...f, group: "bio" } : f)),
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings & homepage",
  type: "document",
  icon: CogIcon,
  groups: [{ name: "home", title: "Homepage", default: true }, { name: "site", title: "Site" }],
  fields: [
    defineField({ name: "siteTitle", type: "string", group: "site", validation: (r) => r.required() }),
    defineField({ name: "siteDescription", title: "Search-engine description", type: "text", rows: 3, group: "site", validation: (r) => r.max(300) }),
    defineField({ name: "heroImage", title: "Homepage hero image", type: "figure", group: "home" }),
    defineField({ name: "featuredProjects", title: "Featured projects (3–6)", type: "array", group: "home", of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })], validation: (r) => r.max(6).unique() }),
    defineField({ name: "featuredPublications", title: "Selected publications", type: "array", group: "home", of: [defineArrayMember({ type: "reference", to: [{ type: "publication" }] })], validation: (r) => r.max(12).unique() }),
    defineField({ name: "earthToDecisionsTitle", title: "“Orbit to outcome” heading", type: "string", group: "home" }),
    defineField({ name: "earthToDecisionsText", title: "“Orbit to outcome” text", type: "text", rows: 4, group: "home" }),
    defineField({ name: "links", title: "Scholarly & institutional links", type: "array", group: "site", of: [defineArrayMember({ type: "linkItem" })] }),
    defineField({ name: "contactEmail", title: "Public email address", type: "string", group: "site", validation: (r) => r.email() }),
    defineField({ name: "cvFile", title: "CV file (PDF)", type: "file", group: "site", options: { accept: "application/pdf" }, description: "Upload only a version WITHOUT home address or personal phone number." }),
  ],
});

// --- Collections ------------------------------------------------------------------------

export const researchTheme = defineType({
  name: "researchTheme",
  title: "Research theme",
  type: "document",
  icon: EarthGlobeIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "themeId", title: "Theme key", type: "slug", description: `Fixed identifier used in web addresses and to link projects and publications. Do not change for existing themes (${THEME_OPTIONS.map((t) => t.value).join(", ")}).`, options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Display order", type: "number", validation: (r) => r.required().integer().min(1) }),
    defineField({ name: "short", title: "Short name", type: "string", validation: (r) => r.max(30) }),
    defineField({ name: "kicker", title: "Small heading", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    paragraphs("introduction", "Introduction"),
    defineField({ name: "questions", title: "Research questions", type: "array", of: [defineArrayMember({ type: "text", rows: 2 })] }),
    defineField({ name: "methods", title: "Approaches and methods", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({
      name: "findings", title: "Representative published work", type: "array",
      of: [defineArrayMember({ type: "object", preview: { select: { title: "text", subtitle: "publication.title" } }, fields: [
        defineField({ name: "publication", type: "reference", to: [{ type: "publication" }], validation: (r) => r.required() }),
        defineField({ name: "text", title: "What the work showed (one sentence)", type: "text", rows: 2, validation: (r) => r.required() }),
      ] })],
    }),
    defineField({ name: "image", type: "figure" }),
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ProjectsIcon,
  groups: [{ name: "main", title: "Project", default: true }, { name: "links", title: "Links" }, { name: "admin", title: "Verification" }],
  fields: [
    defineField({ name: "title", type: "string", group: "main", validation: (r) => r.required() }),
    { ...slug(), group: "main" },
    defineField({ name: "abstract", type: "text", rows: 6, group: "main", validation: (r) => r.required() }),
    defineField({ name: "goals", title: "Research goals", type: "array", group: "main", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "periodStart", title: "Start year", type: "number", group: "main", validation: (r) => r.required().integer().min(1980).max(2100) }),
    defineField({ name: "periodEnd", title: "End year (blank if ongoing)", type: "number", group: "main" }),
    defineField({ name: "status", type: "string", group: "main", options: { list: [{ title: "Active", value: "active" }, { title: "Completed", value: "completed" }], layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "funder", title: "Funding institution", type: "string", group: "main", validation: (r) => r.required() }),
    defineField({ name: "program", title: "Funding program", type: "string", group: "main" }),
    defineField({ name: "role", title: "Dr. Brown's role", type: "string", group: "main", validation: (r) => r.required() }),
    defineField({ name: "leadPI", title: "Lead investigator", type: "string", group: "main" }),
    defineField({ name: "collaborators", title: "Collaborating organizations", type: "array", group: "main", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "geography", title: "Study geography", type: "array", group: "main", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "methods", type: "array", group: "main", of: [defineArrayMember({ type: "string" })] }),
    { ...themeRefs, group: "links" },
    defineField({ name: "publications", title: "Publications and outputs", type: "array", group: "links", of: [defineArrayMember({ type: "reference", to: [{ type: "publication" }] })] }),
    defineField({ name: "related", title: "Related projects", type: "array", group: "links", of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })] }),
    defineField({ name: "featured", title: "Featured", type: "boolean", group: "main", initialValue: false }),
    defineField({ name: "hidden", title: "Hide from website", type: "boolean", group: "admin", initialValue: false }),
    ...verificationFields,
  ],
  orderings: [{ title: "Newest first", name: "startDesc", by: [{ field: "periodStart", direction: "desc" }] }],
  preview: { select: { title: "title", start: "periodStart", end: "periodEnd", status: "status" }, prepare: ({ title, start, end, status }) => ({ title, subtitle: `${start ?? ""}–${end ?? "present"} · ${status ?? ""}` }) },
});

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  icon: DocumentTextIcon,
  groups: [{ name: "main", title: "Citation", default: true }, { name: "links", title: "Themes & extras" }, { name: "admin", title: "Verification" }],
  fields: [
    defineField({ name: "doi", title: "DOI", type: "string", group: "main", components: { input: DoiInput }, description: "Paste a DOI (e.g. 10.1073/pnas.1905228116) and press “Fill from DOI” to import the citation from Crossref. Check the result before publishing.", validation: (r) => r.regex(/^10\.\d{4,9}\/\S+$/, { name: "DOI" }).warning() }),
    defineField({ name: "title", type: "string", group: "main", validation: (r) => r.required() }),
    { ...slug(), group: "main" },
    defineField({ name: "authors", type: "array", group: "main", of: [defineArrayMember({ type: "string" })], description: "One author per line, in order, as “Family, Initials.” (e.g. Brown, M.E.).", validation: (r) => r.required().min(1) }),
    defineField({ name: "year", type: "number", group: "main", validation: (r) => r.required().integer().min(1980).max(2100) }),
    defineField({ name: "type", title: "Publication type", type: "string", group: "main", initialValue: "journal-article", validation: (r) => r.required(), options: { list: [
      { title: "Journal article", value: "journal-article" }, { title: "Letter / commentary", value: "letter-commentary" },
      { title: "Book", value: "book" }, { title: "Book chapter", value: "book-chapter" }, { title: "Conference paper", value: "conference-paper" },
      { title: "Report", value: "report" }, { title: "Magazine article", value: "magazine-article" }, { title: "Book review", value: "book-review" },
      { title: "Dataset", value: "dataset" }, { title: "Editorial", value: "editorial" }, { title: "Patent", value: "patent" },
    ] } }),
    defineField({ name: "status", type: "string", group: "main", initialValue: "published", options: { list: [
      { title: "Published", value: "published" }, { title: "In press", value: "in-press" }, { title: "Submitted", value: "submitted" }, { title: "In review", value: "in-review" }, { title: "Pending", value: "pending" },
    ], layout: "radio", direction: "horizontal" }, validation: (r) => r.required() }),
    defineField({ name: "container", title: "Journal / book / conference", type: "string", group: "main" }),
    defineField({ name: "volume", type: "string", group: "main" }),
    defineField({ name: "issue", type: "string", group: "main" }),
    defineField({ name: "pages", title: "Pages or article number", type: "string", group: "main" }),
    defineField({ name: "publisher", type: "string", group: "main" }),
    defineField({ name: "editors", type: "string", group: "main" }),
    defineField({ name: "isbn", title: "ISBN", type: "string", group: "main" }),
    defineField({ name: "url", title: "Web link (if no DOI)", type: "url", group: "main" }),
    { ...themeRefs, group: "links" },
    defineField({ name: "abstract", type: "text", rows: 6, group: "links", description: "Optional. Only paste the published abstract if the publisher's licence allows it, or write a short summary." }),
    defineField({ name: "featured", title: "Selected publication", type: "boolean", group: "links", initialValue: false }),
    defineField({ name: "cvSection", title: "CV section", type: "string", group: "admin", readOnly: true }),
    defineField({ name: "hidden", title: "Hide from website", type: "boolean", group: "admin", initialValue: false, description: "Use for unpublished manuscripts or duplicates." }),
    ...verificationFields,
  ],
  orderings: [{ title: "Newest first", name: "yearDesc", by: [{ field: "year", direction: "desc" }, { field: "title", direction: "asc" }] }],
  preview: { select: { title: "title", year: "year", container: "container", hidden: "hidden" }, prepare: ({ title, year, container, hidden }) => ({ title, subtitle: `${hidden ? "HIDDEN · " : ""}${year ?? ""} · ${container ?? ""}` }) },
});

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "year", type: "number", validation: (r) => r.required() }),
    defineField({ name: "publisher", type: "string", validation: (r) => r.required() }),
    defineField({ name: "series", type: "string" }),
    defineField({ name: "pages", title: "Extent (pages)", type: "string" }),
    defineField({ name: "doi", title: "DOI", type: "string" }),
    defineField({ name: "isbn", title: "ISBNs", type: "object", fields: [defineField({ name: "hardcover", type: "string" }), defineField({ name: "softcover", type: "string" }), defineField({ name: "ebook", type: "string" })] }),
    defineField({ name: "publisherUrl", title: "Publisher page", type: "url" }),
    defineField({ name: "summary", type: "text", rows: 5 }),
    defineField({ name: "cover", title: "Cover image", type: "image", description: "Use the publisher's cover artwork." }),
    themeRefs,
  ],
});

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "category", type: "string", validation: (r) => r.required(), options: { list: [
      { title: "Principal investigator", value: "pi" }, { title: "Current collaborator", value: "collaborator" },
      { title: "Postdoctoral researcher", value: "postdoc" }, { title: "Graduate researcher", value: "graduate" }, { title: "Alumni", value: "alumni" },
    ] } }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "affiliation", type: "string" }),
    defineField({ name: "period", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "photo", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string" })] }),
    defineField({ name: "url", title: "Personal or institutional page", type: "url" }),
    defineField({ name: "orderRank", title: "Sort order", type: "number" }),
    defineField({ name: "published", title: "Show on website", type: "boolean", initialValue: false, description: "Keep off until the person has agreed to be listed." }),
  ],
  preview: { select: { title: "name", subtitle: "role", published: "published" }, prepare: ({ title, subtitle, published }) => ({ title, subtitle: `${published ? "" : "NOT LISTED · "}${subtitle ?? ""}` }) },
});

export const news = defineType({
  name: "news",
  title: "News & perspectives",
  type: "document",
  icon: ComposeIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "date", type: "date", validation: (r) => r.required(), initialValue: () => new Date().toISOString().slice(0, 10) }),
    defineField({ name: "category", type: "string", validation: (r) => r.required(), options: { list: [
      { title: "New publication", value: "publication" }, { title: "Research update", value: "research-update" },
      { title: "Conference", value: "conference" }, { title: "Invited lecture", value: "lecture" },
      { title: "Perspective", value: "perspective" }, { title: "Project announcement", value: "project" }, { title: "Award", value: "award" },
    ] } }),
    defineField({ name: "excerpt", title: "Summary", type: "text", rows: 3, validation: (r) => r.required().max(320) }),
    defineField({ name: "image", type: "figure" }),
    defineField({ name: "body", type: "array", of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }, { title: "Heading", value: "h2" }, { title: "Subheading", value: "h3" }, { title: "Quote", value: "blockquote" }] })] }),
    defineField({ name: "relatedPublications", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "publication" }] })] }),
    defineField({ name: "relatedProjects", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })] }),
  ],
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
});

export const award = defineType({
  name: "award",
  title: "Award",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", type: "number", validation: (r) => r.required() }),
    defineField({ name: "detail", type: "text", rows: 2 }),
    defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Newest first", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "year" } },
});
