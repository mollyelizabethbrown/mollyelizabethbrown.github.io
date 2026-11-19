import Link from "next/link";
import type { NavItem } from "@/components/site-header";
import type { Profile, Settings } from "@/lib/types";

export function SiteFooter({ profile, settings, nav }: { profile: Profile; settings: Settings; nav: NavItem[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="on-pine bg-pine text-paper">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl leading-tight">{profile.name}</p>
          <p className="mt-2 text-sm text-mist">
            {profile.designation} · {profile.department}, {profile.institution}
          </p>
          <p className="kicker mt-6">{profile.tagline}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="kicker mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="link-underline text-mist hover:text-paper">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="kicker mb-4">Affiliation</p>
          <address className="text-sm not-italic leading-relaxed text-mist">
            {profile.contactAddress.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </address>
          {settings.links.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm">
              {settings.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} className="link-underline text-mist hover:text-paper" rel="noopener">
                    {l.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="container-site flex flex-col gap-2 border-t border-mist/15 py-6 text-xs text-mist sm:flex-row sm:justify-between">
        <p>© {year} {profile.name}. Satellite imagery courtesy of the credited agencies.</p>
        <p>
          <Link href="/image-credits/" className="link-underline">Image credits</Link>
        </p>
      </div>
    </footer>
  );
}
