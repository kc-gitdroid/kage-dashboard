import { BrandId, Status, SyncMetadata } from "@/types/common";

export interface PromptItem extends SyncMetadata {
  id: string;
  title: string;
  brandId?: BrandId;
  summary: string;
  body: string;
  status: Status;
  updatedAt: string;
}
