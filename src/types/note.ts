import { BrandId, NoteType, SyncMetadata } from "@/types/common";

export interface NoteItem extends SyncMetadata {
  id: string;
  title: string;
  brandId?: BrandId;
  type: NoteType;
  body: string;
  createdAt: string;
}
