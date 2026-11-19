import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EvidenceChain } from "@/components/evidence-chain";
import { PageHeader } from "@/components/ui";
import { getProfile, getProjects, getPublications, getThemes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Five connected research themes: Earth observation and environmental change; agriculture and food security; climate risk and human well-being; Earth science applications and decision support; and resilient food systems.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const [themes, profile, projects, pubs] = await Promise.all([getThemes(), getProfile(), getProjects(), getPublications()]);
  return (
    <>
      <PageHeader
        kicker="Research"
        title="From satellite observation to human outcome"
        lede="Brown's research is a single, interdisciplinary program: measuring environmental conditions from space, tracing their consequences for harvests, markets and health, and making that evidence usable by the people who must act on it."
      />

      <section className="border-b border-stone py-20 lg:py-28" aria-labelledby="chain">
        <div className="container-site">
          <h2 id="chain" className="kicker mb-12">The chain of evidence</h2>
          <EvidenceChain steps={profile.chain} tone="paper" />
          <div className="prose-editorial mt-16 max-w-3xl">
            {profile.approach.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" aria-label="Research themes">
        <div className="container-site space-y-24 lg:space-y-32">
          {themes.map((t, i) => {
            const nProjects = projects.filter((p) => p.themes.includes(t.id)).length;
            const nPubs = pubs.filter((p) => p.themes.includes(t.id)).length;
            return (
              <article key={t.id} className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`lg:col-span-6 ${i % 2 ? "lg:order-2" : ""}`}>
                  {t.image ? (
                    <figure>
                      <div className="relative aspect-[4/3] overflow-hidden bg-pine">
                        <Image src={t.image.file} alt={t.image.title} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover transition-transform duration-[1.2s] hover:scale-[1.02]" />
                      </div>
                      <figcaption className="mt-3 text-xs text-muted">Image: {t.image.credit}</figcaption>
                    </figure>
                  ) : (
                    <div aria-hidden className="on-pine flex aspect-[4/3] items-end bg-pine p-8">
                      <span className="font-serif text-[7rem] leading-none text-gold/60">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center lg:col-span-6">
                  <p className="kicker">{String(i + 1).padStart(2, "0")} · {t.kicker}</p>
                  <h2 className="mt-3 text-headline text-pine">
                    <Link href={`/research/${t.id}`} className="link-underline">{t.title}</Link>
                  </h2>
                  <p className="mt-5 font-serif text-lede text-muted">{t.summary}</p>
                  <p className="mt-6 text-sm text-muted">
                    {nProjects} {nProjects === 1 ? "project" : "projects"} · {nPubs} publications
                  </p>
                  <Link href={`/research/${t.id}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-pine">
                    <span className="link-underline">Read about this theme</span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
