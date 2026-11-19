import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { getProfile, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Professional contact information and scholarly profiles for Molly E. Brown, University of Maryland.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  return (
    <>
      <PageHeader kicker="Contact" title="Get in touch" lede="For research collaboration, student inquiries, speaking invitations and media requests." />
      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="kicker mb-5">Academic affiliation</h2>
            <p className="font-serif text-2xl text-pine">{profile.name}, {profile.postNominal}</p>
            <p className="mt-1 text-ink">{profile.designation}</p>
            <address className="mt-4 not-italic leading-relaxed text-muted">
              {profile.contactAddress.map((l) => <span key={l} className="block">{l}</span>)}
            </address>
            {settings.contactEmail && (
              <p className="mt-8">
                <span className="kicker block">Email</span>
                <a href={`mailto:${settings.contactEmail}`} className="link-underline mt-2 inline-block font-serif text-2xl text-pine">{settings.contactEmail}</a>
              </p>
            )}
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h2 className="kicker mb-5">Scholarly profiles</h2>
            <ul className="divide-y divide-stone border-y border-stone">
              {settings.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} rel="noopener" className="group flex items-center justify-between py-5">
                    <span className="font-serif text-xl text-pine">{l.label}</span>
                    <span aria-hidden className="text-gold-ink transition-transform group-hover:translate-x-1">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
