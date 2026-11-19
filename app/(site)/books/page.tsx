import type { Metadata } from "next";
import Image from "next/image";
import { BookSpine } from "@/components/book-spine";
import { EmptyState, JsonLd, PageHeader } from "@/components/ui";
import { getBooks, getThemeMap } from "@/lib/content";
import { bookJsonLd } from "@/lib/jsonld";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Books",
  description: "Famine Early Warning Systems and Remote Sensing Data (Springer, 2008) and Food Security, Food Prices and Climate Variability (Routledge, 2014) by Molly E. Brown.",
  alternates: { canonical: "/books" },
};

export default async function BooksPage() {
  const [books, themes] = await Promise.all([getBooks(), getThemeMap()]);
  return (
    <>
      <PageHeader kicker="Books" title="Authored books" lede="Two monographs that synthesise how satellite observations inform famine early warning, and how climate variability reaches people through food production and prices." />
      <JsonLd data={books.map(bookJsonLd)} />
      <section className="py-16 lg:py-24">
        <div className="container-site space-y-24 lg:space-y-32">
          {books.length === 0 && <EmptyState title="No books listed yet" />}
          {books.map((b) => {
            const isbns = b.isbn ? Object.entries(b.isbn).filter(([, v]) => v) : [];
            return (
              <article key={b.id} id={b.id} className="grid scroll-mt-28 gap-10 md:grid-cols-12 lg:gap-16">
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden bg-pine shadow-[0_30px_60px_-30px_rgba(23,45,40,0.7)] md:w-full">
                    {b.cover ? (
                      <Image src={b.cover.file} alt={`Cover of ${b.title}`} fill sizes="(min-width:768px) 25vw, 192px" className="object-cover" />
                    ) : (
                      <BookSpine title={b.title} year={b.year} />
                    )}
                  </div>
                </div>
                <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
                  <p className="kicker">{b.year} · {b.publisher}</p>
                  <h2 className="mt-3 text-headline text-pine">{b.title}</h2>
                  {b.series && <p className="mt-2 text-sm italic text-muted">{b.series} series</p>}
                  <p className="prose-editorial mt-6 max-w-2xl">{b.summary}</p>
                  {b.themes.length > 0 && (
                    <p className="mt-6 text-sm text-muted">
                      Related research:{" "}
                      {b.themes.map((t, i) => themes[t] && (
                        <span key={t}>{i > 0 && " · "}<Link href={`/research/${t}`} className="link-underline text-gold-ink">{themes[t].short}</Link></span>
                      ))}
                    </p>
                  )}
                  {(() => {
                    const cells: [string, React.ReactNode][] = [
                      ["Author", "Molly E. Brown"],
                      ["Publisher", `${b.publisher}, ${b.year}`],
                      ...(b.pages ? [["Extent", `${b.pages} pages`] as [string, React.ReactNode]] : []),
                      ...(b.doi ? [["DOI", <a key="doi" className="link-underline break-all text-gold-ink" href={`https://doi.org/${b.doi}`} rel="noopener">{b.doi}</a>] as [string, React.ReactNode]] : []),
                      ...isbns.map(([k, v]) => [`ISBN (${k})`, <span key={k} className="tabular-nums">{v}</span>] as [string, React.ReactNode]),
                    ];
                    return (
                      <dl className="mt-8 grid max-w-2xl gap-px overflow-hidden border border-stone bg-stone text-sm sm:grid-cols-2">
                        {cells.map(([k, v], i) => (
                          <div key={k} className={`bg-paper p-4 ${i === cells.length - 1 && cells.length % 2 ? "sm:col-span-2" : ""}`}>
                            <dt className="text-xs text-muted">{k}</dt><dd className="mt-1">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    );
                  })()}
                  {b.publisherUrl && (
                    <a href={b.publisherUrl} rel="noopener" className="mt-8 inline-flex items-center gap-2 bg-pine px-5 py-3 text-sm font-medium text-paper hover:bg-forest">
                      Publisher page <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
