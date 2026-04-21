import { BrandId, SyncMetadata } from "@/types/common";

export interface Brand extends SyncMetadata {
  id: BrandId;
  name: string;
  shortName: string;
  color: string;
  description: string;
}
