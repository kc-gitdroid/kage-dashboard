import type {
  BrandAction,
  BrandCompass,
  BrandContentSystem,
  BrandSpace,
  BrandThinkingItem,
  ContentConcept,
  ContentPillar,
  PublishingCalendarItem,
} from "@/types";

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

type BrandSpaceDefaults = {
  overview?: Partial<Pick<BrandSpace, "description" | "summary" | "focus" | "cadence" | "nextAction" | "horizon">>;
  brandCompass?: BrandCompass;
  contentSystem?: BrandContentSystem;
  contentConcepts?: ContentConcept[];
  publishingCalendar?: PublishingCalendarItem[];
  actions?: BrandAction[];
  thinking?: BrandThinkingItem[];
};

const LEGACY_OVERVIEW_VALUES: Partial<Record<BrandSpace["id"], Partial<Record<keyof NonNullable<BrandSpaceDefaults["overview"]>, string[]>>>> = {
  masteryatelier: {
    summary: ["A structured knowledge space for curriculum, systems thinking, and personal growth."],
    focus: ["Programs / Methods / Insight systems"],
    cadence: ["Workshop notes, curriculum maps, long-form essays"],
    nextAction: ["Shape the next learning sprint and pin reusable teaching assets."],
    horizon: ["Draft milestone: Apr 16"],
  },
  "mo-studio": {
    description: ["Creative studio and client work."],
    summary: [
      "The production and delivery layer for client work, systems, and execution cadence.",
      "The execution studio for creative direction, brand systems, content production, and client delivery.",
    ],
    focus: ["Pipeline / Delivery / Assets", "Client pipeline / Creative systems / Delivery rhythm / Asset production"],
    cadence: [
      "Project reviews, client touchpoints, production planning",
      "Pipeline reviews, client check-ins, production boards, handoff notes, case-study capture",
    ],
    nextAction: [
      "Review current project status and consolidate delivery checkpoints.",
      "Clarify the studio offer ladder and tighten the operating rhythm from inquiry to delivery.",
    ],
    horizon: ["Checkpoint: Apr 12", "Ops review: Apr 17"],
  },
  personal: {
    summary: ["A private command layer for goals, notes, reading, and reflective planning."],
    focus: ["Rhythm / Health / Reflection"],
    cadence: ["Weekly reviews, note capture, reading and idea synthesis"],
    nextAction: ["Prepare the next weekly reset and roll active notes into the calendar."],
    horizon: ["Reset: Apr 12"],
  },
};

const BRAND_SPACE_DEFAULTS: Partial<Record<BrandSpace["id"], BrandSpaceDefaults>> = {
  masteryatelier: {
    overview: {
      summary: "A craft-first product house for footwear, objects, and disciplined material expression.",
      focus: "Footwear / Product craft / Material discipline / Atelier systems",
      cadence: "Material studies, prototype reviews, construction notes, product story drafts",
      nextAction: "Convert the atelier direction into a tighter product system: silhouettes, materials, offer ladder, and launch priorities.",
      horizon: "System review: Apr 19",
    },
    brandCompass: {
      strategy: {
        purpose: "Build objects that make mastery visible through restraint, proportion, material honesty, and exacting construction.",
        coreBelief: "Mastery is shown through discipline, usefulness, detail, and the patience to refine.",
        positioning: "A modern atelier language for footwear, product craft, and object-led brand expression.",
        promise: "Elevated essentials and product concepts that feel considered, durable, and personally significant.",
        tension: "Create desire through craft and restraint without drifting into vague luxury language.",
        neverBecome: "A trend-led product label, a fake heritage brand, or an atelier aesthetic without real making behind it.",
      },
      visualLanguage: {
        photography: "Close material detail, silhouette, hand process, functional marks, fittings, and editorial stillness.",
        composition: "Structured product studies, tight detail crops, clear object-on-body moments, and calm sequencing.",
        colorMood: "Warm neutrals, amber notes, black, leather tones, workshop surfaces, and controlled contrast.",
        texture: "Leather, textile, sole, hardware, paper, label, packaging, stitching, tool marks, and worn-in surfaces.",
        lighting: "Controlled soft light with enough shadow to reveal material depth and construction.",
        references: ["Atelier records", "Footwear prototypes", "Material libraries", "Japanese craft ethos", "Product archives"],
        avoid: ["Artificial luxury", "Over-styling", "Vague product poetry", "Trend-chasing silhouettes", "Decorative craft cues without function"],
      },
      voice: {
        tone: "Precise, quiet, assured, tactile, and grounded in product reality.",
        sentenceStyle: "Short, material-aware sentences that name what is being made and why it matters.",
        wordsToUse: ["material", "construction", "fit", "proportion", "utility", "atelier", "object", "discipline"],
        wordsToAvoid: ["luxury vibes", "exclusive drop", "hype", "premium aesthetic", "must-have"],
        captionLogic: "Lead with the object, then explain material, construction, use, and the decision behind it.",
        ctaStyle: "Quiet and direct. Invite people into waitlists, inquiries, product notes, or prototype updates.",
        exampleLines: [
          "A material decision before it becomes a product decision.",
          "Built slowly so the object can hold its shape, use, and meaning.",
          "The atelier record starts with what the hand can verify.",
        ],
      },
      brandWorld: {
        emotionalTone: "Patient, exacting, tactile, restrained, and quietly confident.",
        culturalTerritory: "Footwear, craft objects, small-batch product, material study, workshop discipline, and everyday use.",
        recurringThemes: ["Material presence", "Prototype to object", "The final fitting", "Workshop discipline", "Utility and restraint"],
        coreTension: "The product must feel desirable without becoming decorative or detached from use.",
        feeling: "A quiet workshop where every surface, mark, and proportion has been considered.",
        whatMattersMost: "Make the product system concrete: silhouettes, materials, construction, offer ladder, and launch order.",
      },
    },
    contentSystem: {
      contentPillars: [
        {
          id: "mastery-pillar-material-study",
          order: 1,
          name: "Material Study",
          description: "Leather, textile, sole, hardware, label, packaging, and finish decisions explained with restraint.",
          tags: ["Materials", "Product"],
          color: "#F38B2A",
          active: true,
        },
        {
          id: "mastery-pillar-prototype-record",
          order: 2,
          name: "Prototype Record",
          description: "Development from silhouette to fitting, construction, testing, failure, refinement, and final direction.",
          tags: ["Prototype", "Process"],
          color: "#1D4DFF",
          active: true,
        },
        {
          id: "mastery-pillar-object-story",
          order: 3,
          name: "Object Story",
          description: "The finished product as an object with use, proportion, detail, and emotional presence.",
          tags: ["Product story", "Launch"],
          color: "#F2C94C",
          active: true,
        },
        {
          id: "mastery-pillar-atelier-notes",
          order: 4,
          name: "Atelier Notes",
          description: "Short notes on craft discipline, product decisions, references, standards, and what must be protected.",
          tags: ["Thinking", "Craft"],
          color: "#B7FF00",
          active: true,
        },
      ],
      contentSeries: [
        {
          id: "mastery-series-workbench",
          order: 1,
          name: "Workbench",
          title: "Workbench",
          description: "Material and construction studies from the table before they become launch assets.",
          relatedPillarIds: ["mastery-pillar-material-study", "mastery-pillar-prototype-record"],
          episodeStructure: "Material / decision / consequence / next test",
          productLogic: "Show product seriousness before selling the product.",
          active: true,
        },
        {
          id: "mastery-series-final-fitting",
          order: 2,
          name: "The Final Fitting",
          title: "The Final Fitting",
          description: "Fit, proportion, movement, and object-on-body studies for launch readiness.",
          relatedPillarIds: ["mastery-pillar-prototype-record", "mastery-pillar-object-story"],
          episodeStructure: "Fit note / silhouette / use case / refinement",
          productLogic: "Make wearability part of the product story.",
          active: true,
        },
      ],
      pillarRotation: [
        { postNumber: 1, pillarId: "mastery-pillar-material-study", format: "Detail Study", direction: "Material, hardware, sole, label, or packaging decision." },
        { postNumber: 2, pillarId: "mastery-pillar-prototype-record", format: "Carousel", direction: "Prototype sequence from test to refinement." },
        { postNumber: 3, pillarId: "mastery-pillar-object-story", format: "Single", direction: "Finished object or product story fragment." },
        { postNumber: 4, pillarId: "mastery-pillar-atelier-notes", format: "Note", direction: "Short atelier point of view." },
      ],
      contentRules: {
        productRole: "Product should be shown through material, construction, use, proportion, and the decisions behind it.",
        captionRules: "Use precise product language. Explain what changed, what was protected, and why the detail matters.",
        visualRules: "Prioritize detail, fit, surface, hand process, and quiet product presence.",
        postingRules: "Rotate material study, prototype record, object story, and atelier notes.",
        avoid: "Avoid hype language, fake scarcity, generic luxury cues, and over-styled product shots.",
      },
    },
    contentConcepts: [
      {
        id: "mastery-concept-material-board",
        brandId: "masteryatelier",
        title: "Material Board Pass",
        pillarId: "mastery-pillar-material-study",
        format: "Carousel",
        scene: "Workbench surface with leather, textile, sole, hardware, label, and packaging fragments.",
        visualDirection: "Soft directional light, tight crops, clean annotations, material-first sequencing.",
        productPlacement: "Materials appear before the finished product to show decision logic.",
        englishCaptionDraft: "A material board is not decoration. It is the first product argument.",
        notes: "Use as the first concrete atelier content sequence.",
        status: "Draft",
      },
    ],
    publishingCalendar: [
      {
        id: "mastery-post-material-board",
        brandId: "masteryatelier",
        date: "2026-04-15",
        title: "Material Board Pass",
        pillarId: "mastery-pillar-material-study",
        format: "Carousel",
        status: "Draft",
        contentConceptId: "mastery-concept-material-board",
        sceneBrief: "Material board with concise notes on texture, weight, and use.",
        visualDirection: "Editorial stillness, controlled soft light, close details.",
        workingNotes: "Connect the material decision to the first product family.",
      },
    ],
    actions: [
      {
        id: "mastery-action-product-families",
        brandId: "masteryatelier",
        title: "Define first three product families",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "masteryatelier",
        nextMove: "Choose the lead launch focus and map the minimum product page information.",
        dueDate: "2026-04-12",
      },
    ],
    thinking: [
      {
        id: "mastery-thinking-atelier-before-store",
        brandId: "masteryatelier",
        title: "Atelier before store",
        body: "Masteryatelier should feel like a real atelier before it feels like a store. Let material, proportion, and process create the premium feeling.",
        type: "Product",
        possibleUse: "Brand compass / product page language",
        status: "Useful",
      },
    ],
  },
  "mo-studio": {
    overview: {
      description: "Creative studio shaping brand worlds, products, and visual systems.",
      summary: "MO Studio shapes brands, objects, and visual worlds through strategy, design, and grounded execution.",
      focus: "Brand worlds / Product direction / Cultural intelligence / Grounded execution",
      cadence: "Project frames, case-study carousels, process intelligence, in-house proof, studio notes",
      nextAction: "Reframe MO Studio content around proof, process intelligence, in-house brand proof, craft detail, and cultural observation.",
      horizon: "Studio content system review: Apr 17",
    },
    brandCompass: {
      strategy: {
        purpose: "Build meaningful visual worlds, products, and brand expressions with depth, taste, and cultural intelligence.",
        coreBelief: "Good work is built from the ground up. Strategy, design, and making should stay connected.",
        positioning: "MO Studio is the umbrella universe and professional face for client work, in-house brands, and Massiveoutfit's broader authorship.",
        promise: "Shape brands, objects, and experiences through strategy, design, and execution rooted in substance rather than surface.",
        tension: "Create work with cultural sharpness and visual discipline without becoming loud, trend-led, or agency-hyped.",
        neverBecome: "A generic creative agency, a portfolio dump, a moodboard-driven studio with weak foundations, or a surface-taste brand machine.",
      },
      visualLanguage: {
        photography: "Editorial but not fashion-only; considered, tactile, refined, human, and grounded in real material presence.",
        composition: "Spacious layouts, intentional crops, clean sequencing, and a rhythm between close detail and wider context.",
        colorMood: "Clean but not sterile, modern with warmth, restrained, sharp, material-driven, and rich in subtle detail.",
        texture: "Packaging, finishes, prints, fittings, fabrication, prototypes, tools, shelves, materials, and object details should carry the world.",
        lighting: "Natural or controlled soft light, with occasional sculptural contrast. Avoid flashy commercial gloss unless the project requires it.",
        references: [
          "Design culture",
          "Fashion and street culture",
          "Japanese craft ethos",
          "Product design",
          "Editorial image-making",
          "Packaging and object-making",
          "Hospitality, retail, and branded environments",
          "Contemporary lifestyle culture",
        ],
        avoid: ["Over-styled images", "Synthetic polish", "Generic agency visuals", "Loud luxury cliches", "Chaotic art direction without clarity"],
      },
      voice: {
        tone: "Clear, intelligent, understated, authored, calm, precise, and never agency-salesy.",
        sentenceStyle: "Short to medium sentences with quiet authority. Explain the thinking without overselling.",
        wordsToUse: ["depth", "clarity", "grounded execution", "cultural intelligence", "craft", "discipline", "world-building"],
        wordsToAvoid: ["impactful", "disruptive", "game-changing", "elevated experiences", "premium vibes", "cutting edge"],
        captionLogic: "Each post should show what was understood, not only what was made: the real question, cultural context, tension, intent, response, and scope.",
        ctaStyle: "Minimal and confident. Let proof, process, and point of view create the invitation.",
        exampleLines: [
          "MO Studio builds brands, objects, and visual worlds with depth, restraint, and real cultural grounding.",
          "A studio's standards are often clearest in the work it makes for itself.",
          "Every client post should show not only what was made, but what was understood.",
        ],
      },
      brandWorld: {
        emotionalTone: "Trust, depth, calm authority, quiet confidence, curiosity, cultural sharpness, and considered ambition.",
        culturalTerritory: "Design culture, fashion and street culture, product design, Japanese craft ethos, editorial imagery, packaging, object-making, retail, hospitality, and contemporary lifestyle.",
        recurringThemes: [
          "Built from the ground up",
          "Authored, not advertised",
          "Substance over surface",
          "In-house brands as proof",
          "Depth, clarity, and lasting presence",
          "Craft, patience, and precision",
        ],
        coreTension: "The studio must attract prospects and prove capability while staying quiet, authored, and rooted in real making.",
        feeling: "A calm production room where taste, systems, cultural observation, and execution meet.",
        whatMattersMost: "Show that the studio has real taste, understands both ideas and execution, and can build from concept to object to world.",
      },
    },
    contentSystem: {
      contentPillars: [
        {
          id: "mo-pillar-client-proof",
          order: 1,
          name: "Client Proof",
          description: "Finished outcomes with strong framing: campaigns, packaging, identity systems, retail moments, activations, and case-study snapshots.",
          tags: ["35%", "Proof", "Case studies"],
          color: "#8A63D2",
          active: true,
        },
        {
          id: "mo-pillar-process-intelligence",
          order: 2,
          name: "Process Intelligence",
          description: "How the studio thinks: material selections, design rationale, moodboard fragments, typography decisions, packaging choices, and directional reasoning.",
          tags: ["20%", "Thinking", "Process"],
          color: "#1D4DFF",
          active: true,
        },
        {
          id: "mo-pillar-in-house-proof",
          order: 3,
          name: "In-House Proof",
          description: "AAI, Masteryatelier, and Biro as laboratories of taste, craft, authorship, product understanding, and long-term world-building.",
          tags: ["20%", "AAI", "Masteryatelier", "Biro"],
          color: "#B7FF00",
          active: true,
        },
        {
          id: "mo-pillar-craft-execution",
          order: 4,
          name: "Craft & Execution",
          description: "Objects, materials, finishes, fittings, textures, fabrication, print details, and evidence that the studio understands making.",
          tags: ["15%", "Materials", "Making"],
          color: "#F38B2A",
          active: true,
        },
        {
          id: "mo-pillar-cultural-observation",
          order: 5,
          name: "Cultural Observation",
          description: "What the studio notices: references, retail behavior, rituals, product culture, hospitality, printed matter, travel, objects, and environments.",
          tags: ["10%", "Culture", "References"],
          color: "#F2C94C",
          active: true,
        },
      ],
      contentSeries: [
        {
          id: "mo-series-project-frames",
          order: 1,
          name: "Project Frames",
          title: "Project Frames",
          description: "One strong image or short sequence from a client project with minimal, intelligent captioning.",
          relatedPillarIds: ["mo-pillar-client-proof"],
          episodeStructure: "Image or sequence / project context / decision / result",
          productLogic: "Show final work as proof without turning the account into a portfolio dump.",
          active: true,
        },
        {
          id: "mo-series-cultural-case-study",
          order: 2,
          name: "Cultural Case Study",
          title: "Cultural Case Study",
          description: "Problem, cultural context, tension, protected truth, intent, response, and scope.",
          relatedPillarIds: ["mo-pillar-client-proof", "mo-pillar-process-intelligence"],
          episodeStructure: "Real question / context / tension / intent / response / scope",
          productLogic: "Every client post should show not only what was made, but what was understood.",
          active: true,
        },
        {
          id: "mo-series-studio-notes",
          order: 3,
          name: "Studio Notes",
          title: "Studio Notes",
          description: "Concise observations on brand building, product culture, craft, retail, packaging, and what depth looks like in practice.",
          relatedPillarIds: ["mo-pillar-process-intelligence", "mo-pillar-cultural-observation"],
          episodeStructure: "Observation / implication / studio point of view",
          productLogic: "Make the studio feel like it has a worldview, not just services.",
          active: true,
        },
        {
          id: "mo-series-in-house-proof",
          order: 4,
          name: "In-House Proof",
          title: "In-House Proof",
          description: "Posts connecting AAI, Masteryatelier, and Biro back to the studio philosophy.",
          relatedPillarIds: ["mo-pillar-in-house-proof", "mo-pillar-craft-execution"],
          episodeStructure: "Brand fragment / studio standard / proof of authorship",
          productLogic: "Use internal brands as evidence that the studio's standards are lived, not theoretical.",
          active: true,
        },
        {
          id: "mo-series-world-fragments",
          order: 5,
          name: "World Fragments",
          title: "World Fragments",
          description: "References, objects, tools, shelves, fittings, travel, printed matter, prototypes, and cultural observations.",
          relatedPillarIds: ["mo-pillar-cultural-observation", "mo-pillar-craft-execution"],
          episodeStructure: "Fragment / why it matters / connection to studio eye",
          productLogic: "Make the studio feel alive and culturally aware.",
          active: true,
        },
      ],
      pillarRotation: [
        { postNumber: 1, pillarId: "mo-pillar-client-proof", format: "Carousel", direction: "Finished project frame or case-study snapshot." },
        { postNumber: 2, pillarId: "mo-pillar-process-intelligence", format: "Single", direction: "Design rationale, material decision, or directional note." },
        { postNumber: 3, pillarId: "mo-pillar-in-house-proof", format: "Carousel", direction: "AAI, Masteryatelier, or Biro as proof of studio standards." },
        { postNumber: 4, pillarId: "mo-pillar-craft-execution", format: "Detail Study", direction: "Material, finish, packaging, fitting, fabrication, or object detail." },
        { postNumber: 5, pillarId: "mo-pillar-cultural-observation", format: "Studio Note", direction: "Reference, retail observation, product culture note, or world fragment." },
      ],
      contentRules: {
        productRole: "In-house brands should appear as proof of long-term thinking, product understanding, authorship, and lived standards.",
        captionRules: "Captions should explain the real question, cultural context, tension, intent, response, and scope without sounding like marketing.",
        visualRules: "Use spacious layouts, intentional crops, tactile detail, soft or natural light, and clean sequencing between detail and context.",
        postingRules: "Maintain the rough ratio: 35% client proof, 20% process thinking, 20% in-house proof, 15% craft detail, 10% cultural/studio world.",
        avoid: "Avoid loud agency hype, portfolio dumping, surface taste, generic buzzwords, over-designed premium cues, and content detached from real making.",
      },
    },
    contentConcepts: [
      {
        id: "mo-concept-cultural-case-study",
        brandId: "mo-studio",
        title: "Cultural Case Study Frame",
        seriesId: "mo-series-cultural-case-study",
        pillarId: "mo-pillar-client-proof",
        format: "Carousel",
        scene: "A client project presented as real question, cultural context, tension, protected truth, intent, response, and scope.",
        visualDirection: "Publication artifact feel, strong project image, restrained typography, no quote-post energy.",
        englishCaptionDraft: "Every client post should show not only what was made, but what was understood.",
        notes: "Use the Cultural Case Study Template as the operating structure.",
        status: "Draft",
      },
      {
        id: "mo-concept-in-house-proof",
        brandId: "mo-studio",
        title: "In-House Brands as Proof",
        seriesId: "mo-series-in-house-proof",
        pillarId: "mo-pillar-in-house-proof",
        format: "Carousel",
        scene: "AAI, Masteryatelier, or Biro shown as proof of studio standards and internal authorship.",
        visualDirection: "Connect product detail or brand world fragment back to the studio point of view.",
        englishCaptionDraft: "A studio's standards are often clearest in the work it makes for itself.",
        notes: "Do not mix brands randomly. Frame them as laboratories of taste, craft, and world-building.",
        status: "Idea",
      },
    ],
    publishingCalendar: [
      {
        id: "mo-post-positioning",
        brandId: "mo-studio",
        date: "2026-04-14",
        title: "MO Studio Lean Positioning",
        pillarId: "mo-pillar-process-intelligence",
        format: "Single",
        status: "Draft",
        sceneBrief: "Profile or studio note post stating the lean positioning.",
        visualDirection: "Typographic studio note with one strong project/world fragment.",
        englishCaption: "MO Studio builds brands, objects, and visual worlds with depth, restraint, and real cultural grounding.",
        workingNotes: "Use as the new top-line statement for the account.",
      },
      {
        id: "mo-post-case-study",
        brandId: "mo-studio",
        date: "2026-04-17",
        title: "First Cultural Case Study",
        pillarId: "mo-pillar-client-proof",
        format: "Carousel",
        status: "Draft",
        contentConceptId: "mo-concept-cultural-case-study",
        sceneBrief: "Problem, cultural context, tension, protected truth, intent, response, scope.",
        visualDirection: "Editorial case-study carousel with project visuals and quiet labels.",
        workingNotes: "Pick one completed or strongest available project.",
      },
    ],
    actions: [
      {
        id: "mo-action-sort-pillars",
        brandId: "mo-studio",
        title: "Sort MO Studio assets into five content pillars",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "mo-studio",
        nextMove: "Group available visuals into client proof, process intelligence, in-house proof, craft detail, and cultural observation.",
        dueDate: "2026-04-11",
      },
      {
        id: "mo-action-case-study",
        brandId: "mo-studio",
        title: "Build first cultural case-study carousel",
        status: "Next",
        linkedItemType: "Content Concept",
        linkedItemId: "mo-concept-cultural-case-study",
        nextMove: "Choose project and write the real question, tension, protected truth, intent, response, and scope.",
        dueDate: "2026-04-17",
      },
    ],
    thinking: [
      {
        id: "mo-thinking-authored",
        brandId: "mo-studio",
        title: "Authored, not advertised",
        body: "MO Studio should feel authored, not advertised. The work should carry quiet confidence instead of loud self-promotion.",
        type: "Strategy",
        possibleUse: "Brand compass / profile copy / studio notes",
        status: "Useful",
      },
      {
        id: "mo-thinking-understood",
        brandId: "mo-studio",
        title: "What was understood",
        body: "Every client post should show not only what was made, but what was understood: cultural context, tension, protected truth, intent, and response.",
        type: "Caption",
        possibleUse: "Case-study caption logic",
        status: "Useful",
      },
    ],
  },
  personal: {
    overview: {
      summary: "Kage's personal command layer for identity, visibility, learning, energy, and long-range direction.",
      focus: "Personal brand / Creative identity / Rhythm / Reflection / Public thought",
      cadence: "Weekly resets, idea capture, public notes, reading synthesis, energy reviews",
      nextAction: "Turn the personal brand into a repeatable rhythm: clear pillars, capture habits, publishing lanes, and review blocks.",
      horizon: "Weekly reset: Apr 12",
    },
    brandCompass: {
      strategy: {
        purpose: "Build a public and private operating system that helps Kage think clearly, create consistently, and move with intention.",
        coreBelief: "The personal brand should make the larger brand universe easier to trust, not compete with it.",
        positioning: "The human signal behind AAI, Masteryatelier, MO Studio, Biro, and the command center itself.",
        promise: "Show the thinking behind the work through honest process, taste, discipline, growth, and useful reflection.",
        tension: "Be public enough to build trust without turning the private operating system into a performance surface.",
        neverBecome: "Generic creator advice, vague motivation, over-polished guru language, or tracking for the sake of tracking.",
      },
      visualLanguage: {
        photography: "Real workspace cues, desk notes, references, calendar blocks, walking observations, and honest progress moments.",
        composition: "Simple frames, sharp notes, clear hierarchy, and quiet personal documentation.",
        colorMood: "Near-black, lime signal, paper whites, muted reference tones, and practical dashboard clarity.",
        texture: "Notebook pages, screenshots, highlighted references, books, fabric, product fragments, and daily system traces.",
        lighting: "Natural, available, and unforced. It should feel lived-in but still intentional.",
        references: ["Build logs", "Weekly reviews", "Reading notes", "Taste references", "Personal operating systems"],
        avoid: ["Guru visuals", "Fake vulnerability", "Motivation-post design", "Overly polished productivity content"],
      },
      voice: {
        tone: "Warm, direct, grounded, reflective, and specific.",
        sentenceStyle: "Clear first-person notes that connect decisions, lessons, and lived process.",
        wordsToUse: ["decision", "rhythm", "energy", "clarity", "building", "taste", "reflection"],
        wordsToAvoid: ["grindset", "hack", "guru", "manifest", "dominate"],
        captionLogic: "Tie personal reflections to a real project, decision, lesson, or operating rhythm.",
        ctaStyle: "Usually no hard CTA. Invite conversation or mark the thought for future use.",
        exampleLines: [
          "The system is only useful if it lowers friction.",
          "The strongest personal content is often a decision record.",
          "Energy and recovery are operating inputs, not side notes.",
        ],
      },
      brandWorld: {
        emotionalTone: "Clear, intimate, calm, ambitious, honest, and self-directed.",
        culturalTerritory: "Creative identity, personal systems, taste, learning, brand-building, reading, recovery, and public thought.",
        recurringThemes: ["Weekly reset", "Build log", "Taste notes", "Decision record", "Energy check", "Lessons in public"],
        coreTension: "Building multiple worlds requires visibility and discipline, but the inner rhythm must stay real.",
        feeling: "A personal cockpit for becoming sharper, healthier, and more intentional over time.",
        whatMattersMost: "Capture, sort, decide, publish, review. Keep the system light enough to actually use.",
      },
    },
    contentSystem: {
      contentPillars: [
        {
          id: "personal-pillar-build-log",
          order: 1,
          name: "Build Log",
          description: "What is being built across the brands, what decision was made, and what changed because of it.",
          tags: ["Projects", "Process"],
          color: "#B7FF00",
          active: true,
        },
        {
          id: "personal-pillar-reflection",
          order: 2,
          name: "Reflection",
          description: "Weekly resets, energy, recovery, direction, commitments, and honest notes from the private operating system.",
          tags: ["Weekly reset", "Energy"],
          color: "#F2C94C",
          active: true,
        },
        {
          id: "personal-pillar-taste-notes",
          order: 3,
          name: "Taste Notes",
          description: "References, objects, systems, products, images, and ideas that sharpen the point of view.",
          tags: ["References", "Taste"],
          color: "#8CE6FF",
          active: true,
        },
        {
          id: "personal-pillar-lessons",
          order: 4,
          name: "Lessons in Public",
          description: "Useful lessons from building, editing, launching, organizing, and making decisions.",
          tags: ["Learning", "Public thought"],
          color: "#1D4DFF",
          active: true,
        },
      ],
      contentSeries: [
        {
          id: "personal-series-weekly-reset",
          order: 1,
          name: "Weekly Reset",
          title: "Weekly Reset",
          description: "A recurring review of priorities, calendar, energy, open loops, and brand commitments.",
          relatedPillarIds: ["personal-pillar-reflection"],
          episodeStructure: "What mattered / what moved / what needs attention / next rhythm",
          productLogic: "Keep private planning connected to public clarity.",
          active: true,
        },
        {
          id: "personal-series-decision-record",
          order: 2,
          name: "Decision Record",
          title: "Decision Record",
          description: "Short public notes explaining decisions made while building the brand ecosystem.",
          relatedPillarIds: ["personal-pillar-build-log", "personal-pillar-lessons"],
          episodeStructure: "Decision / why / tradeoff / next move",
          productLogic: "Make thinking visible without over-explaining.",
          active: true,
        },
      ],
      pillarRotation: [
        { postNumber: 1, pillarId: "personal-pillar-build-log", format: "Post", direction: "A real decision or project movement." },
        { postNumber: 2, pillarId: "personal-pillar-reflection", format: "Note", direction: "Weekly reset or energy observation." },
        { postNumber: 3, pillarId: "personal-pillar-taste-notes", format: "Carousel", direction: "Reference and why it matters." },
        { postNumber: 4, pillarId: "personal-pillar-lessons", format: "Post", direction: "Lesson from execution." },
      ],
      contentRules: {
        productRole: "Personal content supports trust in the broader brand ecosystem.",
        captionRules: "Be specific, grounded, and tied to a real decision, project, or rhythm.",
        visualRules: "Use real notes, references, system views, and simple frames.",
        postingRules: "Rotate build log, reflection, taste note, and lesson.",
        avoid: "Avoid guru tone, generic motivation, and private tracking that becomes performance.",
      },
    },
    contentConcepts: [
      {
        id: "personal-concept-weekly-reset",
        brandId: "personal",
        title: "Weekly Reset Note",
        seriesId: "personal-series-weekly-reset",
        pillarId: "personal-pillar-reflection",
        format: "Post",
        scene: "A concise note from the weekly reset.",
        visualDirection: "Simple dashboard or notebook frame with one clear thought.",
        englishCaptionDraft: "The system is only useful if it lowers friction.",
        notes: "Use private notes only when they have a clear public lesson.",
        status: "Draft",
      },
    ],
    publishingCalendar: [
      {
        id: "personal-post-weekly-reset",
        brandId: "personal",
        date: "2026-04-12",
        title: "Weekly Reset Note",
        pillarId: "personal-pillar-reflection",
        format: "Post",
        status: "Draft",
        contentConceptId: "personal-concept-weekly-reset",
        sceneBrief: "One useful observation from reset.",
        visualDirection: "Quiet note or dashboard crop.",
        workingNotes: "Keep it specific and non-performative.",
      },
    ],
    actions: [
      {
        id: "personal-action-pillars",
        brandId: "personal",
        title: "Define 4 personal content pillars",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Map each pillar to repeatable post formats and capture windows.",
        dueDate: "2026-04-14",
      },
    ],
    thinking: [
      {
        id: "personal-thinking-decision-record",
        brandId: "personal",
        title: "Personal content as decision record",
        body: "The strongest personal content will likely come from decisions made while building the brands.",
        type: "Strategy",
        possibleUse: "Content pillar / caption logic",
        status: "Useful",
      },
    ],
  },
  biro: {
    overview: {
      summary: "A quiet workspace for writing, prompts, fragments, and early-stage idea development.",
      focus: "Writing / Concepts / Prompt systems / Exploratory thinking",
      cadence: "Prompt drafts, short notes, concept mapping, story seeds, and reusable writing structures",
      nextAction: "Shape the first recurring prompt system and connect strong writing seeds to content concepts.",
      horizon: "Seed review: Apr 20",
    },
    brandCompass: {
      strategy: {
        purpose: "Create a lightweight writing and prompt workspace where early ideas can become sharper concepts.",
        coreBelief: "Unfinished thinking needs structure, but not so much structure that it stops moving.",
        positioning: "Biro is the idea desk: a quieter companion space for writing, prompts, fragments, and exploratory concept development.",
        promise: "Turn raw observations and prompts into clearer directions for notes, captions, stories, and future projects.",
        tension: "Keep the space open enough for experiments without letting it become vague or chaotic.",
        neverBecome: "A messy dumping ground, a formal brand system too early, or a prompt archive with no synthesis.",
      },
      visualLanguage: {
        photography: "Minimal desk fragments, notes, text studies, prompt structures, references, and quiet workspace cues.",
        composition: "Sparse, readable, text-forward, and organized around fragments that can be revisited.",
        colorMood: "Near-black, cyan signal, paper white, muted reference tones, and low visual noise.",
        texture: "Paper, type, cursor states, annotations, note cards, books, screenshots, and draft marks.",
        lighting: "Soft, quiet, and functional. Avoid drama unless the writing concept asks for it.",
        references: ["Writing desks", "Prompt libraries", "Concept maps", "Field notes", "Editorial fragments"],
        avoid: ["Overbuilt brand polish", "Prompt clutter", "Long vague entries", "Decorative writing aesthetics"],
      },
      voice: {
        tone: "Curious, restrained, intelligent, brief, and exploratory.",
        sentenceStyle: "Fragments are allowed, but each note should point toward a usable direction.",
        wordsToUse: ["seed", "fragment", "prompt", "direction", "observation", "structure", "draft"],
        wordsToAvoid: ["content hack", "viral", "formula", "guru prompt", "ultimate"],
        captionLogic: "Start with the observation or prompt, then name the direction it could become.",
        ctaStyle: "Soft and internal: revisit, develop, test, connect, or archive.",
        exampleLines: [
          "A prompt is useful only when it points somewhere.",
          "Keep the fragment open, but give it a direction.",
          "Notes sharpen when they are connected to use.",
        ],
      },
      brandWorld: {
        emotionalTone: "Quiet, curious, minimal, unfinished, and intelligent.",
        culturalTerritory: "Writing, prompts, narrative fragments, concept development, notes, observations, and early editorial thinking.",
        recurringThemes: ["Prompt-led writing", "Concept seeds", "Fragments worth revisiting", "Observation to structure", "Draft logic"],
        coreTension: "The workspace should protect unfinished thinking while still helping strong ideas become usable.",
        feeling: "A quiet idea desk where raw fragments can be sorted into stronger directions.",
        whatMattersMost: "Prompts should feed notes, and notes should sharpen prompts.",
      },
    },
    contentSystem: {
      contentPillars: [
        {
          id: "biro-pillar-prompt-seeds",
          order: 1,
          name: "Prompt Seeds",
          description: "Reusable prompts that open useful writing directions instead of producing generic output.",
          tags: ["Prompts", "Writing"],
          color: "#8CE6FF",
          active: true,
        },
        {
          id: "biro-pillar-concept-fragments",
          order: 2,
          name: "Concept Fragments",
          description: "Short observations, narrative pieces, and idea fragments worth developing later.",
          tags: ["Fragments", "Ideas"],
          color: "#F2C94C",
          active: true,
        },
        {
          id: "biro-pillar-structure-tests",
          order: 3,
          name: "Structure Tests",
          description: "Early formats for captions, essays, prompts, stories, and longer-form pieces.",
          tags: ["Structure", "Drafts"],
          color: "#B7FF00",
          active: true,
        },
      ],
      contentSeries: [
        {
          id: "biro-series-prompt-review",
          order: 1,
          name: "Prompt Review",
          title: "Prompt Review",
          description: "Recurring review of prompts that produced useful directions.",
          relatedPillarIds: ["biro-pillar-prompt-seeds"],
          episodeStructure: "Prompt / output direction / useful next step",
          productLogic: "Keep only prompts that sharpen thinking.",
          active: true,
        },
        {
          id: "biro-series-fragment-map",
          order: 2,
          name: "Fragment Map",
          title: "Fragment Map",
          description: "Group raw fragments into stronger directions and future writing uses.",
          relatedPillarIds: ["biro-pillar-concept-fragments", "biro-pillar-structure-tests"],
          episodeStructure: "Fragment / theme / possible use / next draft",
          productLogic: "Prevent ideas from staying scattered.",
          active: true,
        },
      ],
      pillarRotation: [
        { postNumber: 1, pillarId: "biro-pillar-prompt-seeds", format: "Prompt", direction: "Prompt worth testing again." },
        { postNumber: 2, pillarId: "biro-pillar-concept-fragments", format: "Note", direction: "Short idea fragment with possible use." },
        { postNumber: 3, pillarId: "biro-pillar-structure-tests", format: "Draft", direction: "Format test for longer writing." },
      ],
      contentRules: {
        productRole: "Biro supports thinking and writing development across the ecosystem.",
        captionRules: "Keep entries short, directional, and easy to revisit.",
        visualRules: "Use minimal text-forward frames, notes, and quiet reference material.",
        postingRules: "Rotate prompt seeds, concept fragments, and structure tests.",
        avoid: "Avoid prompt clutter, vague idea dumps, and over-polished brand language too early.",
      },
    },
    contentConcepts: [
      {
        id: "biro-concept-prompt-review",
        brandId: "biro",
        title: "Prompt Review",
        seriesId: "biro-series-prompt-review",
        pillarId: "biro-pillar-prompt-seeds",
        format: "Note",
        scene: "One prompt and the direction it opened.",
        visualDirection: "Minimal text card or note capture.",
        englishCaptionDraft: "A prompt is useful only when it points somewhere.",
        notes: "Use to identify prompts worth repeating.",
        status: "Idea",
      },
    ],
    publishingCalendar: [
      {
        id: "biro-post-prompt-review",
        brandId: "biro",
        date: "2026-04-20",
        title: "Prompt Review",
        pillarId: "biro-pillar-prompt-seeds",
        format: "Note",
        status: "Draft",
        contentConceptId: "biro-concept-prompt-review",
        sceneBrief: "One reusable prompt and why it worked.",
        visualDirection: "Quiet text-forward note.",
        workingNotes: "Connect to active writing seeds.",
      },
    ],
    actions: [
      {
        id: "biro-action-group-seeds",
        brandId: "biro",
        title: "Group writing seeds into three directions",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "biro",
        nextMove: "Sort current fragments by theme and possible use.",
        dueDate: "2026-04-20",
      },
    ],
    thinking: [
      {
        id: "biro-thinking-open-but-not-vague",
        brandId: "biro",
        title: "Open but not vague",
        body: "Keep the space open enough for experiments, but not vague. Prompts should feed notes, and notes should sharpen prompts.",
        type: "Strategy",
        possibleUse: "Workspace rule",
        status: "Useful",
      },
    ],
  },
};

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function hasList<T>(value?: T[] | null) {
  return Array.isArray(value) && value.length > 0;
}

function hasRules(value?: BrandContentSystem["contentRules"]) {
  return Array.isArray(value)
    ? value.length > 0
    : Boolean(value && Object.values(value).some((entry) => hasText(entry)));
}

function hasObjectValues<T extends object>(value?: T) {
  return Boolean(
    value &&
      Object.values(value as Record<string, unknown>).some((entry) => {
        if (Array.isArray(entry)) {
          return entry.length > 0;
        }
        if (typeof entry === "string") {
          return hasText(entry);
        }
        return Boolean(entry);
      }),
  );
}

function mergeTextObject<T extends object>(defaults?: T, existing?: T): T | undefined {
  if (!defaults && !existing) {
    return undefined;
  }

  const next = { ...(defaults ?? {}) } as T;

  Object.entries((existing ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value) ? value.length > 0 : typeof value === "string" ? hasText(value) : Boolean(value)) {
      (next as Record<string, unknown>)[key] = value;
    }
  });

  return next;
}

function mergeCompass(defaults?: BrandCompass, existing?: BrandCompass): BrandCompass | undefined {
  if (!defaults && !existing) {
    return undefined;
  }

  return {
    strategy: mergeTextObject(defaults?.strategy, existing?.strategy),
    visualLanguage: mergeTextObject(defaults?.visualLanguage, existing?.visualLanguage),
    voice: mergeTextObject(defaults?.voice, existing?.voice),
    brandWorld: mergeTextObject(defaults?.brandWorld, existing?.brandWorld),
  };
}

function mergeContentSystem(defaults?: BrandContentSystem, existing?: BrandContentSystem): BrandContentSystem {
  return {
    ...existing,
    contentPillars: hasList(existing?.contentPillars) ? existing?.contentPillars : defaults?.contentPillars ?? [],
    contentSeries: hasList(existing?.contentSeries) ? existing?.contentSeries : defaults?.contentSeries ?? [],
    pillarRotation: hasList(existing?.pillarRotation) ? existing?.pillarRotation : defaults?.pillarRotation ?? [],
    contentRules: hasRules(existing?.contentRules) ? existing?.contentRules : defaults?.contentRules ?? [],
  };
}

function resolveOverviewValue(
  id: BrandSpace["id"],
  key: keyof NonNullable<BrandSpaceDefaults["overview"]>,
  current: string,
  fallback?: string,
) {
  const legacyValues = LEGACY_OVERVIEW_VALUES[id]?.[key] ?? [];
  return !hasText(current) || legacyValues.includes(current) ? fallback ?? current : current;
}

export function normalizeBrandSpaceExtensions(brandSpace: BrandSpace): BrandSpace {
  const defaults = BRAND_SPACE_DEFAULTS[brandSpace.id];
  const existingContentSystem = brandSpace.contentSystem ?? {};
  const existingPillars = existingContentSystem.contentPillars ?? [];
  const shouldSeedAaiPillars = brandSpace.id === "aai" && existingPillars.length === 0;

  return {
    ...brandSpace,
    description: resolveOverviewValue(brandSpace.id, "description", brandSpace.description, defaults?.overview?.description),
    summary: resolveOverviewValue(brandSpace.id, "summary", brandSpace.summary, defaults?.overview?.summary),
    focus: resolveOverviewValue(brandSpace.id, "focus", brandSpace.focus, defaults?.overview?.focus),
    cadence: resolveOverviewValue(brandSpace.id, "cadence", brandSpace.cadence, defaults?.overview?.cadence),
    nextAction: resolveOverviewValue(brandSpace.id, "nextAction", brandSpace.nextAction, defaults?.overview?.nextAction),
    horizon: resolveOverviewValue(brandSpace.id, "horizon", brandSpace.horizon, defaults?.overview?.horizon),
    brandCompass: mergeCompass(defaults?.brandCompass, brandSpace.brandCompass),
    contentSystem: shouldSeedAaiPillars
      ? {
          ...existingContentSystem,
          contentPillars: AAI_CONTENT_PILLARS,
          contentSeries: existingContentSystem.contentSeries ?? [],
          pillarRotation: existingContentSystem.pillarRotation ?? [],
          contentRules: existingContentSystem.contentRules ?? [],
        }
      : mergeContentSystem(defaults?.contentSystem, existingContentSystem),
    contentConcepts: hasList(brandSpace.contentConcepts) ? brandSpace.contentConcepts : defaults?.contentConcepts ?? [],
    publishingCalendar: hasList(brandSpace.publishingCalendar) ? brandSpace.publishingCalendar : defaults?.publishingCalendar ?? [],
    actions: hasList(brandSpace.actions) ? brandSpace.actions : defaults?.actions ?? [],
    thinking: hasList(brandSpace.thinking) ? brandSpace.thinking : defaults?.thinking ?? [],
    notes: brandSpace.notes ?? [],
    tasks: brandSpace.tasks ?? [],
    contentPlan: brandSpace.contentPlan ?? [],
    calendar: brandSpace.calendar ?? [],
  };
}

export function getBrandSpaceExtensionDefaults(id: BrandSpace["id"]) {
  return BRAND_SPACE_DEFAULTS[id];
}

export function applyBrandSpaceExtensionDefaults(brandSpace: BrandSpace): BrandSpace {
  const normalized = normalizeBrandSpaceExtensions(brandSpace);
  const defaults = BRAND_SPACE_DEFAULTS[brandSpace.id];

  if (!defaults) {
    return normalized;
  }

  return {
    ...normalized,
    description: defaults.overview?.description ?? normalized.description,
    summary: defaults.overview?.summary ?? normalized.summary,
    focus: defaults.overview?.focus ?? normalized.focus,
    cadence: defaults.overview?.cadence ?? normalized.cadence,
    nextAction: defaults.overview?.nextAction ?? normalized.nextAction,
    horizon: defaults.overview?.horizon ?? normalized.horizon,
    brandCompass: mergeCompass(defaults.brandCompass, brandSpace.brandCompass),
    contentSystem: mergeContentSystem(defaults.contentSystem, brandSpace.contentSystem),
    contentConcepts: hasList(brandSpace.contentConcepts) ? brandSpace.contentConcepts : defaults.contentConcepts ?? [],
    publishingCalendar: hasList(brandSpace.publishingCalendar) ? brandSpace.publishingCalendar : defaults.publishingCalendar ?? [],
    actions: hasList(brandSpace.actions) ? brandSpace.actions : defaults.actions ?? [],
    thinking: hasList(brandSpace.thinking) ? brandSpace.thinking : defaults.thinking ?? [],
  };
}

export function applyBrandSpacesExtensionDefaults(brandSpaces: BrandSpace[]) {
  return brandSpaces.map(applyBrandSpaceExtensionDefaults);
}

export function normalizeBrandSpacesExtensions(brandSpaces: BrandSpace[]) {
  return brandSpaces.map(normalizeBrandSpaceExtensions);
}
