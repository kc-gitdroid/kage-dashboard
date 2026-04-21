"use client";

import Link from "next/link";
import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { formatTokenLabel } from "@/lib/format-token-label";

function formatDateRange(startDate: string, dueDate?: string) {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  if (!dueDate) {
    return start;
  }
  const end = new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return `${start} - ${end}`;
}

export function ProjectsPage() {
  const { brands, calendarItems, projects, tasks } = useDashboardData();
  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Projects / Overview"
        title="Projects"
        subtitle="A modular view of active work streams across brands, structured so tasks and calendar links can plug in without changing the page logic."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const brand = brands.find((entry) => entry.id === project.brandId);
            const relatedTasks = tasks.filter((task) => task.projectId === project.id);
            const relatedCalendarItems = calendarItems.filter((item) => item.linkedProjectId === project.id);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition hover:border-white/12"
              >
                <article className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project</p>
                      <h3 className="mt-3 text-2xl font-semibold text-ink">{project.title}</h3>
                    </div>
                    {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                  </div>

                  {project.summary && <p className="text-sm leading-6 text-mute">{project.summary}</p>}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProjectMeta label="Status" value={project.status} />
                    <ProjectMeta label="Timeline" value={formatDateRange(project.startDate, project.dueDate)} />
                    <ProjectMeta label="Goal" value={project.goal} className="sm:col-span-2" />
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                    <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Connectors</p>
                    <div className="mt-3 grid gap-2 text-sm text-mute">
                      <p>{relatedTasks.length} task references ready</p>
                      <p>{relatedCalendarItems.length} calendar anchors ready</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/6 pt-4">
                    <span className="text-sm text-mute">Open project shell</span>
                    <span className="font-display text-sm uppercase tracking-[0.18em] text-ink group-hover:text-blue">
                      Enter
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function ProjectMeta({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/6 bg-panelStrong p-4 ${className}`}>
      <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</p>
      <p className="mt-3 text-sm leading-6 text-mute">{label === "Status" ? formatTokenLabel(value) : value}</p>
    </div>
  );
}
