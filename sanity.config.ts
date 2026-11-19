/**
 * Sanity Studio — the editing dashboard. Hosted by Sanity (free) because the website itself
 * is static on GitHub Pages:
 *   npx sanity deploy        → https://<studio-host>.sanity.studio
 * Publishing a document fires a webhook that rebuilds the site (see README → "Content updates").
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { SINGLETONS, schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletons = new Set<string>(SINGLETONS);

export default defineConfig({
  name: "default",
  title: "Molly E. Brown — Website",
  projectId: projectId || process.env.SANITY_STUDIO_PROJECT_ID || "unset",
  dataset: process.env.SANITY_STUDIO_DATASET || dataset,
  schema: {
    types: schemaTypes,
    // Singletons cannot be created again from the "+" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    // Singletons cannot be duplicated or deleted.
    actions: (prev, { schemaType }) =>
      singletons.has(schemaType) ? prev.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action)) : prev,
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
