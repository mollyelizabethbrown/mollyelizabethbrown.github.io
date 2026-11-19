import "../globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNav, getProfile, getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings, nav] = await Promise.all([getProfile(), getSettings(), getNav()]);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-pine"
      >
        Skip to content
      </a>
      <SiteHeader name={profile.name} items={nav} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter profile={profile} settings={settings} nav={nav} />
    </>
  );
}
