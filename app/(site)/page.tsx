import Image from "next/image";
import Link from "next/link";
import { EvidenceChain } from "@/components/evidence-chain";
import { ProjectCard } from "@/components/project-card";
import { PublicationCitation } from "@/components/publication";
import { ArrowLink, JsonLd, SectionHeading } from "@/components/ui";
import { BookSpine } from "@/components/book-spine";
import {
  getBooks, getProfile, getProjects, getPublicationsByDois, getSettings, getThemeMap, getThemes,
} from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import { personJsonLd } from "@/lib/jsonld";

export default async function HomePage() {
  const [profile, settings, themes, themeMap, projects, books] = await Promise.all([
    getProfile(), getSettings(), getThemes(), getThemeMap(), getProjects(), getBooks(),
  ]);
  const featuredPubs = (await getPublicationsByDois(settings.featuredPublicationDois)).sort((a, b) => b.year - a.year);
  const featuredProjects = settings.featuredProjectIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 6);
  const current = profile.appointments.filter((a) => a.current);
  const honors = profile.awards.filter((a) => a.featured);
  const leadership = profile.leadership.filter((l) => l.featured);
  const hero = settings.hero;

  return (
    <>
      <JsonLd data={personJsonLd(profile, settings.links.map((l) => l.url))} />

      {/* 1 · Hero ------------------------------------------------------------ */}
      <section className="on-pine relative isolate flex min-h-[min(92svh,60rem)] items-end overflow-hidden bg-pine text-paper">
        {hero ? (
          <Image src={hero.file} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
        ) : (
          <HeroPattern />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-pine via-pine/90 to-pine/55" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-pine via-transparent to-pine/40" />
        <div className="container-site w-full pb-14 pt-28 lg:pb-20 lg:pt-36">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Portrait */}
            {profile.portrait && (
              <figure className="order-first lg:order-last lg:col-span-5">
                <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-xs lg:max-w-none">
                  <span aria-hidden className="absolute -bottom-3 -right-3 h-full w-full border border-gold/60 lg:-bottom-5 lg:-right-5" />
                  <div className="relative aspect-[4/5] overflow-hidden bg-pine-2 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
                    <Image
                      src={profile.portrait.src}
                      alt={profile.portrait.alt}
                      fill
                      priority
                      sizes="(min-width:1024px) 34vw, 320px"
                      className="object-cover object-[50%_35%]"
                    />
                  </div>
                </div>
              </figure>
            )}

            {/* Identity */}
            <div className="lg:col-span-7">
              <p className="kicker">{profile.tagline}</p>
              <h1 className="mt-5 text-display">{profile.name}</h1>
              <p className="mt-4 font-serif text-title text-mist">
                {profile.designation}
                <span className="block text-[0.8em] text-mist/85">{profile.department}, {profile.institution}</span>
              </p>
              {profile.statement && <p className="mt-6 font-serif text-title">{profile.statement}</p>}
              <p className="mt-8 max-w-2xl border-t border-mist/20 pt-8 font-serif text-lede text-mist">{profile.summary}</p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <ArrowLink href="/research">Explore the research</ArrowLink>
                <ArrowLink href="/publications">Publications</ArrowLink>
                <ArrowLink href="/about">Biography</ArrowLink>
              </div>
            </div>
          </div>
          {hero && <p className="mt-12 text-[0.68rem] text-mist/70">Background image: {hero.credit}</p>}
        </div>
      </section>

      {/* 2 · Appointments --------------------------------------------------- */}
      <section aria-labelledby="appointments" className="border-b border-stone bg-paper-2">
        <div className="container-site grid gap-8 py-10 md:grid-cols-12 md:items-center">
          <h2 id="appointments" className="kicker md:col-span-2">Current appointments</h2>
          <ul className="grid gap-6 sm:grid-cols-2 md:col-span-10 lg:grid-cols-3">
            {current.map((a) => (
              <li key={a.id}>
                <p className="font-serif text-xl text-pine">{a.title}</p>
                <p className="mt-1 text-sm text-muted">{a.organization}</p>
                <p className="mt-1 text-xs text-muted">Since {formatMonthYear(a.start)}</p>
              </li>
            ))}
            <li>
              <p className="font-serif text-xl text-pine">NASA Goddard Space Flight Center</p>
              <p className="mt-1 text-sm text-muted">Research scientist, 2002–2015</p>
              <Link href="/about#career" className="link-underline mt-1 inline-block text-xs text-gold-ink">Career →</Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 3 · Research themes ------------------------------------------------- */}
      <section className="py-24 lg:py-32" aria-labelledby="themes-title">
        <div className="container-site">
          <SectionHeading index="01" kicker="Research" id="themes-title" title="Five connected lines of inquiry" href="/research" linkLabel="All research themes" />
          <ol className="divide-y divide-stone border-y border-stone">
            {themes.map((t, i) => (
              <li key={t.id} data-reveal>
                <Link href={`/research/${t.id}`} className="group grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="font-serif text-lg text-gold-ink md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-title text-pine transition-transform duration-500 group-hover:translate-x-1 md:col-span-5">
                    {t.title}
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-muted md:col-span-5">{t.summary}</span>
                  <span aria-hidden className="hidden text-right text-xl text-gold-ink transition-transform duration-300 group-hover:translate-x-1 md:col-span-1 md:block">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · Orbit to outcome ------------------------------------------------- */}
      <section className="on-pine bg-pine py-24 text-paper lg:py-32" aria-labelledby="chain-title">
        <div className="container-site">
          <div className="grid gap-10 md:grid-cols-12" data-reveal>
            <div className="md:col-span-5">
              <p className="kicker flex items-center gap-3"><span className="font-serif text-base normal-case tracking-normal">02</span><span aria-hidden className="h-px w-8 bg-current opacity-50" />Approach</p>
              <h2 id="chain-title" className="mt-3 text-headline">{settings.earthToDecisionsTitle}</h2>
            </div>
            <p className="font-serif text-lede text-mist md:col-span-6 md:col-start-7">{settings.earthToDecisionsText}</p>
          </div>
          <div className="mt-16 lg:mt-20">
            <EvidenceChain steps={profile.chain} />
          </div>
        </div>
      </section>

      {/* 5 · Featured projects ----------------------------------------------- */}
      {featuredProjects.length > 0 && (
        <section className="py-24 lg:py-32" aria-labelledby="projects-title">
          <div className="container-site">
            <SectionHeading index="03" kicker="Projects" id="projects-title" title="Selected research programs" href="/projects" linkLabel="All projects" />
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((p) => <ProjectCard key={p.id} project={p} themes={themeMap} />)}
            </div>
          </div>
        </section>
      )}

      {/* 6 · Selected publications ------------------------------------------- */}
      {featuredPubs.length > 0 && (
        <section className="border-t border-stone bg-paper-2 py-24 lg:py-32" aria-labelledby="pubs-title">
          <div className="container-site">
            <SectionHeading index="04" kicker="Publications" id="pubs-title" title="Selected publications" href="/publications" linkLabel="Full bibliography" />
            <div className="divide-y divide-stone border-y border-stone">
              {featuredPubs.map((p) => (
                <div key={p.id} data-reveal><PublicationCitation pub={p} /></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 · Books ------------------------------------------------------------ */}
      {books.length > 0 && (
        <section className="py-24 lg:py-32" aria-labelledby="books-title">
          <div className="container-site">
            <SectionHeading index="05" kicker="Books" id="books-title" title="Two books on food security from space" href="/books" linkLabel="About the books" />
            <div className="grid gap-12 md:grid-cols-2">
              {books.map((b) => (
                <article key={b.id} className="grid grid-cols-[7rem_1fr] gap-6 sm:grid-cols-[9rem_1fr]" data-reveal>
                  <div className="relative aspect-[2/3] overflow-hidden bg-pine shadow-[0_18px_40px_-24px_rgba(23,45,40,0.6)]">
                    {b.cover ? (
                      <Image src={b.cover.file} alt={`Cover of ${b.title}`} fill sizes="144px" className="object-cover" />
                    ) : (
                      <BookSpine title={b.title} year={b.year} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{b.publisher}, {b.year}</p>
                    <h3 className="mt-2 font-serif text-2xl leading-snug text-pine">
                      <Link href={`/books#${b.id}`} className="link-underline">{b.title}</Link>
                    </h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{b.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8 · Honors & leadership --------------------------------------------- */}
      <section className="border-t border-stone py-24 lg:py-32" aria-labelledby="honors-title">
        <div className="container-site">
          <SectionHeading index="06" kicker="Recognition" id="honors-title" title="Honors and scientific leadership" href="/about#honors" linkLabel="Full record" />
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="kicker mb-6">Selected honors</h3>
              <ul className="divide-y divide-stone border-y border-stone">
                {honors.map((a) => (
                  <li key={a.id} className="grid grid-cols-[4rem_1fr] gap-4 py-5" data-reveal>
                    <span className="font-serif text-lg text-gold-ink">{a.year}</span>
                    <span className="font-serif text-lg leading-snug text-pine">{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="kicker mb-6">Leadership and service</h3>
              <ul className="divide-y divide-stone border-y border-stone">
                {leadership.map((l) => (
                  <li key={l.id} className="py-5" data-reveal>
                    <p className="font-serif text-lg leading-snug text-pine">{l.role}</p>
                    <p className="mt-1 text-sm text-muted">{l.body}{l.period ? ` · ${l.period}` : ""}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Typographic fallback when no hero image is configured — abstract contour field, not a scientific figure. */
function HeroPattern() {
  return (
    <svg aria-hidden className="absolute inset-0 -z-20 h-full w-full opacity-[0.18]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
      {Array.from({ length: 22 }, (_, i) => (
        <path
          key={i}
          d={`M -50 ${120 + i * 30} C 250 ${60 + i * 34}, 450 ${220 + i * 22}, 700 ${140 + i * 30} S 1100 ${80 + i * 34}, 1260 ${160 + i * 28}`}
          fill="none"
          stroke="#B48D59"
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}
