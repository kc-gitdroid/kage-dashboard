"use client";

import { Panel } from "@/components/panel";
import { ProjectDetailPage } from "@/components/pages/project-detail-page";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";

export function ProjectDetailRoutePage({ slug }: { slug: string }) {
  const { getProjectById, hydrated } = useDashboardData();
  const project = hydrated ? getProjectById(slug) : undefined;

  if (!hydrated) {
    return null;
  }

  if (!project) {
    return (
      <Panel eyebrow="Projects / Missing" title="Project unavailable">
        <p className="text-sm text-mute">This project record is not available in the local store yet.</p>
      </Panel>
    );
  }

  return <ProjectDetailPage project={project} />;
}
