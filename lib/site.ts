export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mollyelizabethbrown.github.io").replace(/\/$/, "");

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/projects", label: "Projects" },
  { href: "/publications", label: "Publications" },
  { href: "/books", label: "Books" },
  { href: "/people", label: "People" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
