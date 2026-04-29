import { Brand, BrandId, BrandSpace } from "@/types";

export const brands: Brand[] = [
  {
    id: "aai",
    name: "An Autonomous Individual",
    shortName: "AAI",
    color: "#1D4DFF",
    description: "Intentional contemporary clothing brand.",
  },
  {
    id: "masteryatelier",
    name: "Masteryatelier",
    shortName: "Masteryatelier",
    color: "#F38B2A",
    description: "Craft-led footwear and product expression.",
  },
  {
    id: "mo-studio",
    name: "Massiveoutfit / MO Studio",
    shortName: "MO Studio",
    color: "#8A63D2",
    description: "Creative studio shaping brand worlds, products, and visual systems.",
  },
  {
    id: "personal",
    name: "Personal",
    shortName: "Personal",
    color: "#B7FF00",
    description: "Kage personal brand and self-management.",
  },
  {
    id: "biro",
    name: "biro",
    shortName: "biro",
    color: "#8CE6FF",
    description: "Writing and idea workspace for exploratory thinking.",
  },
];

export const brandSpaces: BrandSpace[] = [
  {
    ...brands[0],
    tone: "blue",
    summary: "Clarity, restraint, and self-direction translated into a living brand system.",
    focus: "Uniform / Craft & Detail / Urban Stillness",
    cadence: "Editorial stills, quiet movement clips, perspective-led captions",
    nextAction: "Finalize the monthly uniform series and align web copy to the decision filter.",
    status: "active",
    horizon: "Next review: May 4",
  },
  {
    ...brands[1],
    tone: "orange",
    summary: "A craft-first product house for footwear, objects, and disciplined material expression.",
    focus: "Footwear / Product craft / Material discipline / Atelier systems",
    cadence: "Material studies, prototype reviews, construction notes, product story drafts",
    nextAction: "Convert the atelier direction into a tighter product system: silhouettes, materials, offer ladder, and launch priorities.",
    status: "in-progress",
    horizon: "System review: Apr 19",
  },
  {
    ...brands[2],
    tone: "purple",
    summary: "MO Studio shapes brands, objects, and visual worlds through strategy, design, and grounded execution.",
    focus: "Brand worlds / Product direction / Cultural intelligence / Grounded execution",
    cadence: "Project frames, case-study carousels, process intelligence, in-house proof, studio notes",
    nextAction: "Reframe MO Studio content around proof, process intelligence, in-house brand proof, craft detail, and cultural observation.",
    status: "active",
    horizon: "Studio content system review: Apr 17",
  },
  {
    ...brands[3],
    tone: "lime",
    summary: "Kage's personal command layer for identity, visibility, learning, energy, and long-range direction.",
    focus: "Personal brand / Creative identity / Rhythm / Reflection / Public thought",
    cadence: "Weekly resets, idea capture, public notes, reading synthesis, energy reviews",
    nextAction: "Turn the personal brand into a repeatable rhythm: clear pillars, capture habits, publishing lanes, and review blocks.",
    status: "active",
    horizon: "Weekly reset: Apr 12",
  },
  {
    ...brands[4],
    tone: "cyan",
    summary: "A quieter workspace for writing, prompts, and early-stage idea development.",
    focus: "Writing / Concepts / Experiments",
    cadence: "Prompt drafts, short notes, concept mapping, and story seeds",
    nextAction: "Shape the first set of prompt-led writing structures and connect them to working notes.",
    status: "draft",
    horizon: "Seed review: Apr 20",
  },
];

export function getBrandById(id: BrandId) {
  return brands.find((brand) => brand.id === id);
}

export function getBrandSpaceById(id: BrandId) {
  return brandSpaces.find((brand) => brand.id === id);
}

export const brandNameById = Object.fromEntries(brands.map((brand) => [brand.id, brand.name])) as Record<BrandId, string>;
