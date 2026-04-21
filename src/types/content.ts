import {
  BrandId,
  ContentAssetStatus,
  ContentCaptionStatus,
  ContentFormat,
  Status,
  SyncMetadata,
} from "@/types/common";

export interface ContentItem extends SyncMetadata {
  id: string;
  title: string;
  brandId: BrandId;
  format: ContentFormat;
  pillar: string;
  captionStatus: ContentCaptionStatus;
  assetStatus: ContentAssetStatus;
  scheduleDate?: string;
  status: Status;
  linkedProjectId?: string;
}
