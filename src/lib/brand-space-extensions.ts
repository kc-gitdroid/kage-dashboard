import type { BrandSpace, ContentPillar } from "@/types";

export const AAI_CONTENT_PILLARS: ContentPillar[] = [
  {
    id: "aai-content-pillar-intent",
    order: 1,
    name: "Intent",
    description:
      "Why you move the way you move. Decisions made before anyone else had input. First person, present tense. What you wear is a decision.",
    tags: ["Product", "Styling decisions", "Philosophy"],
    color: "#1D4DFF",
    active: true,
  },
  {
    id: "aai-content-pillar-observation",
    order: 2,
    name: "Observation",
    description: "What you notice. Real people, small rituals, product in scene, never as sole focus.",
    tags: ["PWI episodes", "Details", "Environment"],
    color: "#8CE6FF",
    active: true,
  },
  {
    id: "aai-content-pillar-continuity",
    order: 3,
    name: "Continuity",
    description:
      "Staying with something. The opposite of trend. Worn-in pieces, same garment across seasons, repeat locations.",
    tags: ["Repeat wear", "Anti-trend", "Time passed"],
    color: "#B7FF00",
    active: true,
  },
  {
    id: "aai-content-pillar-individual",
    order: 4,
    name: "The Individual",
    description: "Self-direction in the age of the algorithm. Human presence against algorithmic sameness.",
    tags: ["AAI vs AI", "Soul profiles", "Identity"],
    color: "#F2C94C",
    active: true,
  },
];

export function normalizeBrandSpaceExtensions(brandSpace: BrandSpace): BrandSpace {
  const existingContentSystem = brandSpace.contentSystem ?? {};
  const existingPillars = existingContentSystem.contentPillars ?? [];
  const shouldSeedAaiPillars = brandSpace.id === "aai" && existingPillars.length === 0;

  return {
    ...brandSpace,
    contentSystem: {
      ...existingContentSystem,
      contentPillars: shouldSeedAaiPillars ? AAI_CONTENT_PILLARS : existingPillars,
      contentSeries: existingContentSystem.contentSeries ?? [],
      pillarRotation: existingContentSystem.pillarRotation ?? [],
      contentRules: existingContentSystem.contentRules ?? [],
    },
    contentConcepts: brandSpace.contentConcepts ?? [],
    publishingCalendar: brandSpace.publishingCalendar ?? [],
    actions: brandSpace.actions ?? [],
    thinking: brandSpace.thinking ?? [],
  };
}

export function normalizeBrandSpacesExtensions(brandSpaces: BrandSpace[]) {
  return brandSpaces.map(normalizeBrandSpaceExtensions);
}
