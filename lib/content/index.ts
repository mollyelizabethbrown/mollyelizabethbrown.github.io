import "server-only";
import { cache } from "react";
import * as local from "./local";
import { isBrown } from "@/lib/format";
import type { Project, Publication, Theme, ThemeId } from "@/lib/types";

/** Single entry point for page data. Pages never read content files directly. */

export const normDoi = local.normDoi;

export const getProfile = cache(async () => local.localProfile());
export const getSettings = cache(async () => local.localSettings());
export const getThemes = cache(async () => local.localThemes());
export const getBooks = cache(async () => local.localBooks());
export const getPeople = cache(async () => local.localPeople());
export const getHighlights = cache(async () => local.localHighlights());
export const getMedia = cache(async () => local.allMedia());
export const getNews = cache(async () => [...local.localNews()].sort((a, b) => b.date.localeCompare(a.date)));

export const getPublications = cache(async () =>
  [...local.localPublications()].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
);

/** Active first; then flagship order; then most recent. */
export const getProjects = cache(async () =>
  [...local.localProjects()].sort(
    (a, b) =>
      Number(b.status === "active") - Number(a.status === "active") ||
      (b.periodEnd ?? 9999) - (a.periodEnd ?? 9999) ||
      b.periodStart - a.periodStart,
  ),
);

export async function getFlagships(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.flagship).sort((a, b) => (a.flagshipOrder ?? 99) - (b.flagshipOrder ?? 99));
}

// --- relationship helpers -------------------------------------------------------

export async function getPublicationsByDois(dois: string[]): Promise<Publication[]> {
  const all = await getPublications();
  const byDoi = new Map(all.filter((p) => p.doi).map((p) => [normDoi(p.doi)!, p]));
  return dois.map((d) => byDoi.get(normDoi(d)!)).filter((p): p is Publication => Boolean(p));
}

export async function getPublicationByDoi(doi: string) {
  return (await getPublicationsByDois([doi]))[0] ?? null;
}

export async function getProjectsForTheme(id: ThemeId): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.themes.includes(id));
}

export async function getPublicationsForTheme(id: ThemeId): Promise<Publication[]> {
  return (await getPublications()).filter((p) => p.themes.includes(id));
}

export async function getProjectsForPublication(doi: string | null): Promise<Project[]> {
  if (!doi) return [];
  const d = normDoi(doi);
  return (await getProjects()).filter((p) => p.publicationDois.some((x) => normDoi(x) === d));
}

export async function getTheme(id: string): Promise<Theme | null> {
  return (await getThemes()).find((t) => t.id === id) ?? null;
}

export async function getThemeMap(): Promise<Record<string, Theme>> {
  return Object.fromEntries((await getThemes()).map((t) => [t.id, t]));
}

/** Most recent verified, published work — "recent activity" is shown only when DOI-verified. */
export async function getRecentVerified(sinceYear: number): Promise<Publication[]> {
  return (await getPublications()).filter(
    (p) => p.year >= sinceYear && p.status === "published" && p.verification.status === "verified" && p.doi,
  );
}

/** Co-authors on verified publications since a given year (factual co-authorship, not group membership). */
export async function getRecentCoauthors(sinceYear: number) {
  const pubs = await getRecentVerified(sinceYear);
  const counts = new Map<string, number>();
  for (const p of pubs) for (const a of p.authors) if (!isBrown(a)) counts.set(a, (counts.get(a) ?? 0) + 1);
  return { pubCount: pubs.length, authors: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) };
}

/** Primary navigation; News appears only once it has published posts. */
export async function getNav() {
  const news = await getNews();
  const items = [
    { href: "/about/", label: "About" },
    { href: "/research/", label: "Research" },
    { href: "/projects/", label: "Projects" },
    { href: "/publications/", label: "Publications" },
    { href: "/books/", label: "Books" },
    { href: "/people/", label: "People" },
    ...(news.length ? [{ href: "/news/", label: "News" }] : []),
    { href: "/contact/", label: "Contact" },
  ];
  return items;
}
