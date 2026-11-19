import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui";
import { getNews } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { NEWS_CATEGORY_LABEL } from "@/lib/news";

export const metadata: Metadata = {
  title: "News & Perspectives",
  description: "New publications, research updates, lectures, project announcements and perspectives from Molly E. Brown.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const posts = await getNews();
  return (
    <>
      <PageHeader kicker="News & Perspectives" title="Research notes and updates" lede="New publications, research updates, invited lectures, project announcements and scientific perspectives." />
      <section className="py-16 lg:py-24">
        <div className="container-site">
          {posts.length === 0 ? (
            <EmptyState title="No posts yet">New publications, lectures and research updates will appear here.</EmptyState>
          ) : (
            <ol className="divide-y divide-stone border-y border-stone">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/news/${p.id}`} className="group grid gap-6 py-10 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <p className="text-sm text-muted"><time dateTime={p.date}>{formatDate(p.date)}</time></p>
                      <p className="kicker mt-2">{NEWS_CATEGORY_LABEL[p.category]}</p>
                    </div>
                    <div className="md:col-span-6">
                      <h2 className="font-serif text-title text-pine transition-transform duration-500 group-hover:translate-x-1">{p.title}</h2>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{p.excerpt}</p>
                    </div>
                    {p.image && (
                      <div className="relative aspect-[4/3] overflow-hidden bg-pine md:col-span-3">
                        <Image src={p.image.file} alt={p.image.title} fill sizes="25vw" className="object-cover" />
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
