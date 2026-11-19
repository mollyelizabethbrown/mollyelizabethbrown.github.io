import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProjectExplorer } from "@/components/project-explorer";
import { PageHeader, SectionHeading } from "@/components/ui";
import { getFlagships, getProjects, getThemeMap, getThemes } from "@/lib/content";
import { yearRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projects",
  description: "Current and past research programs led or co-led by Molly E. Brown: NASA mission applications, famine early warning, climate and child nutrition, glaciers and water, index insurance and carbon monitoring.",
  alternates: { canonical: "/projects/" },
};

export default async function ProjectsPage() {
  const [projects, flagships, themes, themeMap] = await Promise.all([getProjects(), getFlagships(), getThemes(), getThemeMap()]);
  const active = projects.filter((p) => p.status === "active");
  const firstYear = Math.min(...projects.map((p) => p.periodStart));

  return (
    <>
      <PageHeader
        kicker="Projects"
        title="Research programs"
        lede={`Funded research from ${firstYear} to the present — with NASA, the National Science Foundation, USAID, USDA, the UK Department for International Development and others. Current work is listed first; the complete record follows.`}
      />

      {/* Current */}
      <section className="py-20 lg:py-24" aria-labelledby="current">
        <div className="container-site">
          <SectionHeading kicker="Current" id="current" title="Active programs" />
          <div className="grid gap-10 md:grid-cols-2">
            {active.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}/`} className="group grid gap-6 border-t border-pine pt-6 sm:grid-cols-[12rem_1fr]">
                {p.image && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-pine">
                    <Image src={p.image.file} alt={p.image.title} fill sizes="12rem" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-forest">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-forest" />Active · {yearRange(p.periodStart, p.periodEnd)}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-snug text-pine"><span className="link-underline">{p.title}</span></h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.role}</p>
                  <p className="mt-1 text-xs text-muted">{p.funder}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship programs */}
      <section className="border-t border-stone bg-paper-2 py-20 lg:py-24" aria-labelledby="flagships">
        <div className="container-site">
          <SectionHeading kicker="Flagship programs" id="flagships" title="Programs that defined the research" />
          <ul className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {flagships.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}/`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-pine">
                    {p.image ? (
                      <Image src={p.image.file} alt={p.image.title} fill sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div aria-hidden className="on-pine flex h-full items-end p-6"><span className="font-serif text-2xl leading-tight text-gold/80">{p.title.split(":")[0]}</span></div>
                    )}
                  </div>
                  <p className="mt-5 text-xs tracking-wide text-muted">
                    {yearRange(p.periodStart, p.periodEnd)} · {p.status === "active" ? "Active" : "Completed"} · {themeMap[p.themes[0]]?.short}
                  </p>
                  <h3 className="mt-2 font-serif text-[1.45rem] leading-snug text-pine"><span className="link-underline">{p.title}</span></h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.abstract}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Archive */}
      <section className="py-20 lg:py-24" aria-labelledby="archive" id="archive">
        <div className="container-site">
          <SectionHeading kicker="Archive" id="archive-title" title={`All ${projects.length} projects`} />
          <ProjectExplorer projects={projects} themes={themes.map((t) => ({ id: t.id, short: t.short }))} />
        </div>
      </section>
    </>
  );
}
