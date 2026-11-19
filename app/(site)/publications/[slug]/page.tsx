import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Authors, PublicationMeta } from "@/components/publication";
import { JsonLd } from "@/components/ui";
import { getProjectsForPublication, getPublications, getThemeMap } from "@/lib/content";
import { citationText, doiUrl, sourceLine, toBibtex, yearRange } from "@/lib/format";
import { scholarlyArticleJsonLd } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublications()).map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPublications()).find((x) => x.id === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: `${p.authors.slice(0, 6).join(", ")}${p.authors.length > 6 ? " et al." : ""} (${p.year}). ${sourceLine(p)}`.slice(0, 300),
    alternates: { canonical: `/publications/${p.id}` },
    other: {
      citation_title: p.title,
      citation_publication_date: String(p.year),
      ...(p.container ? { citation_journal_title: p.container } : {}),
      ...(p.doi ? { citation_doi: p.doi } : {}),
    },
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const pubs = await getPublications();
  const p = pubs.find((x) => x.id === slug);
  if (!p) notFound();
  const [projects, themes] = await Promise.all([getProjectsForPublication(p.doi), getThemeMap()]);

  return (
    <article>
      <JsonLd data={scholarlyArticleJsonLd(p)} />
      <header className="border-b border-stone pb-14 pt-32 lg:pb-20 lg:pt-44">
        <div className="container-site max-w-5xl">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <Link href="/publications" className="link-underline">Publications</Link> <span aria-hidden>/</span> {p.year}
          </nav>
          <p className="mt-8"><PublicationMeta pub={p} /></p>
          <h1 className="mt-4 text-headline text-pine">{p.title}</h1>
          <p className="mt-6 text-base leading-relaxed text-muted"><Authors authors={p.authors} max={60} /></p>
          <p className="mt-3 font-serif text-xl text-ink">{sourceLine(p)}{sourceLine(p) ? ", " : ""}{p.year}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            {p.doi && (
              <a href={doiUrl(p.doi)} rel="noopener" className="inline-flex items-center gap-2 bg-pine px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-forest">
                Read at publisher <span aria-hidden>↗</span>
              </a>
            )}
            {!p.doi && p.url && (
              <a href={p.url} rel="noopener" className="inline-flex items-center gap-2 bg-pine px-5 py-3 text-sm font-medium text-paper hover:bg-forest">
                View source <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container-site grid max-w-5xl gap-14 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {p.abstract && (
            <section className="mb-12">
              <h2 className="kicker mb-4">Abstract</h2>
              <p className="prose-editorial">{p.abstract}</p>
            </section>
          )}
          <section>
            <h2 className="kicker mb-4">Citation</h2>
            <p className="border-l-2 border-gold pl-5 font-serif text-lg leading-relaxed">{citationText(p)}</p>
          </section>
          <section className="mt-10">
            <h2 className="kicker mb-4">BibTeX</h2>
            <pre className="overflow-x-auto bg-paper-2 p-5 text-xs leading-relaxed text-ink"><code>{toBibtex(p)}</code></pre>
          </section>
        </div>
        <aside className="space-y-10">
          {p.themes.length > 0 && (
            <div>
              <h2 className="kicker mb-4">Research themes</h2>
              <ul className="space-y-2">
                {p.themes.map((t) => themes[t] && (
                  <li key={t}><Link href={`/research/${t}`} className="link-underline font-serif text-lg text-pine">{themes[t].title}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {projects.length > 0 && (
            <div>
              <h2 className="kicker mb-4">Related projects</h2>
              <ul className="space-y-3">
                {projects.map((pr) => (
                  <li key={pr.id}>
                    <Link href={`/projects/${pr.id}`} className="link-underline font-serif text-lg leading-snug text-pine">{pr.title}</Link>
                    <span className="block text-xs text-muted">{yearRange(pr.periodStart, pr.periodEnd)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.doi && (
            <div>
              <h2 className="kicker mb-4">Identifier</h2>
              <p className="break-all text-sm"><a href={doiUrl(p.doi)} rel="noopener" className="link-underline text-gold-ink">doi:{p.doi}</a></p>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
