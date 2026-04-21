import { DashboardShell } from "@/components/dashboard-shell";
import { BrandsPage } from "@/components/pages/brands-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/brands">
      <BrandsPage />
    </DashboardShell>
  );
}
