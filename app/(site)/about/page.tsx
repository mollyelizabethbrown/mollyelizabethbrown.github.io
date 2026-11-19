import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui";
import { getProfile, getProjects, getPublications, getSettings } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: "Biography, career, scientific contributions, honors and professional service of Molly E. Brown, Research Professor at the University of Maryland.",
  alternates: { canonical: "/about" },
};

const SECTIONS = [
  ["overview", "Overview"],
  ["approach", "Scientific approach"],
  ["career", "Career"],
  ["nasa", "NASA research"],
  ["contributions", "Contributions"],
  ["honors", "Honors"],
  ["service", "Service"],
  ["education", "Education"],
] as const;

export default async function AboutPage() {
  const [profile, settings, pubs, projects] = await Promise.all([getProfile(), getSettings(), getPublications(), getProjects()]);
  const nasa = profile.appointments.filter((a) => a.category === "nasa");
  const timeline = profile.appointments;
  const articles = pubs.filter((p) => p.type === "journal-article" || p.type === "letter-commentary").length;
  const firstYear = Math.min(...pubs.map((p) => p.year));

  return (
    <>
      <PageHeader kicker="About" title={`${profile.name}, ${profile.postNominal}`} lede={`${profile.designation}, ${profile.department}, ${profile.institution}`} />

      <div className="container-site grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        {/* In-page navigation */}
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            {profile.portrait && (
              <div className="relative mb-10 aspect-[4/5] overflow-hidden bg-pine">
                <Image src={profile.portrait.src} alt={profile.portrait.alt} fill sizes="22vw" className="object-cover" priority />
              </div>
            )}
            <p className="kicker mb-4">On this page</p>
            <ol className="space-y-2 text-sm">
              {SECTIONS.map(([id, label]) => (
                <li key={id}><a href={`#${id}`} className="link-underline text-muted hover:text-pine">{label}</a></li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="space-y-24 lg:col-span-8 lg:col-start-5">
          {profile.portrait && (
            <div className="relative aspect-[4/5] max-w-sm overflow-hidden bg-pine lg:hidden">
              <Image src={profile.portrait.src} alt={profile.portrait.alt} fill sizes="90vw" className="object-cover" />
            </div>
          )}

          <section id="overview" aria-labelledby="h-overview" className="scroll-mt-28">
            <h2 id="h-overview" className="kicker mb-6">Overview</h2>
            <div className="prose-editorial">{profile.biography.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden border border-stone bg-stone sm:grid-cols-4">
              {[
                [String(articles), "peer-reviewed articles"],
                ["2", "authored books"],
                [String(projects.length), "funded projects"],
                [String(new Date().getFullYear() - firstYear), "years publishing"],
              ].map(([n, l]) => (
                <div key={l} className="bg-paper p-5">
                  <dt className="sr-only">{l}</dt>
                  <dd><span className="block font-serif text-4xl text-pine">{n}</span><span className="mt-1 block text-xs text-muted">{l}</span></dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="approach" aria-labelledby="h-approach" className="scroll-mt-28">
            <h2 id="h-approach" className="kicker mb-6">Scientific approach</h2>
            <div className="prose-editorial">{profile.approach.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
          </section>

          <section id="career" aria-labelledby="h-career" className="scroll-mt-28">
            <h2 id="h-career" className="kicker mb-8">Career and appointments</h2>
            <ol className="relative border-l border-stone">
              {timeline.map((a) => (
                <li key={a.id} className="relative pb-10 pl-8 last:pb-0" data-reveal>
                  <span aria-hidden className={`absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full border ${a.current ? "border-forest bg-forest" : "border-gold-ink bg-paper"}`} />
                  <p className="text-xs font-medium tracking-wide text-muted">
                    {formatMonthYear(a.start)} – {a.end ? formatMonthYear(a.end) : "present"}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl leading-snug text-pine">{a.title}</h3>
                  <p className="text-sm text-ink">{a.organization}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{a.summary}</p>
                </li>
              ))}
            </ol>
            {profile.teaching.length > 0 && (
              <div className="mt-12">
                <h3 className="kicker mb-4">Teaching</h3>
                <ul className="space-y-3 text-sm">
                  {profile.teaching.map((t) => (
                    <li key={t.title}><span className="text-ink">{t.title}</span>, {t.organization} ({t.period}){t.detail ? ` — ${t.detail}` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section id="nasa" aria-labelledby="h-nasa" className="on-pine scroll-mt-28 bg-pine p-8 text-paper sm:p-12">
            <h2 id="h-nasa" className="kicker mb-6">NASA research experience</h2>
            <p className="font-serif text-title">Thirteen years at Goddard Space Flight Center, 2002–2015</p>
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
          </section>

          <section id="contributions" aria-labelledby="h-contrib" className="scroll-mt-28">
            <h2 id="h-contrib" className="kicker mb-8">Scientific contributions</h2>
            <ol className="grid gap-x-10 gap-y-10 md:grid-cols-2">
              {profile.contributions.map((c, i) => (
                <li key={c.title} data-reveal>
                  <p className="font-serif text-sm text-gold-ink">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 font-serif text-xl text-pine">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="honors" aria-labelledby="h-honors" className="scroll-mt-28">
            <h2 id="h-honors" className="kicker mb-8">Awards and distinctions</h2>
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

          <section id="service" aria-labelledby="h-service" className="scroll-mt-28">
            <h2 id="h-service" className="kicker mb-8">Scientific leadership and professional service</h2>
            <ul className="divide-y divide-stone border-y border-stone">
              {profile.leadership.map((l) => (
                <li key={l.id} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <span className="text-sm text-muted">{l.period ?? "—"}</span>
                  <span><span className="text-ink">{l.role}</span><span className="text-muted"> · {l.body}</span></span>
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
                <ul className="space-y-1 text-sm text-muted">{profile.memberships.map((m) => <li key={m.body}>{m.body} <span className="text-muted/80">({m.period})</span></li>)}</ul>
              </div>
            </div>
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

          <section aria-labelledby="h-cv" className="border-t border-stone pt-10">
            <h2 id="h-cv" className="kicker mb-4">Curriculum vitae</h2>
            {settings.cvFileUrl ? (
              <a href={settings.cvFileUrl} className="inline-flex items-center gap-2 bg-pine px-5 py-3 text-sm font-medium text-paper hover:bg-forest" download>
                Download CV (PDF) <span aria-hidden>↓</span>
              </a>
            ) : (
              <p className="text-sm text-muted">A full curriculum vitae is available on request.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
