import type { Metadata } from "next";
import { ProjectExplorer } from "@/components/project-explorer";
import { PageHeader } from "@/components/ui";
import { getProjects, getThemes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Funded research projects and programs led or co-led by Molly E. Brown, from NASA mission applications to famine early warning and child nutrition.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, themes] = await Promise.all([getProjects(), getThemes()]);
  const active = projects.filter((p) => p.status === "active").length;
  return (
    <>
      <PageHeader
        kicker="Projects"
        title="Research projects and programs"
        lede={`${projects.length} funded projects and programs since 1998, documented in Dr. Brown's CV — ${active} currently active. Funding agencies include NASA, the National Science Foundation, USAID, USDA and the UK Department for International Development.`}
      />
      <section className="py-14 lg:py-20">
        <div className="container-site">
          <ProjectExplorer projects={projects} themes={themes.map((t) => ({ id: t.id, short: t.short }))} />
        </div>
      </section>
    </>
  );
}
