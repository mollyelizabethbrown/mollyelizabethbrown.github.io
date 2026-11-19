import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EvidenceRefs } from "@/components/evidence";
import { PageHeader } from "@/components/ui";
import { getProfile, getProjects, getPublicationsByDois, getSettings } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: "Biography, scientific contributions, NASA roles, scientific leadership and honors of Molly E. Brown, Research Professor at the University of Maryland.",
  alternates: { canonical: "/about/" },
};

const SECTIONS = [
  ["contributions", "Scientific contributions"],
  ["nasa", "NASA roles"],
  ["leadership", "Leadership and service"],
  ["honors", "Honors"],
  ["biography", "Extended biography"],
  ["career", "Career"],
  ["education", "Education"],
] as const;

export default async function AboutPage() {
  const [profile, settings, projects] = await Promise.all([getProfile(), getSettings(), getProjects()]);
  const contribPubs = await Promise.all(profile.contributions.map((c) => getPublicationsByDois(c.dois ?? [])));
  const nasa = profile.appointments.filter((a) => a.category === "nasa");
  const nasaService = profile.leadership.filter((l) => /NASA|ICESat|SMAP|Carbon Monitoring/i.test(l.body));
  const otherService = profile.leadership.filter((l) => !nasaService.includes(l));
  const nasaAward = profile.awards.filter((a) => /NASA/.test(a.title));
  const projectTitle = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  return (
    <>
      <PageHeader kicker="About" title={`${profile.name}, ${profile.postNominal}`} lede={`${profile.designation}, ${profile.department}, ${profile.institution}`} />

      {/* Concise biography */}
      <section className="border-b border-stone py-16 lg:py-20" aria-labelledby="short-bio">
        <div className="container-site grid gap-10 md:grid-cols-12 md:items-start">
          {profile.portrait && (
            <div className="md:col-span-3">
              <div className="relative aspect-square max-w-[16rem] overflow-hidden bg-paper-2">
                <Image src={profile.portrait.src} alt={profile.portrait.alt} fill sizes="256px" priority className="object-cover" />
              </div>
            </div>
          )}
          <div className="md:col-span-8 md:col-start-5">
            <h2 id="short-bio" className="kicker mb-5">Biography</h2>
            <p className="font-serif text-lede text-ink">{profile.bioShort}</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-pine">
              <a href="#biography" className="link-underline">Extended biography ↓</a>
              {settings.cvFileUrl ? (
                <a href={settings.cvFileUrl} className="link-underline" download>Download CV (PDF) ↓</a>
              ) : (
                <span className="text-muted">Curriculum vitae available on request</span>
              )}
              <Link href="/contact/" className="link-underline">Contact →</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-site grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            <p className="kicker mb-4">On this page</p>
            <ol className="space-y-2 text-sm">
              {SECTIONS.map(([id, label]) => (
                <li key={id}><a href={`#${id}`} className="link-underline text-muted hover:text-pine">{label}</a></li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="space-y-24 lg:col-span-8 lg:col-start-5">
          <section id="contributions" aria-labelledby="h-contrib" className="scroll-mt-28">
            <h2 id="h-contrib" className="kicker mb-8">Scientific contributions</h2>
            <ol className="space-y-10">
              {profile.contributions.map((c, i) => (
                <li key={c.title} className="grid gap-2 border-t border-stone pt-6 sm:grid-cols-[3rem_1fr]">
                  <p className="font-serif text-lg text-gold-ink">{String(i + 1).padStart(2, "0")}</p>
                  <div>
                    <h3 className="font-serif text-2xl text-pine">{c.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{c.text}</p>
                    <div className="mt-3 space-y-1">
                      <EvidenceRefs pubs={contribPubs[i]} />
                      {(c.projects ?? []).filter((id) => projectTitle[id]).length > 0 && (
                        <p className="text-xs text-muted">
                          <span className="font-semibold uppercase tracking-[0.12em]">Projects: </span>
                          {(c.projects ?? []).filter((id) => projectTitle[id]).map((id, j) => (
                            <span key={id}>{j > 0 && "; "}<Link href={`/projects/${id}/`} className="link-underline text-gold-ink">{projectTitle[id]}</Link></span>
                          ))}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="nasa" aria-labelledby="h-nasa" className="on-pine scroll-mt-28 bg-pine p-8 text-paper sm:p-12">
            <h2 id="h-nasa" className="kicker mb-4">NASA roles</h2>
            <p className="font-serif text-title">NASA Goddard Space Flight Center, 2002–2015, and mission applications since</p>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {nasa.map((a) => (
                <div key={a.id}>
                  <p className="text-xs text-gold">{formatMonthYear(a.start)} – {a.end ? formatMonthYear(a.end) : "present"}</p>
                  <h3 className="mt-1 font-serif text-xl">{a.title}</h3>
                  <p className="text-sm text-mist">{a.organization}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{a.summary}</p>
                </div>
              ))}
            </div>
            <ul className="mt-10 divide-y divide-mist/15 border-y border-mist/15">
              {nasaService.map((l) => (
                <li key={l.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <span className="text-gold">{l.period}</span>
                  <span><span className="text-paper">{l.role}</span><span className="text-mist"> · {l.body}</span></span>
                </li>
              ))}
              {nasaAward.map((a) => (
                <li key={a.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <span className="text-gold">{a.year}</span>
                  <span className="text-paper">{a.title}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="leadership" aria-labelledby="h-lead" className="scroll-mt-28">
            <h2 id="h-lead" className="kicker mb-8">Scientific leadership and professional service</h2>
            <ul className="divide-y divide-stone border-y border-stone">
              {otherService.map((l) => (
                <li key={l.id} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <span className="text-sm text-muted">{l.period ?? "—"}</span>
                  <span><span className={l.featured ? "font-medium text-ink" : "text-ink"}>{l.role}</span><span className="text-muted"> · {l.body}</span></span>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="kicker mb-4">Peer review (selected journals)</h3>
                <p className="text-sm leading-relaxed text-muted">{profile.reviewing.join(" · ")}</p>
              </div>
              <div>
                <h3 className="kicker mb-4">Professional memberships</h3>
                <ul className="space-y-1 text-sm text-muted">{profile.memberships.map((m) => <li key={m.body}>{m.body} ({m.period})</li>)}</ul>
              </div>
            </div>
          </section>

          <section id="honors" aria-labelledby="h-honors" className="scroll-mt-28">
            <h2 id="h-honors" className="kicker mb-8">Honors and awards</h2>
            <ul className="divide-y divide-stone border-y border-stone">
              {profile.awards.map((a) => (
                <li key={a.id} className="grid gap-2 py-5 sm:grid-cols-[5rem_1fr]">
                  <span className="font-serif text-lg text-gold-ink">{a.year}</span>
                  <span>
                    <span className="block font-serif text-lg text-pine">{a.title}</span>
                    {a.detail && <span className="mt-1 block text-sm text-muted">{a.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="biography" aria-labelledby="h-bio" className="scroll-mt-28">
            <h2 id="h-bio" className="kicker mb-6">Extended biography</h2>
            <div className="prose-editorial">
              {profile.biography.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              <h3>Scientific approach</h3>
              {profile.approach.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </div>
          </section>

          <section id="career" aria-labelledby="h-career" className="scroll-mt-28">
            <h2 id="h-career" className="kicker mb-8">Career</h2>
            <ol className="divide-y divide-stone border-y border-stone">
              {profile.appointments.map((a) => (
                <li key={a.id} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <span className="text-sm text-muted">{formatMonthYear(a.start)} – {a.end ? formatMonthYear(a.end) : "present"}</span>
                  <span><span className="text-ink">{a.title}</span><span className="text-muted"> · {a.organization}</span></span>
                </li>
              ))}
            </ol>
            {profile.teaching.length > 0 && (
              <div className="mt-10">
                <h3 className="kicker mb-4">Teaching</h3>
                <ul className="space-y-3 text-sm text-muted">
                  {profile.teaching.map((t) => <li key={t.title}><span className="text-ink">{t.title}</span>, {t.organization} ({t.period}){t.detail ? ` — ${t.detail}` : ""}</li>)}
                </ul>
              </div>
            )}
          </section>

          <section id="education" aria-labelledby="h-edu" className="scroll-mt-28">
            <h2 id="h-edu" className="kicker mb-8">Education</h2>
            <ul className="space-y-6">
              {profile.education.map((e) => (
                <li key={e.degree} className="grid gap-1 sm:grid-cols-[5rem_1fr]">
                  <span className="font-serif text-lg text-gold-ink">{e.year}</span>
                  <span>
                    <span className="block font-serif text-xl text-pine">{e.degree}</span>
                    <span className="block text-sm text-ink">{e.institution}</span>
                    {e.detail && <span className="mt-1 block text-sm text-muted">{e.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
