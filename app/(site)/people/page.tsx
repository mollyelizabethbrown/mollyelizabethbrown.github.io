import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getPeople, getProfile, getProjects, getRecentCoauthors } from "@/lib/content";
import type { Person } from "@/lib/types";

export const metadata: Metadata = {
  title: "People & Collaborations",
  description: "Doctoral students, alumni, research mentees, recent collaborators and partner institutions of Molly E. Brown's research group at the University of Maryland.",
  alternates: { canonical: "/people/" },
};

const COAUTHOR_SINCE = 2024;

function PersonRow({ p }: { p: Person }) {
  return (
    <li className="grid gap-1 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
      <p className="font-serif text-xl text-pine">{p.url ? <a href={p.url} className="link-underline" rel="noopener">{p.name}</a> : p.name}</p>
      <p className="text-sm leading-relaxed text-muted">
        <span className="text-ink">{p.role}</span>
        {p.affiliation && <span className="block">{p.affiliation}</span>}
      </p>
    </li>
  );
}

export default async function PeoplePage() {
  const [people, profile, projects, coauthors] = await Promise.all([getPeople(), getProfile(), getProjects(), getRecentCoauthors(COAUTHOR_SINCE)]);
  const advisees = people.filter((p) => p.category === "advisee");
  const alumni = people.filter((p) => p.category === "alumni");
  const mentees = people.filter((p) => p.category === "mentee");
  const menteesByYear = Array.from(new Set(mentees.map((m) => m.period ?? ""))).sort((a, b) => b.localeCompare(a))
    .map((y) => ({ year: y, rows: mentees.filter((m) => (m.period ?? "") === y) }));
  const institutions = Array.from(new Set(projects.flatMap((p) => p.collaborators))).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHeader
        kicker="People & Collaborations"
        title="Research group and collaborations"
        lede="Doctoral students, alumni and mentees supervised or advised by Dr. Brown, the colleagues she currently publishes with, and the institutions that partner in her research programs."
      />

      {/* PI */}
      <section className="border-b border-stone py-16 lg:py-20" aria-labelledby="pi">
        <div className="container-site grid gap-10 md:grid-cols-12 md:items-center">
          {profile.portrait && (
            <div className="md:col-span-3">
              <div className="relative aspect-square max-w-[15rem] overflow-hidden bg-paper-2">
                <Image src={profile.portrait.src} alt={profile.portrait.alt} fill sizes="240px" className="object-cover" />
              </div>
            </div>
          )}
          <div className="md:col-span-8 md:col-start-5">
            <p className="kicker">Principal investigator</p>
            <h2 id="pi" className="mt-3 text-headline text-pine">{profile.name}</h2>
            <p className="mt-2 text-muted">{profile.designation} · {profile.department}, {profile.institution}</p>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-ink">{profile.bioShort}</p>
            <Link href="/about/" className="link-underline mt-6 inline-block text-sm font-medium text-pine">Biography →</Link>
          </div>
        </div>
      </section>

      <div className="container-site space-y-20 py-16 lg:py-20">
        <p className="max-w-3xl text-sm text-muted">
          <strong className="font-semibold text-ink">Research group.</strong> Students, alumni and mentees are listed with the roles recorded in Dr. Brown&apos;s curriculum vitae (Winter 2026).
        </p>

        {advisees.length > 0 && (
          <section aria-labelledby="advisees">
            <h2 id="advisees" className="kicker mb-2">Current doctoral students</h2>
            <ul className="divide-y divide-stone border-y border-stone">{advisees.map((p) => <PersonRow key={p.id} p={p} />)}</ul>
          </section>
        )}

        {alumni.length > 0 && (
          <section aria-labelledby="alumni">
            <h2 id="alumni" className="kicker mb-2">Doctoral alumni</h2>
            <ul className="divide-y divide-stone border-y border-stone">
              {alumni.map((p) => <PersonRow key={p.id} p={{ ...p, role: p.period && !p.role.includes(p.period) ? `${p.role} · ${p.period}` : p.role }} />)}
            </ul>
          </section>
        )}

        {mentees.length > 0 && (
          <section aria-labelledby="mentees">
            <h2 id="mentees" className="kicker mb-2">Research mentees and interns</h2>
            <div className="divide-y divide-stone border-y border-stone">
              {menteesByYear.map(({ year, rows }) => (
                <div key={year} className="grid gap-2 py-5 sm:grid-cols-[6rem_1fr]">
                  <p className="font-serif text-xl text-gold-ink">{year}</p>
                  <ul className="space-y-2">
                    {rows.map((p) => (
                      <li key={p.id} className="text-sm leading-relaxed">
                        <span className="font-serif text-lg text-pine">{p.name}</span>
                        <span className="text-muted"> — {p.role}{p.affiliation ? `, ${p.affiliation}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="coauthors">
          <h2 id="coauthors" className="kicker mb-2">Recent collaborators</h2>
          <p className="mb-6 max-w-3xl text-sm text-muted">
            Co-authors on Dr. Brown&apos;s {coauthors.pubCount} DOI-verified publications since {COAUTHOR_SINCE}. Co-authorship, not group membership.
          </p>
          <ul className="columns-1 gap-10 text-[0.95rem] sm:columns-2 lg:columns-3">
            {coauthors.authors.map(([name, n]) => (
              <li key={name} className="break-inside-avoid border-b border-stone/70 py-2">
                {name}{n > 1 && <span className="ml-2 text-xs text-muted">{n} papers</span>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="institutions">
          <h2 id="institutions" className="kicker mb-2">Institutional partners</h2>
          <p className="mb-6 max-w-3xl text-sm text-muted">Organizations named as collaborators on the funded projects documented on this site.</p>
          <ul className="columns-1 gap-10 text-[0.95rem] sm:columns-2 lg:columns-3">
            {institutions.map((i) => <li key={i} className="break-inside-avoid border-b border-stone/70 py-2">{i}</li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
