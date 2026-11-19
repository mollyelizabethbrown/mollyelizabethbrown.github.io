import Image from "next/image";
import Link from "next/link";
import { BookSpine } from "@/components/book-spine";
import { EvidenceRefs } from "@/components/evidence";
import { PublicationCitation } from "@/components/publication";
import { ArrowLink, JsonLd, SectionHeading } from "@/components/ui";
import {
  getBooks, getHighlights, getProfile, getProjects, getPublicationsByDois, getRecentVerified, getSettings, getThemeMap, getThemes,
} from "@/lib/content";
import { yearRange } from "@/lib/format";
import { personJsonLd } from "@/lib/jsonld";

export default async function HomePage() {
  const [profile, settings, themes, themeMap, projects, books, highlights] = await Promise.all([
    getProfile(), getSettings(), getThemes(), getThemeMap(), getProjects(), getBooks(), getHighlights(),
  ]);
  const thisYear = new Date().getFullYear();
  const [featuredPubs, recent, contributionPubs, impactPubs, nasaProjects] = await Promise.all([
    getPublicationsByDois(settings.featuredPublicationDois).then((r) => r.sort((a, b) => b.year - a.year).slice(0, 8)),
    getRecentVerified(thisYear - 1).then((r) => r.slice(0, 6)),
    Promise.all(profile.contributions.map((c) => getPublicationsByDois(c.dois ?? []))),
    Promise.all(highlights.impact.map((i) => getPublicationsByDois(i.evidence.flatMap((e) => (e.doi ? [e.doi] : []))))),
    Promise.resolve(highlights.nasa.projectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean)),
  ]);
  const active = projects.filter((p) => p.status === "active");
  const current = profile.appointments.filter((a) => a.current);
  const honors = profile.awards.filter((a) => a.featured);
  const leadership = profile.leadership.filter((l) => l.featured);
  const band = settings.hero;
  const nasa = highlights.nasa;
  const completed = projects.filter((p) => p.status === "completed");
  const pastRange = completed.length
    ? `${Math.min(...completed.map((p) => p.periodStart))}–${Math.max(...completed.map((p) => p.periodEnd ?? p.periodStart))}`
    : "";
  // The headline already states the main appointment; list the others alongside.
  const otherAppointments = current.filter((a) => a.title !== profile.designation);

  return (
    <>
      <JsonLd data={personJsonLd(profile, settings.links.map((l) => l.url))} />

      {/* Hero ---------------------------------------------------------------- */}
      <section className="border-b border-stone pb-16 pt-28 lg:pb-24 lg:pt-40">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <p className="kicker">{profile.tagline}</p>
            <h1 className="mt-5 text-display text-pine">{profile.name}</h1>
            <p className="mt-4 font-serif text-title text-ink">
              {profile.designation}
              <span className="block text-[0.82em] text-muted">{profile.department}, {profile.institution}</span>
            </p>
            {profile.statement && (
              <p className="mt-8 max-w-3xl border-l-2 border-gold pl-6 font-serif text-lede text-ink">{profile.statement}</p>
            )}
            <dl className="mt-10 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-2 lg:max-w-2xl">
              {otherAppointments.map((a) => (
                <div key={a.id}>
                  <dt className="font-medium text-ink">{a.title}</dt>
                  <dd className="text-muted">{a.short ?? a.organization} · since {a.start.slice(0, 4)}</dd>
                </div>
              ))}
              <div>
                <dt className="font-medium text-ink">NASA Goddard Space Flight Center</dt>
                <dd className="text-muted">Research scientist, 2002–2015</dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-pine">
              <ArrowLink href="/research/">Research</ArrowLink>
              <ArrowLink href="/publications/">Publications</ArrowLink>
              <ArrowLink href="/about/">Biography</ArrowLink>
            </div>
          </div>
          {profile.portrait && (
            <figure className="order-first lg:order-none lg:col-span-4">
              <div className="relative mx-auto w-full max-w-[15rem] sm:max-w-[17rem] lg:ml-auto lg:mr-0 lg:max-w-[19rem]">
                <span aria-hidden className="absolute -bottom-4 -right-4 h-full w-full border border-gold/70" />
                <div className="relative aspect-square overflow-hidden bg-paper-2">
                  <Image src={profile.portrait.src} alt={profile.portrait.alt} fill priority sizes="(min-width:1024px) 304px, 272px" className="object-cover" />
                </div>
              </div>
            </figure>
          )}
        </div>
      </section>

      {/* Documentary image band ---------------------------------------------- */}
      {band && (
        <figure className="relative">
          <div className="relative h-[34vh] min-h-56 max-h-[26rem] overflow-hidden bg-pine">
            <Image src={band.file} alt={band.title} fill sizes="100vw" className="object-cover" />
          </div>
          <figcaption className="container-site py-3 text-xs text-muted">
            {band.title}. {band.caption} <span className="text-muted/90">Image: {band.credit}</span>
          </figcaption>
        </figure>
      )}

      {/* 01 Leading contributions ------------------------------------------------ */}
      <section className="py-24 lg:py-28" aria-labelledby="contrib">
        <div className="container-site">
          <SectionHeading index="01" kicker="Scientific contributions" id="contrib" title="Two decades connecting Earth observation to food security" href="/about/#contributions" linkLabel="More on her work" />
          <ol className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {profile.contributions.map((c, i) => (
              <li key={c.title} className="flex flex-col border-t border-pine pt-6">
                <p className="font-serif text-sm text-gold-ink">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-serif text-2xl leading-snug text-pine">{c.title}</h3>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{c.text}</p>
                <div className="mt-5"><EvidenceRefs pubs={contributionPubs[i]} /></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 02 NASA mission applications ------------------------------------------- */}
      <section className="on-pine bg-pine text-paper" aria-labelledby="nasa">
        <div className="container-site grid gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-6">
            <p className="kicker flex items-center gap-3"><span className="font-serif text-base normal-case tracking-normal">02</span><span aria-hidden className="h-px w-8 bg-current opacity-50" />{nasa.kicker}</p>
            <h2 id="nasa" className="mt-3 text-headline">{nasa.title}</h2>
            <div className="mt-8 space-y-5 font-serif text-lg leading-relaxed text-mist">
              {nasa.text.map((t) => <p key={t.slice(0, 30)}>{t}</p>)}
            </div>
            <dl className="mt-10 divide-y divide-mist/15 border-y border-mist/15">
              {nasa.facts.map((f) => (
                <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-xs uppercase tracking-[0.14em] text-gold">{f.label}</dt>
                  <dd className="text-sm text-paper">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {nasaProjects.map((p) => p && <ArrowLink key={p.id} href={`/projects/${p.id}/`}>{p.title}</ArrowLink>)}
            </div>
          </div>
          {nasa.image && (
            <figure className="lg:col-span-6 lg:pt-12">
              <div className="relative aspect-[16/10] overflow-hidden bg-pine-2">
                <Image src={nasa.image.file} alt={nasa.image.title} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-mist">{nasa.image.caption} Image: {nasa.image.credit}</figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* 03 Current research ----------------------------------------------------- */}
      <section className="py-24 lg:py-28" aria-labelledby="current">
        <div className="container-site">
          <SectionHeading index="03" kicker="Current research" id="current" title="Current programs and recent work" href="/projects/" linkLabel="All projects, current and past" />
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="kicker mb-5">Active programs</h3>
              <ul className="space-y-6">
                {active.map((p) => (
                  <li key={p.id} className="border-t border-pine pt-5">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-forest">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-forest" />Active · {yearRange(p.periodStart, p.periodEnd)}
                    </p>
                    <h4 className="mt-2 font-serif text-2xl leading-snug text-pine">
                      <Link href={`/projects/${p.id}/`} className="link-underline">{p.title}</Link>
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.role}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-muted">
                Earlier programs ({pastRange}), including famine early warning, HIMALA and MERIAM, are documented in the{" "}
                <Link href="/projects/#archive" className="link-underline text-gold-ink">project archive</Link>.
              </p>
            </div>
            <div className="lg:col-span-7">
              <h3 className="kicker mb-1">Recent publications, {thisYear - 1}–{thisYear}</h3>
              <p className="mb-2 text-xs text-muted">Published work with verified DOIs.</p>
              <div className="divide-y divide-stone border-y border-stone">
                {recent.map((p) => <PublicationCitation key={p.id} pub={p} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 Research themes ------------------------------------------------------ */}
      <section className="border-t border-stone bg-paper-2 py-24 lg:py-28" aria-labelledby="themes-title">
        <div className="container-site">
          <SectionHeading index="04" kicker="Research themes" id="themes-title" title="Five connected lines of inquiry" href="/research/" linkLabel="All research themes" />
          <ol className="divide-y divide-stone border-y border-stone">
            {themes.map((t, i) => (
              <li key={t.id}>
                <Link href={`/research/${t.id}/`} className="group grid gap-3 py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="font-serif text-lg text-gold-ink md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-title text-pine md:col-span-5">{t.title}</span>
                  <span className="text-[0.95rem] leading-relaxed text-muted md:col-span-5">{t.summary}</span>
                  <span aria-hidden className="hidden text-right text-xl text-gold-ink transition-transform duration-300 group-hover:translate-x-1 md:col-span-1 md:block">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 Selected scientific impact -------------------------------------------- */}
      <section className="py-24 lg:py-28" aria-labelledby="impact">
        <div className="container-site">
          <SectionHeading index="05" kicker="Scientific impact" id="impact" title="Where the research has been used" />
          <ul className="grid gap-px overflow-hidden border border-stone bg-stone md:grid-cols-2">
            {highlights.impact.map((it, i) => (
              <li key={it.title} className="flex flex-col bg-paper p-8 lg:p-10">
                <h3 className="font-serif text-2xl leading-snug text-pine">{it.title}</h3>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{it.text}</p>
                <div className="mt-6 space-y-1">
                  <EvidenceRefs pubs={impactPubs[i]} />
                  {it.evidence.filter((e) => e.href).map((e) => (
                    <p key={e.label} className="text-xs text-muted">
                      <Link href={e.href!} className="link-underline text-gold-ink">{e.label}</Link>
                    </p>
                  ))}
                  <p className="text-[0.7rem] text-muted/80">Source: {it.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 Selected publications ------------------------------------------------- */}
      {featuredPubs.length > 0 && (
        <section className="border-t border-stone bg-paper-2 py-24 lg:py-28" aria-labelledby="pubs-title">
          <div className="container-site">
            <SectionHeading index="06" kicker="Publications" id="pubs-title" title="Selected publications" href="/publications/" linkLabel="Selected list and full bibliography" />
            <div className="divide-y divide-stone border-y border-stone">
              {featuredPubs.map((p) => <PublicationCitation key={p.id} pub={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 07 Books ------------------------------------------------------------------ */}
      {books.length > 0 && (
        <section className="py-24 lg:py-28" aria-labelledby="books-title">
          <div className="container-site">
            <SectionHeading index="07" kicker="Books" id="books-title" title="Authored books" href="/books/" linkLabel="About the books" />
            <div className="grid gap-12 md:grid-cols-2">
              {books.map((b) => (
                <article key={b.id} className="grid grid-cols-[7rem_1fr] gap-6 sm:grid-cols-[8rem_1fr]">
                  <div className="relative aspect-[2/3] overflow-hidden bg-pine shadow-[0_18px_40px_-24px_rgba(23,45,40,0.6)]">
                    {b.cover ? <Image src={b.cover.file} alt={`Cover of ${b.title}`} fill sizes="128px" className="object-cover" /> : <BookSpine title={b.title} year={b.year} />}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{b.publisher}, {b.year}</p>
                    <h3 className="mt-2 font-serif text-2xl leading-snug text-pine">
                      <Link href={`/books/#${b.id}`} className="link-underline">{b.title}</Link>
                    </h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{b.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 08 Honors and leadership --------------------------------------------------- */}
      <section className="border-t border-stone py-24 lg:py-28" aria-labelledby="honors-title">
        <div className="container-site">
          <SectionHeading index="08" kicker="Recognition" id="honors-title" title="Honors and scientific leadership" href="/about/#leadership" linkLabel="Full record" />
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="kicker mb-6">Selected honors</h3>
              <ul className="divide-y divide-stone border-y border-stone">
                {honors.map((a) => (
                  <li key={a.id} className="grid grid-cols-[4rem_1fr] gap-4 py-5">
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
                  <li key={l.id} className="py-5">
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
