import { ContentFormat, ContentItem } from "@/types";

export const contentFormats: ContentFormat[] = ["feed", "story", "reel", "carousel", "article"];

export const contentItems: ContentItem[] = [
  {
    id: "content-001",
    title: "AAI Uniform Reel 01",
    brandId: "aai",
    format: "reel",
    pillar: "Uniform",
    captionStatus: "draft",
    assetStatus: "ready",
    scheduleDate: "2026-04-12T10:00:00",
    status: "scheduled",
    linkedProjectId: "proj-aai-april",
  },
  {
    id: "content-002",
    title: "Masteryatelier Detail Carousel",
    brandId: "masteryatelier",
    format: "carousel",
    pillar: "Craft & Detail",
    captionStatus: "none",
    assetStatus: "in-progress",
    status: "planned",
  },
  {
    id: "content-003",
    title: "MO Studio Delivery Story Set",
    brandId: "mo-studio",
    format: "story",
    pillar: "Process Visibility",
    captionStatus: "ready",
    assetStatus: "ready",
    scheduleDate: "2026-04-12T18:00:00",
    status: "scheduled",
    linkedProjectId: "proj-mo-client",
  },
  {
    id: "content-004",
    title: "Personal Weekly Reset Reflection",
    brandId: "personal",
    format: "article",
    pillar: "Reflection",
    captionStatus: "ready",
    assetStatus: "needed",
    scheduleDate: "2026-04-13T09:00:00",
    status: "in-progress",
    linkedProjectId: "proj-personal-reset",
  },
];
