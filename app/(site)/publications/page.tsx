import type { Metadata } from "next";
import { PublicationCitation } from "@/components/publication";
import { PublicationExplorer } from "@/components/publication-explorer";
import { PageHeader, SectionHeading } from "@/components/ui";
import { getPublications, getPublicationsByDois, getSettings, getThemes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description: "Selected publications and the complete, searchable bibliography of Molly E. Brown — peer-reviewed articles, books, chapters, conference papers and reports, with DOIs and BibTeX export.",
  alternates: { canonical: "/publications/" },
};

export default async function PublicationsPage() {
  const [pubs, themes, settings] = await Promise.all([getPublications(), getThemes(), getSettings()]);
  const selected = await getPublicationsByDois(settings.featuredPublicationDois);
  const articles = pubs.filter((p) => p.type === "journal-article" || p.type === "letter-commentary").length;
  const first = Math.min(...pubs.map((p) => p.year));
  const byTheme = themes
    .map((t) => ({ theme: t, items: selected.filter((p) => p.themes[0] === t.id).sort((a, b) => b.year - a.year) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        kicker="Publications"
        title="Publications"
        lede={`${articles} peer-reviewed articles and ${pubs.length - articles} books, chapters, proceedings and reports since ${first}. A selection by research theme comes first; the complete bibliography below can be searched, filtered and exported as BibTeX.`}
      >
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <a href="#selected" className="link-underline text-pine">Selected publications</a>
          <a href="#bibliography" className="link-underline text-pine">Full bibliography</a>
        </nav>
      </PageHeader>

      <section id="selected" className="scroll-mt-24 border-b border-stone bg-paper-2 py-20 lg:py-24" aria-labelledby="selected-title">
        <div className="container-site">
          <SectionHeading kicker="Selected" id="selected-title" title="Selected publications by theme" />
          <div className="space-y-16">
            {byTheme.map(({ theme, items }) => (
              <div key={theme.id} className="grid gap-6 lg:grid-cols-12">
                <h3 className="font-serif text-2xl leading-snug text-pine lg:col-span-3">
                  <a href={`/research/${theme.id}/`} className="link-underline">{theme.title}</a>
                </h3>
                <div className="divide-y divide-stone border-y border-stone lg:col-span-9">
                  {items.map((p) => <PublicationCitation key={p.id} pub={p} headingLevel="h4" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bibliography" className="scroll-mt-24 py-20 lg:py-24" aria-labelledby="bib-title">
        <div className="container-site">
          <SectionHeading kicker="Complete record" id="bib-title" title="Full bibliography" />
          <PublicationExplorer pubs={pubs} themes={themes.map((t) => ({ id: t.id, short: t.short }))} />
        </div>
      </section>
    </>
  );
}
