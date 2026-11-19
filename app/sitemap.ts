import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { getNews, getProjects, getPublications, getThemes } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [themes, projects, pubs, news] = await Promise.all([getThemes(), getProjects(), getPublications(), getNews()]);
  const now = new Date();
  const fixed = ["/", "/about/", "/research/", "/projects/", "/publications/", "/books/", "/people/", ...(news.length ? ["/news/"] : []), "/contact/"].map((p) => ({
    url: absoluteUrl(p), lastModified: now, changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...themes.map((t) => ({ url: absoluteUrl(`/research/${t.id}/`), lastModified: now, priority: 0.7 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.id}/`), lastModified: now, priority: 0.6 })),
    ...pubs.map((p) => ({ url: absoluteUrl(`/publications/${p.id}/`), lastModified: now, priority: 0.5 })),
    ...news.map((n) => ({ url: absoluteUrl(`/news/${n.id}/`), lastModified: new Date(n.date), priority: 0.6 })),
  ];
}
