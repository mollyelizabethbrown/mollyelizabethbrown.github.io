import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getPeople, getProfile, getProjects } from "@/lib/content";
import type { Person } from "@/lib/types";

export const metadata: Metadata = {
  title: "People & Collaborations",
  description: "Research collaborators, students and partner institutions working with Molly E. Brown.",
  alternates: { canonical: "/people" },
};

const GROUPS: { key: Person["category"]; title: string }[] = [
  { key: "collaborator", title: "Current research collaborators" },
  { key: "postdoc", title: "Postdoctoral researchers" },
  { key: "graduate", title: "Graduate researchers" },
  { key: "alumni", title: "Alumni" },
];

export default async function PeoplePage() {
  const [people, profile, projects] = await Promise.all([getPeople(), getProfile(), getProjects()]);
  const pi = people.find((p) => p.category === "pi");
  // Partner institutions are derived from documented project collaborations, not from co-authorship.
  const institutions = Array.from(new Set(projects.flatMap((p) => p.collaborators))).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHeader
        kicker="People & Collaborations"
        title="A collaborative research practice"
        lede="Dr. Brown's research is carried out with students, colleagues and partner institutions across universities, government agencies and humanitarian organizations."
      />

      {pi && (
        <section className="border-b border-stone py-16 lg:py-20" aria-labelledby="pi">
          <div className="container-site grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-3">
              {profile.portrait ? (
                <div className="relative aspect-[4/5] overflow-hidden bg-pine">
                  <Image src={profile.portrait.src} alt={profile.portrait.alt} fill sizes="25vw" className="object-cover" />
                </div>
              ) : (
                <div aria-hidden className="on-pine grid aspect-[4/5] place-items-center bg-pine font-serif text-6xl text-gold">MEB</div>
              )}
            </div>
            <div className="md:col-span-8 md:col-start-5">
              <p className="kicker">Principal investigator</p>
              <h2 id="pi" className="mt-3 text-headline text-pine">{pi.name}</h2>
              <p className="mt-2 text-muted">{profile.designation} · {pi.affiliation}</p>
              <p className="mt-6 max-w-2xl font-serif text-lede text-muted">{profile.summary}</p>
              <Link href="/about" className="link-underline mt-6 inline-block text-sm font-medium text-pine">Full biography →</Link>
            </div>
          </div>
        </section>
      )}

      {GROUPS.map((g) => {
        const rows = people.filter((p) => p.category === g.key);
        if (!rows.length) return null;
        return (
          <section key={g.key} className="border-b border-stone py-16" aria-labelledby={`g-${g.key}`}>
            <div className="container-site">
              <h2 id={`g-${g.key}`} className="kicker mb-8">{g.title}</h2>
              <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((p) => (
                  <li key={p.id} className="flex gap-5">
                    {p.photo && (
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-pine">
                        <Image src={p.photo.src} alt={p.photo.alt} fill sizes="64px" className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-serif text-xl text-pine">{p.url ? <a href={p.url} className="link-underline" rel="noopener">{p.name}</a> : p.name}</p>
                      <p className="mt-1 text-sm text-ink">{p.role}</p>
                      <p className="text-sm text-muted">{p.affiliation}{p.period ? ` · ${p.period}` : ""}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="py-16 lg:py-24" aria-labelledby="institutions">
        <div className="container-site">
          <h2 id="institutions" className="kicker mb-3">Partner institutions</h2>
          <p className="mb-10 max-w-2xl text-sm text-muted">Organizations named as collaborators on the funded projects documented on this site.</p>
          <ul className="columns-1 gap-10 text-[0.95rem] sm:columns-2 lg:columns-3">
            {institutions.map((i) => <li key={i} className="break-inside-avoid border-b border-stone/70 py-2.5">{i}</li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
