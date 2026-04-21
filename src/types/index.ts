export * from "@/types/common";
export * from "@/types/brand";
export * from "@/types/brand-space";
export * from "@/types/calendar";
export * from "@/types/content";
export * from "@/types/document";
export * from "@/types/note";
export * from "@/types/project";
export * from "@/types/prompt";
export * from "@/types/sync";
export * from "@/types/task";

import type { AccentTone, NoteType, ProjectStatus, Status } from "@/types/common";
import type { BrandId } from "@/types/common";

export type ProjectMilestone = {
  id: string;
  projectId: string;
  label: string;
};
