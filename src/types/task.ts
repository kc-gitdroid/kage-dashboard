import { BrandId, Priority, Status, SyncMetadata } from "@/types/common";

export type TaskCategory =
  | "strategy"
  | "content"
  | "product"
  | "admin"
  | "client"
  | "personal";

export interface TaskItem extends SyncMetadata {
  id: string;
  title: string;
  brandId: BrandId;
  dueDate: string;
  priority: Priority;
  category: TaskCategory;
  status: Status;
  projectId?: string;
  notes?: string;
}
