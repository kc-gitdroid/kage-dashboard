import type { AccentTone, BrandId, Status } from "@/types/common";
import type { Brand } from "@/types/brand";

export interface BrandCompassStrategy {
  purpose?: string;
  coreBelief?: string;
  positioning?: string;
  promise?: string;
  tension?: string;
  neverBecome?: string;
}

export interface BrandCompassVisualLanguage {
  photography?: string;
  composition?: string;
  colorMood?: string;
  texture?: string;
  lighting?: string;
  references?: string[];
  avoid?: string[];
}

export interface BrandCompassVoice {
  tone?: string;
  sentenceStyle?: string;
  wordsToUse?: string[];
  wordsToAvoid?: string[];
  captionLogic?: string;
  ctaStyle?: string;
  exampleLines?: string[];
}

export interface BrandCompassWorld {
  emotionalTone?: string;
  culturalTerritory?: string;
  recurringThemes?: string[];
  coreTension?: string;
  feeling?: string;
  whatMattersMost?: string;
}

export interface BrandCompass {
  strategy?: BrandCompassStrategy;
  visualLanguage?: BrandCompassVisualLanguage;
  voice?: BrandCompassVoice;
  brandWorld?: BrandCompassWorld;
}

export interface ContentPillar {
  id: string;
  order: number;
  name: string;
  description: string;
  tags: string[];
  color: string;
  active: boolean;
}

export interface ContentSeries {
  id: string;
  order?: number;
  name: string;
  title?: string;
  description?: string;
  pillarId?: string;
  relatedPillarIds?: string[];
  episodeStructure?: string;
  productLogic?: string;
  format?: string;
  active?: boolean;
}

export interface ContentPillarRotationItem {
  postNumber?: number;
  pillarId?: string;
  format?: string;
  direction?: string;
}

export interface ContentRules {
  productRole?: string;
  captionRules?: string;
  visualRules?: string;
  postingRules?: string;
  avoid?: string;
}

export interface BrandContentSystem {
  contentPillars?: ContentPillar[];
  contentSeries?: ContentSeries[];
  pillarRotation?: Array<string | ContentPillarRotationItem>;
  contentRules?: string[] | ContentRules;
}

export interface ContentConcept {
  id: string;
  brandId: BrandId;
  title: string;
  seriesId?: string;
  episodeNumber?: number;
  pillarId?: string;
  format?: string;
  scene?: string;
  visualDirection?: string;
  productPlacement?: string;
  englishCaptionDraft?: string;
  japaneseCaptionDraft?: string;
  notes?: string;
  status?: string;
  linkedPromptIds?: string[];
  linkedActionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PublishingCalendarItem {
  id: string;
  brandId: BrandId;
  date: string;
  title: string;
  pillarId?: string;
  format?: string;
  status?: string;
  contentConceptId?: string;
  sceneBrief?: string;
  visualDirection?: string;
  productPlacement?: string;
  englishCaption?: string;
  japaneseCaption?: string;
  workingNotes?: string;
  linkedPromptIds?: string[];
  linkedActionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandAction {
  id: string;
  brandId: BrandId;
  title: string;
  status?: string;
  linkedItemType?: string;
  linkedItemId?: string;
  nextMove?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandThinkingItem {
  id: string;
  brandId: BrandId;
  title: string;
  body: string;
  type?: string;
  possibleUse?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandSpace extends Brand {
  tone: AccentTone;
  summary: string;
  focus: string;
  cadence: string;
  nextAction: string;
  status: Status;
  horizon: string;
  brandCompass?: BrandCompass;
  contentSystem?: BrandContentSystem;
  contentConcepts?: ContentConcept[];
  publishingCalendar?: PublishingCalendarItem[];
  actions?: BrandAction[];
  thinking?: BrandThinkingItem[];
}
