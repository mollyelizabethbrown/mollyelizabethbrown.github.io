export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mollyelizabethbrown.github.io").replace(/\/$/, "");


export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
