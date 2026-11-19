import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicationCitation } from "@/components/publication";
import { getProjects, getPublicationsByDois, getThemeMap } from "@/lib/content";
import { yearRange } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects()).find((x) => x.id === slug);
  if (!p) return {};
  return { title: p.title, description: p.abstract.slice(0, 200), alternates: { canonical: `/projects/${p.id}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const all = await getProjects();
  const project = all.find((p) => p.id === slug);
  if (!project) notFound();
  const [pubs, themes] = await Promise.all([getPublicationsByDois(project.publicationDois), getThemeMap()]);
  const related = (project.related ?? []).map((id) => all.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  const facts: [string, React.ReactNode][] = [
    ["Period", yearRange(project.periodStart, project.periodEnd)],
    ["Status", project.status === "active" ? "Active" : "Completed"],
    ["Funding", project.funder],
    ["Program", project.program],
    ["Dr. Brown's role", project.role],
    ["Lead investigator", project.leadPI],
    ["Study geography", project.geography.length ? project.geography.join(", ") : null],
  ];

  return (
    <article>
      <header className="border-b border-stone pb-14 pt-32 lg:pb-20 lg:pt-44">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <Link href="/projects" className="link-underline">Projects</Link>
          </nav>
          <p className="kicker mt-8">{project.themes.map((t) => themes[t]?.short).filter(Boolean).join(" · ")}</p>
          <h1 className="mt-4 max-w-5xl text-headline text-pine">{project.title}</h1>
        </div>
      </header>

      <div className="container-site grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <h2 className="kicker mb-5">Abstract</h2>
          <p className="prose-editorial">{project.abstract}</p>

          {project.goals.length > 0 && (
            <section className="mt-14" aria-labelledby="goals">
              <h2 id="goals" className="kicker mb-5">Research goals</h2>
              <ul className="space-y-3">
                {project.goals.map((g) => (
                  <li key={g} className="grid grid-cols-[1.25rem_1fr] font-serif text-lg leading-snug text-pine">
                    <span aria-hidden className="text-gold-ink">—</span>{g}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.methods.length > 0 && (
            <section className="mt-14" aria-labelledby="methods">
              <h2 id="methods" className="kicker mb-5">Methods</h2>
              <ul className="flex flex-wrap gap-2">{project.methods.map((m) => <li key={m} className="chip whitespace-normal">{m}</li>)}</ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <dl className="divide-y divide-stone border-y border-stone">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-4 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
            {project.collaborators.length > 0 && (
              <div className="grid grid-cols-[8.5rem_1fr] gap-4 py-4 text-sm">
                <dt className="text-muted">Collaborating organizations</dt>
                <dd><ul className="space-y-1">{project.collaborators.map((c) => <li key={c}>{c}</li>)}</ul></dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {pubs.length > 0 && (
        <section className="border-t border-stone bg-paper-2 py-16 lg:py-24" aria-labelledby="outputs">
          <div className="container-site">
            <h2 id="outputs" className="kicker mb-6">Publications and outputs</h2>
            <div className="divide-y divide-stone border-y border-stone">
              {pubs.map((p) => <PublicationCitation key={p.id} pub={p} />)}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16" aria-labelledby="related">
          <div className="container-site">
            <h2 id="related" className="kicker mb-6">Related projects</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/projects/${r.id}`} className="link-underline font-serif text-xl text-pine">{r.title}</Link>
                  <span className="ml-3 text-sm text-muted">{yearRange(r.periodStart, r.periodEnd)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
