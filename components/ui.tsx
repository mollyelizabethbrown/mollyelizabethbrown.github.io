import Image from "next/image";
import Link from "next/link";
import type { Media } from "@/lib/types";

export function PageHeader({
  kicker, title, lede, children,
}: { kicker: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <header className="border-b border-stone pb-12 pt-32 lg:pb-16 lg:pt-44">
      <div className="container-site">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-4 max-w-5xl text-headline text-pine">{title}</h1>
        {lede && <p className="mt-6 max-w-3xl font-serif text-lede text-muted">{lede}</p>}
        {children}
      </div>
    </header>
  );
}

export function SectionHeading({
  index, kicker, title, href, linkLabel, id,
}: { index?: string; kicker: string; title: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-14">
      <div>
        <p className="kicker flex items-center gap-3">
          {index && <span className="font-serif text-base tracking-normal normal-case">{index}</span>}
          {index && <span aria-hidden className="h-px w-8 bg-current opacity-50" />}
          {kicker}
        </p>
        <h2 id={id} className="mt-3 max-w-3xl text-headline">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 text-sm font-medium">
          <span className="link-underline">{linkLabel ?? "View all"}</span>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

/** Image with mandatory attribution. Third-party imagery is always credited as such. */
export function Figure({
  media, sizes, className = "", priority = false, aspect = "aspect-[16/10]", showCaption = true,
}: { media: Media; sizes: string; className?: string; priority?: boolean; aspect?: string; showCaption?: boolean }) {
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden bg-pine ${aspect}`}>
        <Image src={media.file} alt={media.title} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted">
        {showCaption && media.caption && <span>{media.caption} </span>}
        <span className="text-muted/90">Image: {media.credit}</span>
      </figcaption>
    </figure>
  );
}

export function ArrowLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "group inline-flex items-center gap-2 text-sm font-medium";
  const inner = (
    <>
      <span className="link-underline">{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">{external ? "↗" : "→"}</span>
    </>
  );
  return external ? (
    <a href={href} className={cls} rel="noopener">{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-stone px-6 py-14 text-center">
      <p className="font-serif text-2xl text-pine">{title}</p>
      {children && <div className="mx-auto mt-3 max-w-xl text-sm text-muted">{children}</div>}
    </div>
  );
}
