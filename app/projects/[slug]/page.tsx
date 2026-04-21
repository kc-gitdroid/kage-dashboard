import { DashboardShell } from "@/components/dashboard-shell";
import { ProjectDetailRoutePage } from "@/components/pages/project-detail-route-page";
import { getProjectById, projects } from "@/data";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.id,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectById(slug);

  return (
    <DashboardShell currentPath="/projects">
      <ProjectDetailRoutePage slug={project?.id ?? slug} />
    </DashboardShell>
  );
}
