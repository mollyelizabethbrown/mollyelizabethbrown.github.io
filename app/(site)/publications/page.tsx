import type { Metadata } from "next";
import { PublicationExplorer } from "@/components/publication-explorer";
import { PageHeader } from "@/components/ui";
import { getPublications, getThemes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description: "Searchable bibliography of Molly E. Brown's peer-reviewed articles, books, chapters, conference papers and reports, with DOIs and BibTeX export.",
  alternates: { canonical: "/publications" },
};

export default async function PublicationsPage() {
  const [pubs, themes] = await Promise.all([getPublications(), getThemes()]);
  const articles = pubs.filter((p) => p.type === "journal-article" || p.type === "letter-commentary").length;
  const first = Math.min(...pubs.map((p) => p.year));
  return (
    <>
      <PageHeader
        kicker="Publications"
        title="Bibliography"
        lede={`${articles} peer-reviewed articles and ${pubs.length - articles} books, chapters, proceedings and reports since ${first}. Search by title, author or journal; filter by year, theme and type; export any selection as BibTeX.`}
      />
      <section className="py-14 lg:py-20">
        <div className="container-site">
          <PublicationExplorer pubs={pubs} themes={themes.map((t) => ({ id: t.id, short: t.short }))} />
        </div>
      </section>
    </>
  );
}
