import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ContentPage } from "@/components/pages/content-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/content">
      <Suspense fallback={null}>
        <ContentPage />
      </Suspense>
    </DashboardShell>
  );
}
