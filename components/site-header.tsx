"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavItem = { href: string; label: string };

export function SiteHeader({ name, items }: { name: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  const isActive = (href: string) => norm(pathname).startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone/80 bg-paper/95 text-ink backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/" className="flex items-baseline gap-3" aria-label={`${name} — home`}>
          <span className="font-serif text-[1.4rem] leading-none tracking-tight text-pine lg:text-[1.5rem]">{name}</span>
          <span aria-hidden className="hidden h-3 w-px bg-current opacity-30 md:block" />
          <span className="hidden text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted md:block">
            University of Maryland
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.84rem]">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={[
                    "link-underline py-1",
                    isActive(item.href) ? "text-pine [background-size:100%_1px]" : "text-muted hover:text-pine",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-pine lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <div id="mobile-nav" hidden={!open} className="on-pine fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-pine text-paper lg:hidden">
        <nav aria-label="Mobile" className="container-site py-10">
          <ul>
            {[{ href: "/", label: "Home" }, ...items].map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="block border-b border-mist/15 py-4 font-serif text-3xl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
