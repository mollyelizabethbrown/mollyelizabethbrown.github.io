import { defineArrayMember, defineField, defineType } from "sanity";

export const THEME_OPTIONS = [
  { title: "Earth Observation and Environmental Change", value: "earth-observation" },
  { title: "Agriculture and Food Security", value: "food-security" },
  { title: "Climate Risk and Human Well-being", value: "climate-risk" },
  { title: "Earth Science Applications and Decision Support", value: "applications" },
  { title: "Sustainable Development and Resilient Food Systems", value: "sustainable-food-systems" },
];

/** An image that always carries its credit and reuse terms. */
export const figure = defineType({
  name: "figure",
  title: "Image with credit",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alternative text", type: "string", description: "Describe the image for screen-reader users (what it shows, not what it means).", validation: (r) => r.required().max(180) }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "text", rows: 2, description: "Optional. One or two factual sentences." }),
    defineField({ name: "credit", title: "Credit line", type: "string", description: "Required. Exactly as the source asks, e.g. “NASA Earth Observatory image by …, using Landsat data from the USGS.”", validation: (r) => r.required() }),
    defineField({ name: "sourceUrl", title: "Source page", type: "url" }),
    defineField({ name: "license", title: "Reuse terms", type: "string", description: "e.g. “NASA media usage guidelines — not copyrighted, credit NASA.”" }),
    defineField({ name: "licenseUrl", title: "Reuse terms link", type: "url" }),
  ],
});

export const verificationFields = [
  defineField({
    name: "verificationStatus",
    title: "Verification status",
    type: "string",
    group: "admin",
    options: {
      list: [
        { title: "Verified (DOI/publisher checked)", value: "verified" },
        { title: "From CV only", value: "cv-only" },
        { title: "Needs review", value: "needs-review" },
        { title: "Conflict between sources", value: "conflict" },
      ],
      layout: "radio",
    },
    initialValue: "cv-only",
  }),
  defineField({ name: "verificationNotes", title: "Verification notes", type: "array", of: [defineArrayMember({ type: "string" })], group: "admin", description: "Internal notes from the content audit. Not shown on the website." }),
];

export const linkItem = defineType({
  name: "linkItem",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required().uri({ scheme: ["https", "http", "mailto"] }) }),
    defineField({ name: "kind", title: "Kind", type: "string", options: { list: ["institutional", "orcid", "scholar", "other"] } }),
  ],
});
