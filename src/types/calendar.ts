import { BrandId, CalendarItemType, Status, SyncMetadata } from "@/types/common";

export interface CalendarItem extends SyncMetadata {
  id: string;
  title: string;
  brandId: BrandId;
  type: CalendarItemType;
  start: string;
  end?: string;
  status: Status;
  linkedTaskId?: string;
  linkedProjectId?: string;
  linkedContentId?: string;
  notes?: string;
}
