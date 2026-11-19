#!/usr/bin/env node
/**
 * Crawl a running site and report broken internal links, broken images and basic SEO gaps.
 *   npm run build && npm start      (in another terminal)
 *   npm run check:site              (defaults to http://localhost:3000)
 *   npm run check:site -- https://preview-url.example
 * External links are listed but not fetched (many publishers block automated requests).
 */
const BASE = (process.argv[2] || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SKIP = [/^\/studio/, /^\/api\//, /^\/_next\/static/];

const seen = new Set();
const queue = ["/"];
const broken = [];
const brokenImages = new Set();
const seo = [];
const checkedImages = new Set();
const external = new Set();

const attr = (html, tag, name) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*?\\s${name}="([^"]*)"`, "gi"))].map((m) => m[1].replace(/&amp;/g, "&"));

while (queue.length) {
  const route = queue.shift();
  if (seen.has(route)) continue;
  seen.add(route);
  let res;
  try {
    res = await fetch(BASE + route, { redirect: "manual" });
  } catch (e) {
    broken.push(`${route} → fetch failed (${e.message})`);
    continue;
  }
  if (res.status >= 300 && res.status < 400) {
    await res.arrayBuffer().catch(() => {}); // always drain bodies (simple static servers close the socket)
    const loc = res.headers.get("location");
    const next = loc && (loc.startsWith(BASE) ? loc.slice(BASE.length) : loc);
    if (next?.startsWith("/")) queue.push(next);
    continue;
  }
  if (res.status !== 200) {
    await res.arrayBuffer().catch(() => {});
    broken.push(`${route} → HTTP ${res.status}`);
    continue;
  }
  if (!(res.headers.get("content-type") || "").includes("text/html")) { await res.arrayBuffer().catch(() => {}); continue; }
  const html = await res.text();

  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) seo.push(`${route}: ${h1} <h1> elements`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) seo.push(`${route}: missing <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) seo.push(`${route}: missing meta description`);
  if (!/<link rel="canonical"/.test(html)) seo.push(`${route}: missing canonical link`);

  for (const href of attr(html, "a", "href")) {
    if (href.startsWith("http")) { if (!href.startsWith(BASE)) external.add(href); continue; }
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0] || "/";
    if (SKIP.some((re) => re.test(clean))) continue;
    if (!seen.has(clean)) queue.push(clean);
  }
  for (const src of [...attr(html, "img", "src"), ...attr(html, "link", "href").filter((h) => /\.(png|jpe?g|webp|svg|ico)(\?|$)/.test(h))]) {
    if (!src.startsWith("/") || checkedImages.has(src)) continue;
    checkedImages.add(src);
    const r = await fetch(BASE + src).catch(() => null);
    if (r) await r.arrayBuffer().catch(() => {});
    if (!r || r.status !== 200) brokenImages.add(`${src} (on ${route}) → ${r ? r.status : "failed"}`);
  }
}

console.log(`Crawled ${seen.size} pages, ${checkedImages.size} images, ${external.size} distinct external links (not fetched).`);
for (const b of broken) console.error(`BROKEN LINK  ${b}`);
for (const b of brokenImages) console.error(`BROKEN IMAGE ${b}`);
for (const s of seo) console.warn(`SEO          ${s}`);
process.exit(broken.length || brokenImages.size ? 1 : 0);
