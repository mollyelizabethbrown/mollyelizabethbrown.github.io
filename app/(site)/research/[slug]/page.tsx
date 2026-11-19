import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { PublicationCitation } from "@/components/publication";
import { ArrowLink, SectionHeading } from "@/components/ui";
import {
  getProjectsForTheme, getPublicationByDoi, getPublicationsForTheme, getTheme, getThemeMap, getThemes,
} from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getThemes()).map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const theme = await getTheme((await params).slug);
  if (!theme) return {};
  return {
    title: theme.title,
    description: theme.summary,
    alternates: { canonical: `/research/${theme.id}` },
    openGraph: theme.image ? { images: [{ url: theme.image.file, alt: theme.image.title }] } : undefined,
  };
}

export default async function ThemePage({ params }: Props) {
  const { slug } = await params;
  const theme = await getTheme(slug);
  if (!theme) notFound();
  const [themes, themeMap, projects, pubs] = await Promise.all([
    getThemes(), getThemeMap(), getProjectsForTheme(theme.id), getPublicationsForTheme(theme.id),
  ]);
  const findings = (
    await Promise.all(theme.findings.map(async (f) => ({ ...f, pub: await getPublicationByDoi(f.doi) })))
  );
  const idx = themes.findIndex((t) => t.id === theme.id);
  const next = themes[(idx + 1) % themes.length];
  const recent = pubs.slice(0, 10);

  return (
    <>
      <header className="on-pine relative isolate overflow-hidden bg-pine pb-16 pt-36 text-paper lg:pb-24 lg:pt-48">
        {theme.image && (
          <Image src={theme.image.file} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-45" />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-pine via-pine/80 to-pine/30" />
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="text-xs text-mist">
            <Link href="/research" className="link-underline">Research</Link> <span aria-hidden>/</span> Theme {String(idx + 1).padStart(2, "0")}
          </nav>
          <p className="kicker mt-8">{theme.kicker}</p>
          <h1 className="mt-4 max-w-5xl text-display">{theme.title}</h1>
          <p className="mt-8 max-w-3xl font-serif text-lede text-mist">{theme.summary}</p>
          {theme.image && <p className="mt-10 text-[0.68rem] text-mist/80">Image: {theme.image.credit}</p>}
        </div>
      </header>

      <section className="py-20 lg:py-28">
        <div className="container-site grid gap-16 lg:grid-cols-12">
          <div className="prose-editorial lg:col-span-7" data-reveal>
            {theme.introduction.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          </div>
          <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
            <div data-reveal>
              <h2 className="kicker mb-5">Research questions</h2>
              <ol className="space-y-4">
                {theme.questions.map((q, i) => (
                  <li key={q} className="grid grid-cols-[1.75rem_1fr] gap-2 font-serif text-lg leading-snug text-pine">
                    <span className="text-gold-ink">{i + 1}.</span>{q}
                  </li>
                ))}
              </ol>
            </div>
            <div data-reveal>
              <h2 className="kicker mb-5">Approaches and methods</h2>
              <ul className="flex flex-wrap gap-2">
                {theme.methods.map((m) => <li key={m} className="chip whitespace-normal">{m}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {findings.length > 0 && (
        <section className="border-y border-stone bg-paper-2 py-20 lg:py-28" aria-labelledby="findings">
          <div className="container-site">
            <SectionHeading kicker="Evidence" id="findings" title="Representative published work" />
            <ul className="grid gap-px overflow-hidden border border-stone bg-stone md:grid-cols-2 lg:grid-cols-3">
              {findings.map((f) => (
                <li key={f.doi} className="flex flex-col bg-paper p-7" data-reveal>
                  <p className="font-serif text-lg leading-snug text-pine">{f.text}</p>
                  {f.pub ? (
                    <p className="mt-auto pt-6 text-xs leading-relaxed text-muted">
                      <Link href={`/publications/${f.pub.id}`} className="link-underline text-gold-ink">
                        {f.pub.authors[0]?.split(",")[0]}{f.pub.authors.length > 1 ? " et al." : ""} ({f.pub.year}), {f.pub.container}
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-auto pt-6 text-xs text-muted">
                      <a href={`https://doi.org/${f.doi}`} className="link-underline" rel="noopener">doi:{f.doi}</a>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="py-20 lg:py-28" aria-labelledby="theme-projects">
          <div className="container-site">
            <SectionHeading kicker="Projects" id="theme-projects" title="Associated projects" href={`/projects?theme=${theme.id}`} linkLabel="Browse projects" />
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((p) => <ProjectCard key={p.id} project={p} themes={themeMap} />)}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-stone py-20 lg:py-28" aria-labelledby="theme-pubs">
        <div className="container-site">
          <SectionHeading kicker="Publications" id="theme-pubs" title="Related publications" href={`/publications?theme=${theme.id}`} linkLabel={`All ${pubs.length} in this theme`} />
          <div className="divide-y divide-stone border-y border-stone">
            {recent.map((p) => <PublicationCitation key={p.id} pub={p} />)}
          </div>
        </div>
      </section>

      <nav aria-label="Next theme" className="on-pine bg-pine py-16 text-paper">
        <div className="container-site flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="kicker">Next theme</p>
            <p className="mt-3 font-serif text-title">{next.title}</p>
          </div>
          <ArrowLink href={`/research/${next.id}`}>Continue</ArrowLink>
        </div>
      </nav>
    </>
  );
}
