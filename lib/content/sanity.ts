import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import type {
  Book, Media, NewsPost, Person, Profile, Project, Publication, Settings, Theme,
} from "@/lib/types";

// Static site: content is read once, at build time, from the public (published) dataset.
// Publishing in the Studio triggers a rebuild via the GitHub Actions workflow.
const client = createClient({ projectId: projectId || "unset", dataset, apiVersion, useCdn: false, perspective: "published" });

async function fetchSanity<T>(query: string, params: QueryParams = {}): Promise<T> {
  return client.fetch<T>(query, params);
}

// --- shared projections -------------------------------------------------------

const figure = (field: string) => `${field}{
  "id": coalesce(asset->_id, ""),
  "file": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "title": coalesce(title, alt, ""),
  "caption": coalesce(caption, ""),
  "credit": coalesce(credit, ""),
  "sourcePage": coalesce(sourceUrl, ""),
  "license": coalesce(license, ""),
  "licenseUrl": licenseUrl
}`;

const publicationFields = `
  "id": slug.current, type, status, year, title, authors, container, volume, issue, pages,
  publisher, editors, isbn, doi, url, abstract, featured,
  "cvSection": coalesce(cvSection, ""),
  "themes": themes[]->themeId.current,
  "verification": { "status": coalesce(verificationStatus, "cv-only"), "issues": coalesce(verificationNotes, []) }
`;

const projectFields = `
  "id": slug.current, title, abstract, "goals": coalesce(goals, []), periodStart, periodEnd, status,
  funder, program, role, leadPI, "collaborators": coalesce(collaborators, []),
  "geography": coalesce(geography, []), "methods": coalesce(methods, []),
  "themes": themes[]->themeId.current,
  "publicationDois": coalesce(publications[]->doi, []),
  "related": related[]->slug.current, featured
`;

// --- queries ------------------------------------------------------------------

export const sanityPublications = () =>
  fetchSanity<Publication[]>(`*[_type == "publication" && hidden != true] | order(year desc, title asc){${publicationFields}}`);

export const sanityThemes = () =>
  fetchSanity<Theme[]>(`*[_type == "researchTheme"] | order(order asc){
    "id": themeId.current, order, title, short, kicker, summary,
    "introduction": coalesce(introduction, []), "questions": coalesce(questions, []), "methods": coalesce(methods, []),
    "findings": coalesce(findings[]{ "doi": publication->doi, text }, []),
    "image": ${figure("image")}
  }`);

export const sanityProjects = () =>
  fetchSanity<Project[]>(`*[_type == "project" && hidden != true] | order(periodStart desc){${projectFields}}`);

export const sanityBooks = () =>
  fetchSanity<Book[]>(`*[_type == "book"] | order(year desc){
    "id": slug.current, title, year, publisher, isbn, doi, pages, series, publisherUrl, summary,
    "cover": cover{ "file": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
    "themes": themes[]->themeId.current
  }`);

export const sanityPeople = () =>
  fetchSanity<Person[]>(`*[_type == "person" && published == true] | order(orderRank asc, name asc){
    "id": slug.current, name, role, category, affiliation, period, bio, url,
    "photo": photo{ "src": asset->url, "alt": coalesce(alt, "") }
  }`);

export const sanityNews = () =>
  fetchSanity<NewsPost[]>(`*[_type == "news"] | order(date desc){
    "id": slug.current, title, date, category, excerpt, body,
    "image": ${figure("image")},
    "relatedPublicationDois": coalesce(relatedPublications[]->doi, []),
    "relatedProjectIds": coalesce(relatedProjects[]->slug.current, [])
  }`);

export async function sanityProfile(): Promise<Profile> {
  const [p, awards] = await Promise.all([
    fetchSanity<Profile & { portraitImage?: { src: string; alt: string; width: number; height: number } }>(`*[_type == "profile"][0]{
      name, postNominal, designation, institution, department, tagline, statement, summary,
      "biography": coalesce(biography, []), "approach": coalesce(approach, []), "chain": coalesce(chain, []), "contributions": coalesce(contributions, []),
      "education": coalesce(education, []), "appointments": coalesce(appointments[]{..., "id": _key}, []),
      "teaching": coalesce(teaching, []), "leadership": coalesce(leadership[]{..., "id": _key}, []),
      "reviewing": coalesce(reviewing, []), "memberships": coalesce(memberships, []),
      "contactAddress": coalesce(contactAddress, []),
      "portrait": portrait{ "src": asset->url, "alt": coalesce(alt, ""), "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
    }`),
    fetchSanity<Profile["awards"]>(`*[_type == "award"] | order(year desc){ "id": _id, year, title, detail, featured }`),
  ]);
  return { ...p, awards };
}

export async function sanitySettings(): Promise<Settings> {
  const s = await fetchSanity<Settings & { hero: Media | null }>(`*[_type == "siteSettings"][0]{
    siteTitle, siteDescription,
    "hero": ${figure("heroImage")},
    "featuredProjectIds": coalesce(featuredProjects[]->slug.current, []),
    "featuredPublicationDois": coalesce(featuredPublications[]->doi, []),
    earthToDecisionsTitle, earthToDecisionsText,
    "links": coalesce(links[]{ label, url, kind }, []),
    contactEmail,
    "cvFileUrl": cvFile.asset->url
  }`);
  return s;
}
