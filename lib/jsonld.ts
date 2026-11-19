import { absoluteUrl } from "@/lib/site";
import type { Book, Profile, Publication } from "@/lib/types";

export function personJsonLd(profile: Profile, sameAs: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: profile.name,
    honorificSuffix: profile.postNominal,
    jobTitle: profile.designation,
    url: absoluteUrl("/"),
    image: profile.portrait ? absoluteUrl(profile.portrait.src) : undefined,
    affiliation: { "@type": "CollegeOrUniversity", name: profile.institution, department: profile.department },
    alumniOf: profile.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: ["Remote sensing", "Earth observation", "Food security", "Climate change", "Famine early warning", "Agriculture"],
    award: profile.awards.map((a) => `${a.title} (${a.year})`),
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

const personRef = { "@id": absoluteUrl("/#person") };

function authorNodes(authors: string[]) {
  return authors.map((a) =>
    /^brown,\s*m\.?\s*e\.?/i.test(a) ? personRef : { "@type": "Person", name: a },
  );
}

export function scholarlyArticleJsonLd(p: Publication) {
  return {
    "@context": "https://schema.org",
    "@type": p.type === "book-chapter" ? "Chapter" : p.type === "report" ? "Report" : "ScholarlyArticle",
    headline: p.title.slice(0, 110),
    name: p.title,
    author: authorNodes(p.authors),
    datePublished: String(p.year),
    isPartOf: p.container ? { "@type": "Periodical", name: p.container } : undefined,
    volumeNumber: p.volume ?? undefined,
    issueNumber: p.issue ?? undefined,
    pagination: p.pages ?? undefined,
    sameAs: p.doi ? `https://doi.org/${p.doi}` : p.url ?? undefined,
    identifier: p.doi ? { "@type": "PropertyValue", propertyID: "DOI", value: p.doi } : undefined,
    url: absoluteUrl(`/publications/${p.id}`),
    creativeWorkStatus: p.status === "published" ? "Published" : p.status,
  };
}

export function bookJsonLd(b: Book) {
  const isbn = b.isbn ? b.isbn.hardcover ?? b.isbn.softcover ?? b.isbn.ebook ?? undefined : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: b.title,
    author: personRef,
    datePublished: String(b.year),
    publisher: { "@type": "Organization", name: b.publisher },
    isbn,
    numberOfPages: b.pages ? Number.parseInt(b.pages, 10) || undefined : undefined,
    image: b.cover ? absoluteUrl(b.cover.file) : undefined,
    sameAs: b.doi ? `https://doi.org/${b.doi}` : b.publisherUrl ?? undefined,
    description: b.summary,
  };
}
