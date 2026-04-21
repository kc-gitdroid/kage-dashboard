import { DashboardShell } from "@/components/dashboard-shell";
import { HomePage } from "@/components/pages/home-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/">
      <HomePage />
    </DashboardShell>
  );
}
