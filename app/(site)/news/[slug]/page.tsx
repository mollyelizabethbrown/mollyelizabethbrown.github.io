import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { PublicationCitation } from "@/components/publication";
import { Figure, JsonLd } from "@/components/ui";
import { getNews, getProjects, getPublicationsByDois } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { NEWS_CATEGORY_LABEL } from "@/lib/news";
import { absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getNews();
  // Static export needs at least one path; with no posts yet, emit a placeholder that renders the 404 page.
  return posts.length ? posts.map((p) => ({ slug: p.id })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getNews()).find((p) => p.id === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.id}` },
    openGraph: { type: "article", publishedTime: post.date, images: post.image ? [{ url: post.image.file }] : undefined },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = (await getNews()).find((p) => p.id === slug);
  if (!post) notFound();
  const [pubs, projects] = await Promise.all([getPublicationsByDois(post.relatedPublicationDois), getProjects()]);
  const related = projects.filter((p) => post.relatedProjectIds.includes(p.id));

  return (
    <article>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.date,
        author: { "@id": absoluteUrl("/#person") }, url: absoluteUrl(`/news/${post.id}`),
      }} />
      <header className="pb-12 pt-32 lg:pt-44">
        <div className="container-site max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-xs text-muted"><Link href="/news" className="link-underline">News</Link></nav>
          <p className="kicker mt-8">{NEWS_CATEGORY_LABEL[post.category]} · <time dateTime={post.date}>{formatDate(post.date)}</time></p>
          <h1 className="mt-4 text-headline text-pine">{post.title}</h1>
          <p className="mt-6 font-serif text-lede text-muted">{post.excerpt}</p>
        </div>
      </header>
      {post.image && (
        <div className="container-site max-w-5xl"><Figure media={post.image} sizes="(min-width:1024px) 64rem, 100vw" priority /></div>
      )}
      <div className="container-site prose-editorial max-w-3xl py-14">
        {Array.isArray(post.body) && typeof post.body[0] === "string"
          ? (post.body as string[]).map((p) => <p key={p.slice(0, 30)}>{p}</p>)
          : <PortableText value={post.body as never} />}
      </div>
      {(pubs.length > 0 || related.length > 0) && (
        <aside className="border-t border-stone bg-paper-2 py-14">
          <div className="container-site max-w-4xl">
            {pubs.length > 0 && (
              <>
                <h2 className="kicker mb-4">Related publications</h2>
                <div className="divide-y divide-stone border-y border-stone">{pubs.map((p) => <PublicationCitation key={p.id} pub={p} />)}</div>
              </>
            )}
            {related.length > 0 && (
              <>
                <h2 className="kicker mb-4 mt-10">Related projects</h2>
                <ul className="space-y-2">{related.map((p) => <li key={p.id}><Link href={`/projects/${p.id}`} className="link-underline font-serif text-xl text-pine">{p.title}</Link></li>)}</ul>
              </>
            )}
          </div>
        </aside>
      )}
    </article>
  );
}
