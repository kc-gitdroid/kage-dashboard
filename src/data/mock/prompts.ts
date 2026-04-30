import { PromptItem } from "@/types";

export const promptItems: PromptItem[] = [
  {
    id: "prompt-aai-campaign-angle",
    title: "AAI Campaign Angle Builder",
    brandId: "aai",
    summary: "Generate calm, identity-led campaign angles from product, ritual, and city mood inputs.",
    body: "Use AAI tone: restrained, precise, reflective. Turn the source material into 3 campaign angles, 3 short captions, and 1 longer editorial direction.",
    status: "active",
    updatedAt: "2026-04-13",
  },
  {
    id: "prompt-mastery-framework",
    title: "Masteryatelier Lesson Framework",
    brandId: "masteryatelier",
    summary: "Shape a teaching concept into framework, sequence, and outcome language.",
    body: "Given a lesson idea, return learner promise, lesson structure, reflection prompts, and one publishable takeaway in a calm instructional tone.",
    status: "active",
    updatedAt: "2026-04-12",
  },
  {
    id: "prompt-mo-case-study",
    title: "MO Studio Case Study Draft",
    brandId: "mo-studio",
    summary: "Turn delivery notes into a concise case-study structure with process and result sections.",
    body: "Convert project notes into overview, challenge, approach, outcome, and one insight worth reusing across future client work.",
    status: "planned",
    updatedAt: "2026-04-12",
  },
  {
    id: "prompt-personal-caption",
    title: "Personal Caption Prompt",
    brandId: "personal",
    summary: "Turn an idea into an editorial, human, understated personal brand caption for Kage.",
    body:
      "Turn this idea into a personal brand caption for Kage.\n\nKeep the tone editorial, human, understated, precise, and culturally aware.\n\nAvoid influencer language, motivational hooks, sales copy, founder cliches, and obvious personal branding.\n\nThe writing should reveal taste, thinking, and authorship.\n\nConnect the idea subtly to MO Studio, AAI, Masteryatelier, biro, or Kage's wider brand world only when it feels natural.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Caption",
    promptBody:
      "Turn this idea into a personal brand caption for Kage.\n\nKeep the tone editorial, human, understated, precise, and culturally aware.\n\nAvoid influencer language, motivational hooks, sales copy, founder cliches, and obvious personal branding.\n\nThe writing should reveal taste, thinking, and authorship.\n\nConnect the idea subtly to MO Studio, AAI, Masteryatelier, biro, or Kage's wider brand world only when it feels natural.",
  },
  {
    id: "prompt-personal-listening-notes",
    title: "Listening Notes Prompt",
    brandId: "personal",
    summary: "Shape music references into a Listening Notes post about mood, rhythm, atmosphere, and cultural texture.",
    body:
      "Turn these songs, albums, or music references into a Listening Notes post for Kage's personal brand.\n\nDo not write it like a playlist recommendation.\n\nWrite it as an editorial note on mood, rhythm, atmosphere, timing, and cultural texture.\n\nConnect the music subtly to visual direction, brand world, space, campaign feeling, or personal observation.\n\nKeep the tone understated, precise, and human.\n\nAvoid hype, music-review cliches, and influencer-style language.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Caption / Culture",
    promptBody:
      "Turn these songs, albums, or music references into a Listening Notes post for Kage's personal brand.\n\nDo not write it like a playlist recommendation.\n\nWrite it as an editorial note on mood, rhythm, atmosphere, timing, and cultural texture.\n\nConnect the music subtly to visual direction, brand world, space, campaign feeling, or personal observation.\n\nKeep the tone understated, precise, and human.\n\nAvoid hype, music-review cliches, and influencer-style language.",
  },
  {
    id: "prompt-personal-cultural-reading",
    title: "Cultural Reading Prompt",
    brandId: "personal",
    summary: "Turn a brand, object, ritual, product, place, or reference into a short cultural reading.",
    body:
      "Turn this brand, object, ritual, magazine, product, space, restaurant, or cultural reference into a short cultural reading.\n\nExplain what is being understood, not just what it looks like.\n\nKeep the tone editorial, thoughtful, and grounded.\n\nAvoid academic language, trend language, and obvious \"case study\" cliches.\n\nThe result should feel useful for brand-building and visual direction.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Strategy / Caption",
    promptBody:
      "Turn this brand, object, ritual, magazine, product, space, restaurant, or cultural reference into a short cultural reading.\n\nExplain what is being understood, not just what it looks like.\n\nKeep the tone editorial, thoughtful, and grounded.\n\nAvoid academic language, trend language, and obvious \"case study\" cliches.\n\nThe result should feel useful for brand-building and visual direction.",
  },
  {
    id: "prompt-personal-decision-record",
    title: "Decision Record Prompt",
    brandId: "personal",
    summary: "Turn a creative, brand, product, or operating decision into a concise public note.",
    body:
      "Turn this decision into a clear public note.\n\nExplain what was chosen, why it mattered, what tradeoff was accepted, and how it shaped the work.\n\nKeep it concise and human.\n\nDo not over-explain.\nDo not turn it into a lesson thread.\nDo not make it sound like founder content.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Strategy / Caption",
    promptBody:
      "Turn this decision into a clear public note.\n\nExplain what was chosen, why it mattered, what tradeoff was accepted, and how it shaped the work.\n\nKeep it concise and human.\n\nDo not over-explain.\nDo not turn it into a lesson thread.\nDo not make it sound like founder content.",
  },
  {
    id: "prompt-personal-studio-thinking",
    title: "Studio Thinking Prompt",
    brandId: "personal",
    summary: "Turn a process, reference, visual direction, or campaign thought into a Studio Thinking post.",
    body:
      "Turn this process, reference, visual direction, or campaign thought into a Studio Thinking post.\n\nThe writing should make the thinking behind the work visible.\n\nKeep the tone understated, specific, and culturally aware.\n\nAvoid selling the service.\nAvoid loud expertise.\nAvoid generic branding advice.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Strategy / Caption",
    promptBody:
      "Turn this process, reference, visual direction, or campaign thought into a Studio Thinking post.\n\nThe writing should make the thinking behind the work visible.\n\nKeep the tone understated, specific, and culturally aware.\n\nAvoid selling the service.\nAvoid loud expertise.\nAvoid generic branding advice.",
  },
  {
    id: "prompt-personal-visual-direction",
    title: "Visual Direction Prompt",
    brandId: "personal",
    summary: "Create an image or video prompt for Kage's personal brand world.",
    body:
      "Create an image or video prompt for Kage's personal brand world.\n\nThe visual should feel editorial, restrained, culturally aware, slightly analog, and authored.\n\nUse real notes, references, desk cues, materials, magazines, objects, screenshots, garments, leather, brass, paper, denim, whisky glass, or studio fragments.\n\nAvoid influencer aesthetics, generic productivity desk setups, polished founder portraits, motivational quote graphics, and over-designed personal branding.",
    status: "active",
    updatedAt: "2026-04-30",
    type: "Image / Video",
    promptBody:
      "Create an image or video prompt for Kage's personal brand world.\n\nThe visual should feel editorial, restrained, culturally aware, slightly analog, and authored.\n\nUse real notes, references, desk cues, materials, magazines, objects, screenshots, garments, leather, brass, paper, denim, whisky glass, or studio fragments.\n\nAvoid influencer aesthetics, generic productivity desk setups, polished founder portraits, motivational quote graphics, and over-designed personal branding.",
  },
  {
    id: "prompt-biro-story-seed",
    title: "biro Story Seed",
    brandId: "biro",
    summary: "Generate short concept seeds and writing prompts for biro workspace development.",
    body: "Use a curious, minimal tone. Return 5 prompt seeds, 3 themes, and 1 extended direction worth exploring further.",
    status: "draft",
    updatedAt: "2026-04-11",
  },
  {
    id: "prompt-global-meeting-recap",
    title: "Meeting Recap to Actions",
    summary: "Convert unstructured meeting notes into actions, dates, and follow-up questions.",
    body: "Extract decisions, owners, deadlines, unresolved questions, and suggested follow-up note structure.",
    status: "active",
    updatedAt: "2026-04-14",
  },
];
