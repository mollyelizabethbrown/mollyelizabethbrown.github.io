import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { PageHeader } from "@/components/ui";
import { getSettings, getThemes } from "@/lib/content";
import type { Media } from "@/lib/types";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Sources, credits and reuse terms for imagery used on this site.",
  alternates: { canonical: "/image-credits" },
  robots: { index: false },
};

export default async function CreditsPage() {
  const [settings, themes] = await Promise.all([getSettings(), getThemes()]);
  const local: Media[] = (() => {
    const p = path.join(process.cwd(), "content", "data", "media.json");
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : [];
  })();
  const used = new Map<string, Media>();
  for (const m of [settings.hero, ...themes.map((t) => t.image), ...local]) if (m) used.set(m.file, m);

  return (
    <>
      <PageHeader kicker="Image credits" title="Imagery sources and reuse terms" lede="Satellite and astronaut imagery on this site is produced by NASA and its partners and is used under NASA's media usage guidelines. These images illustrate research topics; unless stated, they are not figures from Dr. Brown's publications." />
      <section className="py-16">
        <div className="container-site">
          <ul className="grid gap-12 md:grid-cols-2">
            {Array.from(used.values()).map((m) => (
              <li key={m.file} className="grid grid-cols-[8rem_1fr] gap-5">
                <div className="relative aspect-square overflow-hidden bg-pine"><Image src={m.file} alt="" fill sizes="128px" className="object-cover" /></div>
                <div className="text-sm">
                  <p className="font-serif text-lg text-pine">{m.title}</p>
                  <p className="mt-1 text-muted">{m.credit}</p>
                  <p className="mt-2 text-xs text-muted">{m.license}</p>
                  {m.sourcePage && <a href={m.sourcePage} rel="noopener" className="link-underline mt-2 inline-block text-xs text-gold-ink">Source ↗</a>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
