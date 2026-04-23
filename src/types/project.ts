import { BrandId, ProjectStatus, SyncMetadata } from "@/types/common";

export interface ProjectItem extends SyncMetadata {
  id: string;
  title: string;
  brandId?: BrandId;
  goal: string;
  startDate: string;
  dueDate?: string;
  status: ProjectStatus;
  summary?: string;
  milestones?: string[];
  taskHooks?: string[];
  calendarAnchors?: string[];
  notes?: string[];
}
