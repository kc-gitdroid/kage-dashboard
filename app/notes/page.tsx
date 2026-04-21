import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { NotesPage } from "@/components/pages/notes-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/notes">
      <Suspense fallback={null}>
        <NotesPage />
      </Suspense>
    </DashboardShell>
  );
}
