import Link from "next/link";
import { yearRange } from "@/lib/format";
import type { Project, Theme } from "@/lib/types";

export function ProjectCard({ project, themes }: { project: Project; themes: Record<string, Theme> }) {
  return (
    <article className="group relative flex h-full flex-col border-t border-pine/80 pt-6" data-reveal>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium tracking-wide text-muted">{yearRange(project.periodStart, project.periodEnd)}</span>
        <span
          className={[
            "inline-flex items-center gap-1.5 uppercase tracking-[0.14em]",
            project.status === "active" ? "text-forest" : "text-muted",
          ].join(" ")}
        >
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${project.status === "active" ? "bg-forest" : "bg-stone"}`} />
          {project.status === "active" ? "Active" : "Completed"}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-[1.45rem] leading-snug text-pine">
        <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0">
          <span className="link-underline">{project.title}</span>
        </Link>
      </h3>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{project.abstract}</p>
      <dl className="mt-auto grid gap-1 pt-5 text-xs text-muted">
        <div className="flex gap-2"><dt className="sr-only">Funder</dt><dd>{project.funder}</dd></div>
        {project.themes[0] && themes[project.themes[0]] && (
          <div className="flex gap-2"><dt className="sr-only">Theme</dt><dd className="text-gold-ink">{themes[project.themes[0]].short}</dd></div>
        )}
      </dl>
    </article>
  );
}
