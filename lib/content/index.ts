import "server-only";
import { cache } from "react";
import { sanityEnabled } from "@/sanity/env";
import * as local from "./local";
import * as cms from "./sanity";
import type { Project, Publication, Theme, ThemeId } from "@/lib/types";

/**
 * Single entry point for page data. Reads Sanity when NEXT_PUBLIC_SANITY_PROJECT_ID is set,
 * otherwise the local content database in content/data/. Pages never import a source directly.
 */

export const normDoi = local.normDoi;

export const getProfile = cache(async () => (sanityEnabled ? cms.sanityProfile() : local.localProfile()));
export const getSettings = cache(async () => (sanityEnabled ? cms.sanitySettings() : local.localSettings()));
export const getThemes = cache(async () => (sanityEnabled ? cms.sanityThemes() : local.localThemes()));
export const getBooks = cache(async () => (sanityEnabled ? cms.sanityBooks() : local.localBooks()));
export const getPeople = cache(async () => (sanityEnabled ? cms.sanityPeople() : local.localPeople()));
export const getNews = cache(async () => {
  const rows = sanityEnabled ? await cms.sanityNews() : local.localNews();
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
});

const pubOrder = (a: Publication, b: Publication) =>
  b.year - a.year || a.title.localeCompare(b.title);

export const getPublications = cache(async () => {
  const rows = sanityEnabled ? await cms.sanityPublications() : local.localPublications();
  return [...rows].sort(pubOrder);
});

export const getProjects = cache(async () => {
  const rows = sanityEnabled ? await cms.sanityProjects() : local.localProjects();
  return [...rows].sort(
    (a, b) =>
      Number(b.status === "active") - Number(a.status === "active") ||
      (b.periodEnd ?? 9999) - (a.periodEnd ?? 9999) ||
      b.periodStart - a.periodStart,
  );
});

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
