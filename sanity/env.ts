export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";

/** True when a Sanity project is configured; otherwise the site renders from content/data/. */
export const sanityEnabled = Boolean(projectId);
