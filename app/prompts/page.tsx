import { DashboardShell } from "@/components/dashboard-shell";
import { PromptsPage } from "@/components/pages/prompts-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/prompts">
      <PromptsPage />
    </DashboardShell>
  );
}
