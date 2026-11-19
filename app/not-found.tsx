import "./globals.css";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNav, getProfile, getSettings } from "@/lib/content";

export default async function NotFound() {
  const [profile, settings, nav] = await Promise.all([getProfile(), getSettings(), getNav()]);
  return (
    <>
      <SiteHeader name={profile.name} items={nav} />
      <main id="main" className="container-site flex min-h-[70vh] flex-col justify-center pt-32">
        <p className="kicker">404</p>
        <h1 className="mt-4 text-headline text-pine">This page could not be found.</h1>
        <p className="mt-6 max-w-xl font-serif text-lede text-muted">It may have moved. The research, projects and publications are all reachable from the links below.</p>
        <ul className="mt-10 flex flex-wrap gap-6 text-sm">
          {[["/", "Home"], ["/research", "Research"], ["/projects", "Projects"], ["/publications", "Publications"]].map(([h, l]) => (
            <li key={h}><Link href={h} className="link-underline font-medium text-pine">{l} →</Link></li>
          ))}
        </ul>
      </main>
      <SiteFooter profile={profile} settings={settings} nav={nav} />
    </>
  );
}
