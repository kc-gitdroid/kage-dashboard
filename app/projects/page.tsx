import { DashboardShell } from "@/components/dashboard-shell";
import { ProjectsPage } from "@/components/pages/projects-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/projects">
      <ProjectsPage />
    </DashboardShell>
  );
}
