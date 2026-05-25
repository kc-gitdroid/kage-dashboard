import type {
  BrandCompass,
  BrandContentSystem,
  BrandSpace,
  ContentConcept,
  ContentPillar,
  ContentPillarRotationItem,
  ContentRules,
  ContentSeries,
} from "@/types";

export interface AaiPromptGenerationContext {
  currentContentEntry: {
    title: string;
    status: string;
    pillarId?: string;
    pillar?: ContentPillar;
    seriesId?: string;
    series?: ContentSeries;
    format: string;
    publishingTargetDate?: string;
    conceptDirection: string;
    visualDirection: string;
    captionDirection: string;
    notes: string;
    advancedDetails: {
      productPlacement: string;
      episodeNumber?: number;
    };
  };
  brandCompass: BrandCompass;
  contentSystem: {
    pillar?: ContentPillar;
    series?: ContentSeries;
    relatedPillars: ContentPillar[];
    pillarRotation: Array<string | ContentPillarRotationItem>;
    contentRules?: string[] | ContentRules;
  };
}

export interface GeneratedPromptSet {
  nanoBananaPrompt: string;
  higgsfieldPrompt: string;
  videoPrompt: string;
  captionOptions: string;
  storySuggestions: string;
}

function clean(value?: string) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function textOr(value: string | undefined, fallback: string) {
  return clean(value) || fallback;
}

function listText(values?: string[]) {
  return (values ?? []).map(clean).filter(Boolean).join(", ");
}

function contentRule(context: AaiPromptGenerationContext, key: keyof ContentRules) {
  const rules = context.contentSystem.contentRules;
  return rules && !Array.isArray(rules) ? clean(rules[key]) : "";
}

function title(context: AaiPromptGenerationContext) {
  return textOr(context.currentContentEntry.title, "Untitled AAI concept");
}

function scene(context: AaiPromptGenerationContext) {
  return textOr(
    context.currentContentEntry.conceptDirection,
    "An individual moving through an ordinary daily rhythm with quiet intent.",
  );
}

function visualDirection(context: AaiPromptGenerationContext) {
  return textOr(
    context.currentContentEntry.visualDirection,
    textOr(
      context.brandCompass.visualLanguage?.photography,
      "Documentary-style editorial realism with natural posture and available daylight.",
    ),
  );
}

function productPresence(context: AaiPromptGenerationContext) {
  return textOr(
    context.currentContentEntry.advancedDetails.productPlacement,
    textOr(contentRule(context, "productRole"), "An AAI garment worn naturally as part of the person's routine."),
  );
}

function pillarLine(context: AaiPromptGenerationContext) {
  const pillar = context.contentSystem.pillar;
  return pillar ? `${pillar.name}: ${clean(pillar.description)}` : "Intent: self-direction expressed through a lived moment.";
}

function seriesLine(context: AaiPromptGenerationContext) {
  const series = context.contentSystem.series;
  if (!series) {
    return "Standalone content concept.";
  }

  const parts = [series.title ?? series.name, clean(series.description), clean(series.episodeStructure)].filter(Boolean);
  return parts.join(" / ");
}

function avoidLine(context: AaiPromptGenerationContext) {
  const avoid = [
    listText(context.brandCompass.visualLanguage?.avoid),
    listText(context.brandCompass.voice?.wordsToAvoid),
    contentRule(context, "avoid"),
  ]
    .filter(Boolean)
    .join("; ");

  return avoid || "hype, luxury flex, influencer posing, glossy campaign energy, artificial aspiration, or product-only styling";
}

function captionTheme(context: AaiPromptGenerationContext) {
  const pillar = context.contentSystem.pillar?.name.toLowerCase() ?? "";
  if (pillar.includes("observation")) return "Notice what moves quietly.";
  if (pillar.includes("continuity")) return "Some pieces stay because they keep becoming yours.";
  if (pillar.includes("individual")) return "The signal can stay quiet when the direction is clear.";
  return "What you wear begins as a decision.";
}

export function assembleAaiPromptGenerationContext(
  concept: ContentConcept,
  brand: Pick<BrandSpace, "brandCompass" | "contentSystem">,
): AaiPromptGenerationContext {
  const contentSystem: BrandContentSystem = brand.contentSystem ?? {};
  const pillars = contentSystem.contentPillars ?? [];
  const series = contentSystem.contentSeries?.find((item) => item.id === concept.seriesId);
  const pillar = pillars.find((item) => item.id === concept.pillarId);
  const relatedPillars = (series?.relatedPillarIds ?? (series?.pillarId ? [series.pillarId] : []))
    .map((pillarId) => pillars.find((item) => item.id === pillarId))
    .filter((item): item is ContentPillar => Boolean(item));

  return {
    currentContentEntry: {
      title: concept.title,
      status: concept.status ?? "",
      pillarId: concept.pillarId,
      pillar,
      seriesId: concept.seriesId,
      series,
      format: concept.format ?? "",
      publishingTargetDate: concept.publishingTargetDate,
      conceptDirection: concept.scene ?? "",
      visualDirection: concept.visualDirection ?? "",
      captionDirection: concept.captionDirection ?? "",
      notes: concept.notes ?? "",
      advancedDetails: {
        productPlacement: concept.productPlacement ?? "",
        episodeNumber: concept.episodeNumber,
      },
    },
    brandCompass: brand.brandCompass ?? {},
    contentSystem: {
      pillar,
      series,
      relatedPillars,
      pillarRotation: contentSystem.pillarRotation ?? [],
      contentRules: contentSystem.contentRules,
    },
  };
}

export function generateNanoBananaPrompt(context: AaiPromptGenerationContext) {
  return [
    `AAI still image concept: "${title(context)}".`,
    `Scene: ${scene(context)}`,
    `Content direction: ${pillarLine(context)} Series: ${seriesLine(context)}`,
    `Product presence: ${productPresence(context)} Keep the garment integrated into life, visible but never the sole focus.`,
    `Image language: ${visualDirection(context)} Documentary-style editorial realism, observed rather than staged, natural posture and movement, 35mm / 55mm film-grain feeling, muted whites, subdued contrast, natural daylight, quiet city or nature rhythm where appropriate.`,
    `Avoid: ${avoidLine(context)}.`,
  ].join("\n\n");
}

export function generateHiggsfieldPrompt(context: AaiPromptGenerationContext) {
  return [
    `Cinematic AAI treatment for "${title(context)}" (${textOr(context.currentContentEntry.format, "editorial post")}).`,
    `Follow this lived moment: ${scene(context)}`,
    `Character and wardrobe: natural body language; ${productPresence(context)} Product supports the individual's rhythm rather than performing for camera.`,
    `Frame language: ${visualDirection(context)} Begin with an observed environmental composition, hold on texture and gesture, then allow a quiet human movement to carry the image. 35mm / 55mm film character, soft daylight, muted whites, low-key subdued contrast, real surfaces and film grain.`,
    `Brand guardrails: ${textOr(context.brandCompass.voice?.tone, "quiet, precise, human, and grounded")}. Do not use ${avoidLine(context)}.`,
  ].join("\n\n");
}

export function generateVideoPrompt(context: AaiPromptGenerationContext) {
  return [
    `AAI short-form video direction: "${title(context)}".`,
    `Narrative: ${scene(context)}`,
    `Motion: open on an unforced wide observation of the environment, move into two close details of hands, fabric, or daily action, follow one natural walking or working movement, and finish on a still breath of space. Product: ${productPresence(context)}`,
    `Camera rhythm: patient handheld or restrained locked-off frames, gentle reframing only, 35mm / 55mm lens feeling, four to six second holds, no abrupt trend edits. Let posture, fabric movement, daylight, and ambient city or nature sound set the pace.`,
    `Look: ${visualDirection(context)} Muted whites, subdued contrast, film grain, available daylight, observed not staged.`,
    `Avoid: ${avoidLine(context)}; no glossy campaign reveal or hard-selling product hero shot.`,
  ].join("\n\n");
}

export function generateCaptionOptions(context: AaiPromptGenerationContext) {
  const series = context.contentSystem.series?.title ?? context.contentSystem.series?.name;
  const cue = textOr(context.currentContentEntry.captionDirection, captionTheme(context));

  return [
    `1. ${title(context)}.`,
    `2. ${captionTheme(context)}`,
    `3. ${series ? `${series}. ` : ""}${cue}`,
    "4. Worn in rhythm. Kept with intent.",
    "5. Go deeper, not louder.",
  ].join("\n");
}

export function generateStorySuggestions(context: AaiPromptGenerationContext) {
  const series = context.contentSystem.series?.title ?? context.contentSystem.series?.name ?? "AAI";
  return [
    `1. Establishing frame: a quiet wide view for "${title(context)}" - ${scene(context)}`,
    `2. Detail frame: hands, fabric, or a lived surface with ${productPresence(context)}`,
    `3. Movement frame: natural posture in motion, following the visual cue "${visualDirection(context)}"`,
    `4. Pause frame: an unposed city or nature detail that returns the product to the person's rhythm.`,
    `5. Closing frame: restrained text card or still image marked "${series}" with the caption direction kept quiet and observational.`,
  ].join("\n\n");
}

export function generateAaiPromptSet(context: AaiPromptGenerationContext): GeneratedPromptSet {
  return {
    nanoBananaPrompt: generateNanoBananaPrompt(context),
    higgsfieldPrompt: generateHiggsfieldPrompt(context),
    videoPrompt: generateVideoPrompt(context),
    captionOptions: generateCaptionOptions(context),
    storySuggestions: generateStorySuggestions(context),
  };
}
