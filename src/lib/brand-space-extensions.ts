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
import { moStudioBrandSpaceDefaults } from "@/lib/mo-studio-defaults";

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
    summary: [
      "A private command layer for goals, notes, reading, and reflective planning.",
      "Kage's personal command layer for identity, visibility, learning, energy, and long-range direction.",
    ],
    focus: ["Rhythm / Health / Reflection", "Personal brand / Creative identity / Rhythm / Reflection / Public thought"],
    cadence: ["Weekly reviews, note capture, reading and idea synthesis"],
    nextAction: [
      "Prepare the next weekly reset and roll active notes into the calendar.",
      "Turn the personal brand into a repeatable rhythm: clear pillars, capture habits, publishing lanes, and review blocks.",
    ],
    horizon: ["Reset: Apr 12"],
  },
};

const PERSONAL_LEGACY_BRAND_COMPASS: BrandCompass = {
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
};

const PERSONAL_LEGACY_CONTENT_SYSTEM_IDS = {
  pillars: ["personal-pillar-build-log", "personal-pillar-reflection", "personal-pillar-taste-notes", "personal-pillar-lessons"],
  series: ["personal-series-weekly-reset"],
};

const PERSONAL_LEGACY_RECORD_IDS = {
  contentConcepts: ["personal-concept-weekly-reset"],
  publishingCalendar: ["personal-post-weekly-reset"],
  actions: ["personal-action-pillars"],
  thinking: ["personal-thinking-decision-record"],
};

const BRAND_SPACE_DEFAULTS: Partial<Record<BrandSpace["id"], BrandSpaceDefaults>> = {
  aai: {
    overview: {
      description: "Intentional contemporary clothing brand.",
      summary: "Clarity, restraint, and self-direction translated into a living brand system.",
      focus: "Uniform / Craft detail / Urban stillness / Self-direction",
      cadence: "Editorial stills, quiet movement clips, product detail studies, and perspective-led captions",
      nextAction: "Lock the next AAI content pass around intent, observation, continuity, and the individual.",
      horizon: "Next review: May 4",
    },
    brandCompass: {
      strategy: {
        purpose: "Encourage greater clarity, intention, and self-direction through clothing, image, and daily presence.",
        coreBelief: "What you wear is a decision before it becomes a signal. Style should clarify the individual, not erase them.",
        positioning: "A restrained contemporary clothing brand for thoughtful individuals who choose quiet confidence over algorithmic sameness.",
        promise: "A calmer, more intentional expression of self through uniform thinking, material presence, and editorial restraint.",
        tension: "Stay emotionally human and culturally sharp without becoming trend-led, cold, or over-explained.",
        neverBecome: "A generic minimalist label, a hype cycle brand, or a fashion account that performs depth without lived identity.",
      },
      visualLanguage: {
        photography: "Editorial stillness, natural posture, product on body, city solitude, close material detail, and quiet movement.",
        composition: "Disciplined frames with negative space, cropped gestures, uniform repetition, and calm product sequencing.",
        colorMood: "Near-black, white, electric blue restraint, soft urban neutrals, denim, concrete, skin, and controlled daylight.",
        texture: "Cotton, denim, wool, folds, seams, worn surfaces, city walls, paper, shadow, and lived-in material detail.",
        lighting: "Soft daylight, muted shadow, late afternoon city light, and clean studio light that keeps the product honest.",
        references: ["Uniform in motion", "Quiet city", "Material presence", "People With Intent", "Anti-trend style documentation"],
        avoid: ["Over-styling", "Loud trend language", "Artificial luxury", "Generic fashion captions", "Cold minimalism without feeling"],
      },
      voice: {
        tone: "Understated, human, emotionally intelligent, precise, and quietly assertive.",
        sentenceStyle: "Short, reflective lines that feel observed rather than marketed.",
        wordsToUse: ["intent", "individual", "presence", "uniform", "clarity", "continuity", "material", "decision"],
        wordsToAvoid: ["must-have", "drop", "viral", "elevated basics", "quiet luxury", "fit check"],
        captionLogic: "Start from the decision or observation, then connect the garment to self-direction, material, or lived routine.",
        ctaStyle: "Soft and direct. Invite people to observe, choose, save, wear, revisit, or enter the world.",
        exampleLines: [
          "A uniform is not repetition. It is a decision you keep returning to.",
          "The garment is quiet so the individual can become clearer.",
          "Not styled for attention. Worn with intent.",
        ],
      },
      brandWorld: {
        emotionalTone: "Calm, observant, independent, restrained, and quietly confident.",
        culturalTerritory: "Daily rituals, city solitude, uniform dressing, anti-trend continuity, human presence, and intentional identity.",
        recurringThemes: ["Uniform in Motion", "The Quiet City", "Material Presence", "People With Intent", "Continuity over trend"],
        coreTension: "Build desire without noise, and make restraint feel alive rather than empty.",
        feeling: "A quiet city morning where clothing, posture, and attention move with intention.",
        whatMattersMost: "AAI should make the individual feel clearer, not consumed by the brand.",
      },
    },
    contentSystem: {
      contentPillars: AAI_CONTENT_PILLARS,
      contentSeries: [
        {
          id: "aai-series-uniform-in-motion",
          order: 1,
          name: "Uniform in Motion",
          title: "Uniform in Motion",
          description: "Quiet movement clips and stills showing how the garment lives on the body through routine, pace, and posture.",
          relatedPillarIds: ["aai-content-pillar-intent", "aai-content-pillar-continuity"],
          episodeStructure: "Decision / movement / product detail / closing line",
          productLogic: "Let the product appear as part of a lived rhythm, not a standalone sales object.",
          active: true,
        },
        {
          id: "aai-series-people-with-intent",
          order: 2,
          name: "People With Intent",
          title: "People With Intent",
          description: "Profiles and observations about individuals who move with clarity against algorithmic sameness.",
          relatedPillarIds: ["aai-content-pillar-observation", "aai-content-pillar-individual"],
          episodeStructure: "Person / detail noticed / internal decision / AAI lens",
          productLogic: "Make the human signal stronger than the styling signal.",
          active: true,
        },
        {
          id: "aai-series-material-presence",
          order: 3,
          name: "Material Presence",
          title: "Material Presence",
          description: "Product detail studies that connect fabric, proportion, and construction to a calmer way of dressing.",
          relatedPillarIds: ["aai-content-pillar-intent", "aai-content-pillar-observation"],
          episodeStructure: "Material / close detail / use / feeling",
          productLogic: "Use detail to prove restraint, not to over-explain.",
          active: true,
        },
      ],
      pillarRotation: [
        { postNumber: 1, pillarId: "aai-content-pillar-intent", format: "Single", direction: "Decision-led still or caption about dressing with intent." },
        { postNumber: 2, pillarId: "aai-content-pillar-observation", format: "Reel", direction: "Quiet movement or People With Intent observation." },
        { postNumber: 3, pillarId: "aai-content-pillar-continuity", format: "Carousel", direction: "Repeat wear, same garment, or anti-trend continuity sequence." },
        { postNumber: 4, pillarId: "aai-content-pillar-individual", format: "Note", direction: "Short AAI vs AI / self-direction point of view." },
      ],
      contentRules: {
        productRole: "Product should support the individual and the decision behind the outfit. It should never feel pasted into the scene.",
        captionRules: "Keep captions precise, reflective, and human. One clear thought is stronger than a slogan.",
        visualRules: "Use restraint, space, texture, posture, and quiet city context. Let movement and material carry the mood.",
        postingRules: "Rotate intent, observation, continuity, and the individual so the feed does not become only product or only philosophy.",
        avoid: "Avoid over-styled fashion language, hype mechanics, generic minimalism, and captions that sound like AI-generated aspiration.",
      },
    },
    contentConcepts: [
      {
        id: "aai-concept-uniform-decision",
        brandId: "aai",
        title: "The Uniform Decision",
        seriesId: "aai-series-uniform-in-motion",
        episodeNumber: 1,
        pillarId: "aai-content-pillar-intent",
        format: "Reel",
        scene: "A quiet morning sequence: jacket on chair, hand detail, walking out, city threshold.",
        visualDirection: "Soft daylight, restrained crops, no performance energy, product visible through movement.",
        productPlacement: "Garment appears as part of the routine before the caption names the decision.",
        englishCaptionDraft: "A uniform is not repetition. It is a decision you keep returning to.",
        notes: "Use this as the first post after the April reset.",
        status: "Ready",
      },
      {
        id: "aai-concept-people-with-intent",
        brandId: "aai",
        title: "People With Intent: City Observation",
        seriesId: "aai-series-people-with-intent",
        episodeNumber: 1,
        pillarId: "aai-content-pillar-observation",
        format: "Carousel",
        scene: "Observed details from a person moving through the city with quiet self-direction.",
        visualDirection: "Editorial crops, posture, fabric, hand, street edge, and one clear line per frame.",
        productPlacement: "AAI appears through the lens and styling logic, not as a forced product shot.",
        englishCaptionDraft: "Not everyone is trying to be seen. Some people are trying to be clear.",
        notes: "Keep it human and specific. Avoid making the subject feel like a trope.",
        status: "Draft",
      },
    ],
    publishingCalendar: [
      {
        id: "aai-post-uniform-decision",
        brandId: "aai",
        date: "2026-05-01",
        title: "The Uniform Decision",
        pillarId: "aai-content-pillar-intent",
        format: "Reel",
        status: "Ready",
        contentConceptId: "aai-concept-uniform-decision",
        sceneBrief: "Quiet morning movement sequence with product embedded in routine.",
        visualDirection: "Soft daylight, restrained movement, close material detail, city threshold.",
        englishCaption: "A uniform is not repetition. It is a decision you keep returning to.",
        workingNotes: "Publish after final still/video selection is confirmed.",
      },
      {
        id: "aai-post-people-with-intent",
        brandId: "aai",
        date: "2026-05-04",
        title: "People With Intent: City Observation",
        pillarId: "aai-content-pillar-observation",
        format: "Carousel",
        status: "Draft",
        contentConceptId: "aai-concept-people-with-intent",
        sceneBrief: "City observation sequence about self-direction and quiet confidence.",
        visualDirection: "Editorial crops, human posture, restrained text pacing.",
        workingNotes: "Choose one person/detail and keep the copy grounded.",
      },
    ],
    actions: [
      {
        id: "aai-action-final-selects",
        brandId: "aai",
        title: "Approve final selects for The Uniform Decision",
        status: "Next",
        linkedItemType: "Scheduled Post",
        linkedItemId: "aai-post-uniform-decision",
        nextMove: "Choose final reel cut, cover frame, and three supporting stills.",
        dueDate: "2026-04-30",
      },
      {
        id: "aai-action-caption-ladder",
        brandId: "aai",
        title: "Refine AAI caption ladder",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "aai",
        nextMove: "Tighten intent, observation, continuity, and individual caption formulas into reusable lines.",
        dueDate: "2026-05-02",
      },
      {
        id: "aai-action-product-sequence",
        brandId: "aai",
        title: "Review product detail sequencing",
        status: "In Progress",
        linkedItemType: "Content Concept",
        linkedItemId: "aai-concept-uniform-decision",
        nextMove: "Confirm how product details appear without overpowering the person or scene.",
        dueDate: "2026-05-04",
      },
    ],
    thinking: [
      {
        id: "aai-thinking-decision-filter",
        brandId: "aai",
        title: "Decision Filter",
        body: "AAI should make the person feel clearer. If a post makes the brand louder than the individual, reduce it.",
        type: "Strategy",
        possibleUse: "Brand compass / caption review / creative direction",
        status: "Useful",
      },
      {
        id: "aai-thinking-anti-algorithm",
        brandId: "aai",
        title: "AAI vs AI",
        body: "The contrast is not technology versus fashion. It is self-direction versus algorithmic sameness.",
        type: "Caption",
        possibleUse: "The Individual pillar / short post / profile copy",
        status: "Useful",
      },
    ],
  },
  masteryatelier: {
    overview: {
      summary: "A craft-first product house for footwear, objects, and disciplined material expression.",
      focus: "Footwear / Product craft / Material discipline / Atelier systems",
      cadence: "Material studies, prototype reviews, construction notes, product story drafts",
      nextAction: "Convert the atelier direction into a tighter product system: silhouettes, materials, offer ladder, and launch priorities.",
      horizon: "System review: May 5",
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
        date: "2026-05-02",
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
        dueDate: "2026-05-03",
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
      horizon: "Studio content system review: May 6",
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
        date: "2026-05-01",
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
        date: "2026-05-06",
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
        dueDate: "2026-04-30",
      },
      {
        id: "mo-action-case-study",
        brandId: "mo-studio",
        title: "Build first cultural case-study carousel",
        status: "Next",
        linkedItemType: "Content Concept",
        linkedItemId: "mo-concept-cultural-case-study",
        nextMove: "Choose project and write the real question, tension, protected truth, intent, response, and scope.",
        dueDate: "2026-05-05",
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
      summary:
        "Kage's personal brand layer for making the thinking behind MO Studio, AAI, Masteryatelier, biro, and the wider Massiveoutfit world visible through taste, cultural reading, craft, rhythm, and authored point of view.",
      focus:
        "Authored point of view / Studio thinking / Cultural reading / Personal taste / Brand-building proof / Craft / Music / Material language / Japan and Singapore perspective",
      cadence: "Weekly resets, idea capture, public notes, reading synthesis, energy reviews",
      nextAction:
        "Make Kage's point of view visible without becoming performative: define the foundation, clarify the voice, connect personal taste to studio work, and prepare a repeatable content rhythm for the Personal workspace.",
      horizon: "Weekly reset: May 4",
    },
    brandCompass: {
      strategy: {
        purpose:
          "Make the thinking behind the work visible.\n\nThe Personal workspace should help people understand how Kage sees, frames, and shapes brand worlds across MO Studio, AAI, Masteryatelier, biro, and the wider Massiveoutfit universe.",
        coreBelief:
          "Taste, trust, cultural reading, and material understanding build stronger brands than surface promotion.\n\nThe personal brand should not exist to perform personality. It should exist to reveal the quality of attention behind the work.",
        positioning:
          "The human and cultural point of view behind MO Studio, AAI, Masteryatelier, biro, and the wider Massiveoutfit world.\n\nKage is positioned as a creative and cultural mind who builds brands through taste, instinct, craft, visual language, and emotional clarity.",
        promise:
          "Show how brands are seen, shaped, and understood.\n\nThe Personal workspace should reveal the thinking behind the image, the reason behind the reference, and the intent behind the decision.",
        tension:
          "Be public enough to build trust without turning private life into performance.\n\nThe personal brand should show thinking, taste, and process, but never become loud, overly exposed, or self-promotional.",
        neverBecome:
          "Generic creator advice, vague motivation, guru language, founder cliches, over-polished personal branding, productivity performance, or content made only for visibility.",
      },
      visualLanguage: {
        photography:
          "Editorial workspace cues, cultural references, process fragments, objects, garments, materials, books, magazines, music, interiors, street observations, and real moments from the making of brand worlds.\n\nImages should feel observed, not staged for attention.",
        composition:
          "Simple frames, quiet hierarchy, negative space, sharp notes, clear crops, object studies, reference layouts, and publication-like arrangements.\n\nThe composition should feel intentional but not over-designed.",
        colorMood:
          "Near-black, paper white, muted reference tones, deep blue, indigo, brass, leather brown, charcoal, soft natural light, and practical dashboard clarity.\n\nColor should support atmosphere, not decoration.",
        texture:
          "Notebook pages, scans, screenshots, printed references, magazine spreads, fabric, leather, brass, denim, paper, wood grain, whisky glass, product fragments, and daily system traces.\n\nTexture should make the personal brand feel lived-in and culturally specific.",
        lighting:
          "Natural, available, quiet, and unforced.\n\nThe lighting should feel lived-in, reflective, and intentional without looking like a commercial setup.",
        references: [
          "Japanese editorial magazines",
          "idea magazine logic",
          "Popeye / Brutus sensibility",
          "whisky culture",
          "uniforms",
          "craft objects",
          "leather goods",
          "street culture",
          "old media",
          "record sleeves",
          "retail spaces",
          "restaurant atmosphere",
          "interiors",
          "everyday objects with cultural memory",
        ],
        avoid: [
          "Founder portrait cliches",
          "Motivational quote cards",
          "Generic creator templates",
          "Over-polished lifestyle imagery",
          "Loud personal branding graphics",
          "Fake productivity setups",
          "Visuals that feel made only for engagement",
        ],
      },
      voice: {
        tone:
          "Editorial, human, understated, precise, culturally aware, calm, observant, and quietly confident.\n\nThe tone should feel like someone noticing carefully, not someone trying to perform expertise.",
        sentenceStyle:
          "Clear first-person or close observational notes that connect decisions, references, process, and lived taste.\n\nSentences can be short, reflective, and direct. Avoid over-explaining. Let the observation carry the weight.",
        wordsToUse: [
          "taste",
          "rhythm",
          "intent",
          "reference",
          "craft",
          "material",
          "trust",
          "atmosphere",
          "culture",
          "clarity",
          "author",
          "authored",
          "signal",
          "restraint",
          "memory",
          "point of view",
          "studio thinking",
          "visual language",
          "decision",
          "process",
          "world",
        ],
        wordsToAvoid: [
          "grindset",
          "hack",
          "guru",
          "manifest",
          "dominate",
          "disrupt",
          "crushing it",
          "personal brand tips",
          "founder journey",
          "content hack",
          "viral",
          "game changer",
          "10x",
          "hustle",
          "thought leader",
          "value bomb",
        ],
        captionLogic:
          "Tie personal reflection to a real project, reference, object, material, sound, decision, or operating rhythm.\n\nEvery caption should make the thinking more visible without explaining too much.",
        ctaStyle:
          "Usually no hard CTA.\n\nIf needed, use soft invitations such as:\n- a note for later\n- a reference worth keeping\n- something I am still thinking through\n- one way to read it\n- filed under studio thinking",
        exampleLines: [
          "What was understood before anything was designed.",
          "The reference was not used for its look, but for its logic.",
          "Some decisions are quiet because they are doing structural work.",
          "Taste is not decoration. It is a way of choosing.",
          "A brand becomes clearer when the unnecessary parts are removed.",
          "The work should feel authored, not advertised.",
          "Music sometimes explains the atmosphere better than a moodboard.",
          "The object matters because of what it remembers.",
          "A material carries time differently when it is allowed to age.",
          "This is less about showing the process and more about keeping the thinking visible.",
        ],
      },
      brandWorld: {
        emotionalTone:
          "Clear, calm, intimate, ambitious, honest, self-directed, culturally aware, and quietly optimistic.\n\nThe world should feel personal, but not overly private.",
        culturalTerritory:
          "Brand-building, visual language, cultural reading, craft, music, magazines, uniforms, objects, materials, whisky, street culture, Japanese editorial logic, Singapore and Japan context, personal rhythm, and authored creative direction.",
        recurringThemes: [
          "Taste as authorship",
          "Studio thinking",
          "Cultural case studies",
          "Material memory",
          "Listening notes",
          "Brand worlds",
          "Original brands as proof",
          "Reference logic",
          "Craft and construction",
          "Quiet confidence",
          "Public thought without performance",
          "The relationship between work, rhythm, and self-direction",
        ],
        coreTension:
          "Building multiple worlds requires visibility and discipline, but the inner rhythm must stay real.\n\nThe personal brand must become visible enough to build trust while staying grounded enough to avoid performance.",
        feeling:
          "A personal cockpit for becoming sharper, calmer, healthier, more intentional, and more culturally precise over time.\n\nIt should feel like a living archive of taste, thought, work, and direction.",
        whatMattersMost:
          "Capture, sort, decide, publish, and review.\n\nKeep the system light enough to actually use, but clear enough to make the personal point of view stronger over time.",
      },
    },
    contentSystem: {
      contentPillars: [
        {
          id: "personal-pillar-studio-thinking",
          order: 1,
          name: "Studio Thinking",
          description:
            "How Kage frames brand, design, campaigns, visual language, trust, and cultural relevance.\n\nThis pillar makes the thinking behind the work visible without turning it into a lesson or sales pitch.",
          tags: ["Studio thinking", "Visual language", "Trust", "Process"],
          color: "#B7FF00",
          active: true,
        },
        {
          id: "personal-pillar-cultural-reading",
          order: 2,
          name: "Cultural Reading",
          description:
            "How Kage studies brands, products, rituals, magazines, music, spaces, objects, retail, restaurants, and everyday culture.\n\nThis pillar shows the cultural logic behind references, not just the surface look.",
          tags: ["Culture", "References", "Brand study", "Context"],
          color: "#F2C94C",
          active: true,
        },
        {
          id: "personal-pillar-curated-perspective",
          order: 3,
          name: "Curated Perspective",
          description:
            "Music, magazines, garments, objects, interiors, materials, and references that shape taste and atmosphere.\n\nThis pillar is where Listening Notes can live as a recurring music-led format.",
          tags: ["Taste", "Listening Notes", "Objects", "Atmosphere"],
          color: "#8CE6FF",
          active: true,
        },
        {
          id: "personal-pillar-decision-record",
          order: 4,
          name: "Decision Record",
          description:
            "What was chosen, why it mattered, and how the decision shaped the work, brand, campaign, object, or direction.\n\nThis pillar turns decisions into clear public thought without over-explaining.",
          tags: ["Decision", "Original brands", "Brand proof", "Clarity"],
          color: "#1D4DFF",
          active: true,
        },
      ],
      contentSeries: [
        {
          id: "personal-series-listening-notes",
          order: 1,
          name: "Listening Notes",
          title: "Listening Notes",
          description:
            "Three tracks, one album, or one listening mood connected to atmosphere, rhythm, space, campaign feeling, visual direction, or personal observation.\n\nThis should not read like a playlist recommendation. It should feel like an editorial note on sound as cultural texture.",
          relatedPillarIds: ["personal-pillar-curated-perspective", "personal-pillar-cultural-reading"],
          episodeStructure: "Sound / mood / visual rhythm / what it is shaping",
          productLogic: "Use music as atmosphere, not filler content.",
          active: true,
        },
        {
          id: "personal-series-decision-record",
          order: 2,
          name: "Decision Record",
          title: "Decision Record",
          description: "Short public notes explaining a creative, brand, visual, product, or operating decision.",
          relatedPillarIds: ["personal-pillar-decision-record", "personal-pillar-studio-thinking"],
          episodeStructure: "Decision / why / tradeoff / next move",
          productLogic: "Make thinking visible without over-explaining.",
          active: true,
        },
        {
          id: "personal-series-reference-study",
          order: 3,
          name: "Reference Study",
          title: "Reference Study",
          description: "A small study of a magazine, object, brand, material, garment, campaign, space, or ritual.",
          relatedPillarIds: ["personal-pillar-cultural-reading", "personal-pillar-curated-perspective"],
          episodeStructure: "Reference / context / what was understood / how it could inform work",
          productLogic: "Turn taste into a usable brand-building archive.",
          active: true,
        },
        {
          id: "personal-series-working-notes",
          order: 4,
          name: "Working Notes",
          title: "Working Notes",
          description: "Short observations from active studio work, brand-building, image-making, prompt development, planning, or visual direction.",
          relatedPillarIds: ["personal-pillar-studio-thinking", "personal-pillar-decision-record"],
          episodeStructure: "What is being shaped / what changed / what needs attention",
          productLogic: "Keep the personal brand close to real work and real decisions.",
          active: true,
        },
      ],
      pillarRotation: [
        {
          postNumber: 1,
          pillarId: "personal-pillar-studio-thinking",
          format: "Post",
          direction: "Monday: Start the week with an authored point of view on brand, visual language, process, trust, or creative direction.",
        },
        {
          postNumber: 2,
          pillarId: "personal-pillar-cultural-reading",
          format: "Post",
          direction: "Tuesday: Study one brand, object, product, ritual, magazine, space, or cultural reference through Kage's point of view.",
        },
        {
          postNumber: 3,
          pillarId: "personal-pillar-curated-perspective",
          format: "Post",
          direction:
            "Wednesday: Share taste, references, objects, visual cues, or Listening Notes. Every other Wednesday should become Listening Notes; alternate Wednesdays can be Reference Study, object note, magazine note, or taste note.",
        },
        {
          postNumber: 4,
          pillarId: "personal-pillar-decision-record",
          format: "Post",
          direction:
            "Friday: Close the week with one decision, tradeoff, original brand proof, or reflection from MO Studio, AAI, Masteryatelier, biro, or the wider Massiveoutfit world.",
        },
      ],
      contentRules: {
        productRole:
          "Personal content supports trust in the broader brand ecosystem.\n\nIt should make the human point of view behind MO Studio, AAI, Masteryatelier, biro, and Massiveoutfit easier to understand.",
        captionRules:
          "Be specific, grounded, and tied to a real decision, reference, project, rhythm, object, material, sound, or observation.\n\nDo not over-explain.\nDo not force a lesson.\nDo not write like a creator account.\nLet the thinking show through the detail.",
        visualRules:
          "Use real notes, references, system views, desk cues, objects, materials, magazine logic, screenshots, process fragments, and simple editorial frames.\n\nThe visual should feel observed, intentional, and culturally specific.",
        postingRules:
          "Post 4 times per week on weekdays only.\n\nDefault rhythm:\n- Monday: Studio Thinking\n- Tuesday: Cultural Reading\n- Wednesday: Curated Perspective\n- Friday: Decision Record\n\nDo not schedule posts on Saturday or Sunday.\n\nUse Thursday for capture, drafting, editing, review, and preparation.\n\nListening Notes appears every other Wednesday under Curated Perspective.",
        avoid:
          "Avoid guru tone, generic motivation, founder cliches, productivity performance, viral hooks, engagement bait, over-polished personal branding, and private tracking that becomes performance.",
      },
    },
    contentConcepts: [
      {
        id: "personal-concept-understood-before-designed",
        brandId: "personal",
        title: "What Was Understood Before Anything Was Designed",
        seriesId: "personal-series-working-notes",
        pillarId: "personal-pillar-studio-thinking",
        format: "Post",
        scene: "A concise note on the thinking that happens before visual direction begins.",
        visualDirection: "Notebook page, reference scan, quiet desk frame, or simple editorial text layout.",
        productPlacement: "MO Studio / Personal point of view.",
        status: "Draft",
      },
      {
        id: "personal-concept-listening-notes-001",
        brandId: "personal",
        title: "Listening Notes 001",
        seriesId: "personal-series-listening-notes",
        pillarId: "personal-pillar-curated-perspective",
        format: "Post",
        scene: "Three tracks currently shaping the atmosphere, rhythm, or visual mood.",
        visualDirection: "Record sleeve, playlist screenshot, notebook note, or abstract editorial layout with track titles.",
        productPlacement: "Sound as atmosphere for Kage's brand world.",
        status: "Draft",
      },
      {
        id: "personal-concept-aai-brand-building-proof",
        brandId: "personal",
        title: "AAI as Brand-Building Proof",
        seriesId: "personal-series-decision-record",
        pillarId: "personal-pillar-decision-record",
        format: "Post",
        scene: "A short note on how AAI demonstrates intent, optimism, street culture, and authored brand-building.",
        visualDirection: "AAI garment detail, campaign still, reference board, or minimal text/image frame.",
        productPlacement: "AAI as proof of Kage's brand logic.",
        status: "Draft",
      },
      {
        id: "personal-concept-masteryatelier-craft-proof",
        brandId: "personal",
        title: "Masteryatelier as Craft Proof",
        seriesId: "personal-series-decision-record",
        pillarId: "personal-pillar-decision-record",
        format: "Post",
        scene: "A note on how handmade intervention, leather, sneakers, and material transformation express craft logic.",
        visualDirection: "Leather detail, tassel process, handwork close-up, or product fragment.",
        productPlacement: "Masteryatelier as proof of craft and transformation.",
        status: "Draft",
      },
      {
        id: "personal-concept-japanese-magazine-logic",
        brandId: "personal",
        title: "Japanese Magazine Logic in Brand Work",
        seriesId: "personal-series-reference-study",
        pillarId: "personal-pillar-cultural-reading",
        format: "Post",
        scene: "A cultural note on how Japanese editorial logic can shape pacing, hierarchy, restraint, and brand storytelling.",
        visualDirection: "Magazine spread reference, grid layout, cropped typography, or publication-style composition.",
        productPlacement: "Cultural reading applied to studio work.",
        status: "Draft",
      },
      {
        id: "personal-concept-reference-to-visual-direction",
        brandId: "personal",
        title: "From Reference to Visual Direction",
        seriesId: "personal-series-working-notes",
        pillarId: "personal-pillar-studio-thinking",
        format: "Post",
        scene: "A note on how a reference becomes mood, image logic, typography, campaign feeling, or spatial direction.",
        visualDirection: "Before-and-after reference board, prompt note, image contact sheet, or studio desktop view.",
        productPlacement: "MO Studio / Personal process.",
        status: "Draft",
      },
      {
        id: "personal-concept-object-remembers",
        brandId: "personal",
        title: "The Object Matters Because of What It Remembers",
        seriesId: "personal-series-reference-study",
        pillarId: "personal-pillar-curated-perspective",
        format: "Post",
        scene: "A short observation on objects, material memory, patina, and cultural meaning.",
        visualDirection: "Brass, leather, denim, paper, ceramic, wood, or whisky glass close-up.",
        productPlacement: "Material language and personal taste.",
        status: "Draft",
      },
      {
        id: "personal-concept-authored-not-advertised",
        brandId: "personal",
        title: "The Work Should Feel Authored, Not Advertised",
        seriesId: "personal-series-working-notes",
        pillarId: "personal-pillar-studio-thinking",
        format: "Post",
        scene: "A direct note on the difference between authored brand language and surface-level promotion.",
        visualDirection: "Clean editorial text frame, campaign sketch, studio note, or visual direction board.",
        productPlacement: "Kage personal brand / MO Studio.",
        status: "Draft",
      },
    ],
    publishingCalendar: [
      {
        id: "personal-post-2026-05-04-understood-before-designed",
        brandId: "personal",
        date: "2026-05-04",
        title: "What Was Understood Before Anything Was Designed",
        pillarId: "personal-pillar-studio-thinking",
        format: "Post",
        status: "Draft",
        contentConceptId: "personal-concept-understood-before-designed",
        sceneBrief: "A concise note on the thinking that happens before visual direction begins.",
        workingNotes: "Monday Studio Thinking sample post.",
      },
      {
        id: "personal-post-2026-05-05-japanese-magazine-logic",
        brandId: "personal",
        date: "2026-05-05",
        title: "Japanese Magazine Logic in Brand Work",
        pillarId: "personal-pillar-cultural-reading",
        format: "Post",
        status: "Draft",
        contentConceptId: "personal-concept-japanese-magazine-logic",
        sceneBrief: "Study Japanese editorial pacing, hierarchy, restraint, and brand storytelling.",
        workingNotes: "Tuesday Cultural Reading sample post.",
      },
      {
        id: "personal-post-2026-05-06-listening-notes-001",
        brandId: "personal",
        date: "2026-05-06",
        title: "Listening Notes 001",
        pillarId: "personal-pillar-curated-perspective",
        format: "Post",
        status: "Draft",
        contentConceptId: "personal-concept-listening-notes-001",
        sceneBrief: "Three tracks shaping atmosphere, rhythm, or visual mood.",
        workingNotes: "Wednesday Curated Perspective sample post. Listening Notes recurring format.",
      },
      {
        id: "personal-post-2026-05-08-authored-not-advertised",
        brandId: "personal",
        date: "2026-05-08",
        title: "The Work Should Feel Authored, Not Advertised",
        pillarId: "personal-pillar-decision-record",
        format: "Post",
        status: "Draft",
        contentConceptId: "personal-concept-authored-not-advertised",
        sceneBrief: "A direct note on authored brand language versus surface-level promotion.",
        workingNotes: "Friday Decision Record sample post.",
      },
    ],
    actions: [
      {
        id: "personal-action-first-4-weeks",
        brandId: "personal",
        title: "Define the first 4 weeks of Personal content",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Map Monday, Tuesday, Wednesday, and Friday posts using Studio Thinking, Cultural Reading, Curated Perspective, and Decision Record.",
        notes: "Map Monday, Tuesday, Wednesday, and Friday posts using Studio Thinking, Cultural Reading, Curated Perspective, and Decision Record.",
      },
      {
        id: "personal-action-first-3-listening-notes",
        brandId: "personal",
        title: "Draft first 3 Listening Notes",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Create three music-led notes that connect sound to atmosphere, rhythm, visual direction, or campaign mood.",
        notes: "Create three music-led notes that connect sound to atmosphere, rhythm, visual direction, or campaign mood.",
      },
      {
        id: "personal-action-reference-archive",
        brandId: "personal",
        title: "Build a personal reference archive",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Collect magazines, objects, music, materials, spaces, retail notes, garments, and screenshots that can become future content.",
        notes: "Collect magazines, objects, music, materials, spaces, retail notes, garments, and screenshots that can become future content.",
      },
      {
        id: "personal-action-draft-8-concepts",
        brandId: "personal",
        title: "Draft first 8 Personal content concepts",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Use the seeded concepts as starting points and turn them into publishable captions or visual directions.",
        notes: "Use the seeded concepts as starting points and turn them into publishable captions or visual directions.",
      },
      {
        id: "personal-action-connect-to-mo-studio",
        brandId: "personal",
        title: "Connect Personal content to MO Studio",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Identify where personal observations can strengthen trust in the studio without sounding promotional.",
        notes: "Identify where personal observations can strengthen trust in the studio without sounding promotional.",
      },
      {
        id: "personal-action-visual-template-direction",
        brandId: "personal",
        title: "Create Personal visual template direction",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Define simple recurring formats for notes, reference studies, Listening Notes, and Decision Records.",
        notes: "Define simple recurring formats for notes, reference studies, Listening Notes, and Decision Records.",
      },
      {
        id: "personal-action-monthly-rhythm-review",
        brandId: "personal",
        title: "Review Personal content rhythm monthly",
        status: "Next",
        linkedItemType: "Brand",
        linkedItemId: "personal",
        nextMove: "Check whether the 4-post weekday rhythm is useful, sustainable, and still aligned with the personal brand world.",
        notes: "Check whether the 4-post weekday rhythm is useful, sustainable, and still aligned with the personal brand world.",
      },
    ],
    thinking: [
      {
        id: "personal-thinking-authored-point-of-view",
        brandId: "personal",
        title: "Personal content as authored point of view",
        body: "The strongest personal content should not come from performing personality. It should come from showing how Kage sees, selects, frames, and decides.",
        type: "Strategy",
        possibleUse: "Personal brand / Studio thinking / Authorship",
        status: "Useful",
      },
      {
        id: "personal-thinking-listening-notes-atmospheric",
        brandId: "personal",
        title: "Listening Notes should feel atmospheric",
        body: "Music should not appear as random recommendations. It should act as a way to describe rhythm, timing, space, mood, campaign feeling, and visual atmosphere.",
        type: "Content",
        possibleUse: "Listening Notes / Music / Atmosphere",
        status: "Useful",
      },
      {
        id: "personal-thinking-original-brands-proof",
        brandId: "personal",
        title: "Original brands are proof",
        body: "AAI, Masteryatelier, and biro should act as living evidence of Kage's brand-building logic, not separate disconnected projects.",
        type: "Strategy",
        possibleUse: "Original brands / Brand proof / Decision record",
        status: "Useful",
      },
      {
        id: "personal-thinking-reflection-performance",
        brandId: "personal",
        title: "Avoid turning reflection into performance",
        body: "The personal brand needs visibility, but it should not turn private tracking, productivity, or self-management into public performance.",
        type: "Voice",
        possibleUse: "Voice / Boundaries / Restraint",
        status: "Useful",
      },
      {
        id: "personal-thinking-taste-needs-structure",
        brandId: "personal",
        title: "Taste needs structure",
        body: "Taste becomes useful when it is captured, sorted, and connected to decisions. The system should help references become direction.",
        type: "Content System",
        possibleUse: "Taste / References / Content system",
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
      horizon: "Seed review: May 5",
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
        date: "2026-05-05",
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
        dueDate: "2026-05-05",
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

function sameStoredValue(left: unknown, right: unknown) {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((entry, index) => entry === right[index]);
  }

  return left === right;
}

function mergeTextObjectReplacingLegacy<T extends object>(defaults?: T, existing?: T, legacy?: T): T | undefined {
  if (!defaults && !existing) {
    return undefined;
  }

  const next = { ...(defaults ?? {}) } as T;

  Object.entries((existing ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
    const hasValue = Array.isArray(value) ? value.length > 0 : typeof value === "string" ? hasText(value) : Boolean(value);
    const legacyValue = (legacy as Record<string, unknown> | undefined)?.[key];

    if (hasValue && !sameStoredValue(value, legacyValue)) {
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

function mergeCompassReplacingLegacy(defaults?: BrandCompass, existing?: BrandCompass, legacy?: BrandCompass): BrandCompass | undefined {
  if (!defaults && !existing) {
    return undefined;
  }

  return {
    strategy: mergeTextObjectReplacingLegacy(defaults?.strategy, existing?.strategy, legacy?.strategy),
    visualLanguage: mergeTextObjectReplacingLegacy(defaults?.visualLanguage, existing?.visualLanguage, legacy?.visualLanguage),
    voice: mergeTextObjectReplacingLegacy(defaults?.voice, existing?.voice, legacy?.voice),
    brandWorld: mergeTextObjectReplacingLegacy(defaults?.brandWorld, existing?.brandWorld, legacy?.brandWorld),
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

function mergeDefinedDefaultFields<T extends Record<string, unknown>>(defaultItem: T, existingItem?: T): T {
  if (!existingItem) {
    return defaultItem;
  }

  return {
    ...existingItem,
    ...defaultItem,
  };
}

function mergeMoStudioDefaultList<T extends { id: string }>(
  defaultItems: T[] | undefined,
  existingItems: T[] | undefined,
  isSameRecord: (existingItem: T, defaultItem: T) => boolean,
) {
  if (!defaultItems) {
    return existingItems ?? [];
  }

  return defaultItems.map((defaultItem) => {
    const existingItem = existingItems?.find((item) => item.id === defaultItem.id || isSameRecord(item, defaultItem));
    return mergeDefinedDefaultFields(defaultItem as T & Record<string, unknown>, existingItem as (T & Record<string, unknown>) | undefined) as T;
  });
}

function resolveContentSystem(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "mo-studio" && defaults?.contentSystem) {
    return defaults.contentSystem;
  }

  if (brandSpace.id === "personal" && defaults?.contentSystem) {
    const existingContentSystem = brandSpace.contentSystem;
    const hasLegacyPillars = existingContentSystem?.contentPillars?.some((item) => PERSONAL_LEGACY_CONTENT_SYSTEM_IDS.pillars.includes(item.id));
    const hasLegacySeries = existingContentSystem?.contentSeries?.some((item) => PERSONAL_LEGACY_CONTENT_SYSTEM_IDS.series.includes(item.id));

    if (!hasList(existingContentSystem?.contentPillars) || hasLegacyPillars || hasLegacySeries) {
      return defaults.contentSystem;
    }
  }

  return mergeContentSystem(defaults?.contentSystem, brandSpace.contentSystem ?? {});
}

function resolveContentConcepts(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "mo-studio") {
    return mergeMoStudioDefaultList(defaults?.contentConcepts, brandSpace.contentConcepts, (existingItem, defaultItem) => existingItem.title === defaultItem.title);
  }

  if (brandSpace.id === "personal" && defaults?.contentConcepts) {
    const hasLegacyRecords = brandSpace.contentConcepts?.some((item) => PERSONAL_LEGACY_RECORD_IDS.contentConcepts.includes(item.id));
    return !hasList(brandSpace.contentConcepts) || hasLegacyRecords ? defaults.contentConcepts : brandSpace.contentConcepts;
  }

  return hasList(brandSpace.contentConcepts) ? brandSpace.contentConcepts : defaults?.contentConcepts ?? [];
}

function resolvePublishingCalendar(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "mo-studio") {
    return mergeMoStudioDefaultList(
      defaults?.publishingCalendar,
      brandSpace.publishingCalendar,
      (existingItem, defaultItem) => existingItem.title === defaultItem.title && existingItem.date === defaultItem.date,
    );
  }

  if (brandSpace.id === "personal" && defaults?.publishingCalendar) {
    const hasLegacyRecords = brandSpace.publishingCalendar?.some((item) => PERSONAL_LEGACY_RECORD_IDS.publishingCalendar.includes(item.id));
    return !hasList(brandSpace.publishingCalendar) || hasLegacyRecords ? defaults.publishingCalendar : brandSpace.publishingCalendar;
  }

  return hasList(brandSpace.publishingCalendar) ? brandSpace.publishingCalendar : defaults?.publishingCalendar ?? [];
}

function resolveActions(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "mo-studio") {
    return mergeMoStudioDefaultList(
      defaults?.actions,
      brandSpace.actions,
      (existingItem, defaultItem) => existingItem.title === defaultItem.title && existingItem.dueDate === defaultItem.dueDate,
    );
  }

  if (brandSpace.id === "personal" && defaults?.actions) {
    const hasLegacyRecords = brandSpace.actions?.some((item) => PERSONAL_LEGACY_RECORD_IDS.actions.includes(item.id));
    return !hasList(brandSpace.actions) || hasLegacyRecords ? defaults.actions : brandSpace.actions;
  }

  return hasList(brandSpace.actions) ? brandSpace.actions : defaults?.actions ?? [];
}

function resolveThinking(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "mo-studio") {
    return mergeMoStudioDefaultList(defaults?.thinking, brandSpace.thinking, (existingItem, defaultItem) => existingItem.title === defaultItem.title);
  }

  if (brandSpace.id === "personal" && defaults?.thinking) {
    const hasLegacyRecords = brandSpace.thinking?.some((item) => PERSONAL_LEGACY_RECORD_IDS.thinking.includes(item.id));
    return !hasList(brandSpace.thinking) || hasLegacyRecords ? defaults.thinking : brandSpace.thinking;
  }

  return hasList(brandSpace.thinking) ? brandSpace.thinking : defaults?.thinking ?? [];
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

function resolveBrandSpaceDefaults(id: BrandSpace["id"]) {
  return id === "mo-studio" ? moStudioBrandSpaceDefaults : BRAND_SPACE_DEFAULTS[id];
}

function resolveBrandCompass(defaults: BrandSpaceDefaults | undefined, brandSpace: BrandSpace) {
  if (brandSpace.id === "personal") {
    return mergeCompassReplacingLegacy(defaults?.brandCompass, brandSpace.brandCompass, PERSONAL_LEGACY_BRAND_COMPASS);
  }

  return mergeCompass(defaults?.brandCompass, brandSpace.brandCompass);
}

export function normalizeBrandSpaceExtensions(brandSpace: BrandSpace): BrandSpace {
  const defaults = resolveBrandSpaceDefaults(brandSpace.id);
  const existingContentSystem = brandSpace.contentSystem ?? {};

  return {
    ...brandSpace,
    description: resolveOverviewValue(brandSpace.id, "description", brandSpace.description, defaults?.overview?.description),
    summary: resolveOverviewValue(brandSpace.id, "summary", brandSpace.summary, defaults?.overview?.summary),
    focus: resolveOverviewValue(brandSpace.id, "focus", brandSpace.focus, defaults?.overview?.focus),
    cadence: resolveOverviewValue(brandSpace.id, "cadence", brandSpace.cadence, defaults?.overview?.cadence),
    nextAction: resolveOverviewValue(brandSpace.id, "nextAction", brandSpace.nextAction, defaults?.overview?.nextAction),
    horizon: resolveOverviewValue(brandSpace.id, "horizon", brandSpace.horizon, defaults?.overview?.horizon),
    brandCompass: resolveBrandCompass(defaults, brandSpace),
    contentSystem: resolveContentSystem(defaults, { ...brandSpace, contentSystem: existingContentSystem }),
    contentConcepts: resolveContentConcepts(defaults, brandSpace),
    publishingCalendar: resolvePublishingCalendar(defaults, brandSpace),
    actions: resolveActions(defaults, brandSpace),
    thinking: resolveThinking(defaults, brandSpace),
  };
}

export function getBrandSpaceExtensionDefaults(id: BrandSpace["id"]) {
  return resolveBrandSpaceDefaults(id);
}

export function applyBrandSpaceExtensionDefaults(brandSpace: BrandSpace): BrandSpace {
  const normalized = normalizeBrandSpaceExtensions(brandSpace);
  const defaults = resolveBrandSpaceDefaults(brandSpace.id);

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
    brandCompass: resolveBrandCompass(defaults, brandSpace),
    contentSystem: resolveContentSystem(defaults, brandSpace),
    contentConcepts: resolveContentConcepts(defaults, brandSpace),
    publishingCalendar: resolvePublishingCalendar(defaults, brandSpace),
    actions: resolveActions(defaults, brandSpace),
    thinking: resolveThinking(defaults, brandSpace),
  };
}

export function applyBrandSpacesExtensionDefaults(brandSpaces: BrandSpace[]) {
  return brandSpaces.map(applyBrandSpaceExtensionDefaults);
}

export function normalizeBrandSpacesExtensions(brandSpaces: BrandSpace[]) {
  return brandSpaces.map(normalizeBrandSpaceExtensions);
}
