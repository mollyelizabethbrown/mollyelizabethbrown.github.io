import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  Book, Media, NewsPost, Person, Profile, Project, Publication, Settings, Theme, ThemeId,
} from "@/lib/types";

/**
 * Local content source: the versioned scientific content database in content/data/.
 * Used whenever no Sanity project is configured, and as the seed for the CMS.
 * Records with `publish: false` are never returned.
 */

const DATA_DIR = path.join(process.cwd(), "content", "data");

function readJson<T>(file: string, fallback: T): T {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

type WithPublish = { publish?: boolean };
const published = <T extends WithPublish>(rows: T[]) => rows.filter((r) => r.publish !== false);

export const normDoi = (doi: string | null | undefined) =>
  doi ? doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").toLowerCase() : null;

let mediaCache: Media[] | null = null;
function media(): Media[] {
  if (!mediaCache) mediaCache = readJson<Media[]>("media.json", []);
  return mediaCache;
}
export function localMediaById(id: string | null | undefined): Media | null {
  if (!id) return null;
  return media().find((m) => m.id === id) ?? null;
}

export function localPublications(): Publication[] {
  const rows = [
    ...readJson<(Publication & WithPublish)[]>("publications.refereed.json", []),
    ...readJson<(Publication & WithPublish)[]>("publications.other.json", []),
  ];
  const settings = readJson<{ home: { featuredPublicationDois: string[] } }>("settings.json", {
    home: { featuredPublicationDois: [] },
  });
  const featured = new Set(settings.home.featuredPublicationDois.map((d) => normDoi(d)));
  return published(rows).map((p) => ({
    ...p,
    doi: p.verification?.status === "doi-unresolved" ? null : p.doi,
    featured: p.featured || (p.doi ? featured.has(normDoi(p.doi)) : false),
  }));
}

export function localThemes(): Theme[] {
  const rows = readJson<(Omit<Theme, "image"> & { imageId: string | null })[]>("themes.json", []);
  return rows
    .map(({ imageId, ...t }) => ({ ...t, image: localMediaById(imageId) }))
    .sort((a, b) => a.order - b.order);
}

export function localProjects(): Project[] {
  return published(readJson<(Project & WithPublish)[]>("projects.json", []));
}

export function localBooks(): Book[] {
  return published(readJson<(Book & WithPublish)[]>("books.json", []));
}

export function localPeople(): Person[] {
  return published(readJson<(Person & WithPublish)[]>("people.json", []));
}

export function localNews(): NewsPost[] {
  return published(readJson<(NewsPost & WithPublish & { imageId?: string })[]>("news.json", [])).map(
    (n) => ({ ...n, image: n.image ?? localMediaById((n as { imageId?: string }).imageId) }),
  );
}

export function localProfile(): Profile {
  const p = readJson<Record<string, unknown>>("profile.json", {}) as unknown as Profile & {
    contact: { address: string[] };
    photo: { file: string | null; alt?: string; width?: number; height?: number };
  };
  return {
    ...p,
    contactAddress: p.contact?.address ?? [],
    portrait: p.photo?.file
      ? { src: p.photo.file, alt: p.photo.alt ?? `Portrait of ${p.name}`, width: p.photo.width ?? 800, height: p.photo.height ?? 1000 }
      : null,
  };
}

export function localSettings(): Settings {
  const s = readJson<{
    siteTitle: string; siteDescription: string; heroImageId: string | null;
    home: { featuredProjectIds: string[]; featuredPublicationDois: string[]; earthToDecisionsTitle: string; earthToDecisionsText: string };
    links: { label: string; url: string; kind?: string; verified?: boolean }[];
    contactEmail: string | null; cvFile: string | null;
  }>("settings.json", null as never);
  const fallbackHero = media()[0] ?? null;
  return {
    siteTitle: s.siteTitle,
    siteDescription: s.siteDescription,
    hero: localMediaById(s.heroImageId) ?? fallbackHero,
    featuredProjectIds: s.home.featuredProjectIds,
    featuredPublicationDois: s.home.featuredPublicationDois,
    earthToDecisionsTitle: s.home.earthToDecisionsTitle,
    earthToDecisionsText: s.home.earthToDecisionsText,
    links: s.links.filter((l) => l.verified !== false).map(({ label, url, kind }) => ({ label, url, kind })),
    contactEmail: s.contactEmail,
    cvFileUrl: s.cvFile,
  };
}

export const THEME_IDS: ThemeId[] = [
  "earth-observation", "food-security", "climate-risk", "applications", "sustainable-food-systems",
];
