import { BrandId, DocumentType, Status, SyncMetadata } from "@/types/common";

export interface DocumentItem extends SyncMetadata {
  id: string;
  title: string;
  brandId: BrandId;
  type: DocumentType;
  status: Status;
  lastUpdated: string;
  summary?: string;
  fileUrl?: string;
}
