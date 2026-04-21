import { ProjectItem, ProjectMilestone } from "@/types";

export const projects: ProjectItem[] = [
  {
    id: "proj-aai-april",
    title: "AAI April Content System",
    brandId: "aai",
    status: "active",
    goal: "Build a clearer recurring content rhythm for AAI.",
    startDate: "2026-04-01",
    dueDate: "2026-04-30",
    summary: "Content planning, visual system, and scheduling.",
    milestones: ["Weekly schedule locked", "Visual direction aligned", "Scheduling system finalized"],
    taskHooks: ["Finalize AAI weekly content schedule", "Review AAI product detail sequencing"],
    calendarAnchors: ["2026-04-12 / AAI Reel Publish", "2026-04-14 / AAI Product Detail Review"],
    notes: [
      "Use the project page to keep content planning, review points, and delivery timing connected.",
      "Keep sequencing decisions visible so the Home layer reflects real operational pressure.",
    ],
  },
  {
    id: "proj-mastery-framework",
    title: "Masteryatelier Framework Build",
    brandId: "masteryatelier",
    status: "active",
    goal: "Clarify the flagship teaching structure and connect lessons, frameworks, and publishing cadence.",
    startDate: "2026-04-08",
    dueDate: "2026-04-24",
    summary: "Offer structure, curriculum mapping, and content alignment.",
    milestones: ["Framework structure drafted", "Lesson flow reviewed", "Publishing rhythm clarified"],
    taskHooks: ["Review Masteryatelier product caption set", "Shape the next learning sprint assets"],
    calendarAnchors: ["2026-04-15 / Lesson framing sync", "2026-04-16 / Workshop draft review"],
    notes: [
      "Clarify how the program structure and publishing rhythm support one another.",
      "Keep the project language calm, instructional, and directly useful.",
    ],
  },
  {
    id: "proj-mo-client",
    title: "MO Studio Client Delivery",
    brandId: "mo-studio",
    status: "active",
    goal: "Prepare and deliver April client assets.",
    startDate: "2026-04-08",
    dueDate: "2026-04-18",
    summary: "Delivery checkpoints, asset readiness, and client communication.",
    milestones: ["Client check-in completed", "Delivery map revised", "Final asset package prepared"],
    taskHooks: ["Update the delivery map with current blockers", "Prepare the next client checkpoint"],
    calendarAnchors: ["2026-04-13 / MO Studio Client Check-in", "2026-04-14 / Timeline revision pass"],
    notes: [
      "The project page should keep handoffs, deadlines, and delivery health visible without extra noise.",
      "Use notes to capture operational decisions while they are still fresh.",
    ],
  },
  {
    id: "proj-personal-reset",
    title: "Personal April Reset",
    brandId: "personal",
    status: "paused",
    goal: "Reset priorities, note flow, and weekly review rhythm.",
    startDate: "2026-04-09",
    dueDate: "2026-04-14",
    summary: "Weekly reset structure, reading review, and planning clarity.",
    milestones: ["Weekly reset completed", "Reading review organized", "Next week planned clearly"],
    taskHooks: ["Reset personal weekly priorities", "Sort reading notes into themes"],
    calendarAnchors: ["2026-04-12 / Weekly reset", "2026-04-14 / Planning block"],
    notes: [
      "Keep the personal project page closer to a reset and reflection tool than a heavy project tracker.",
      "Use it to align notes, review rhythm, and next actions.",
    ],
  },
];

export const projectMilestones: ProjectMilestone[] = [
  { id: "milestone-001", projectId: "proj-aai-april", label: "Weekly schedule locked" },
  { id: "milestone-002", projectId: "proj-aai-april", label: "Visual direction aligned" },
  { id: "milestone-003", projectId: "proj-aai-april", label: "Scheduling system finalized" },
  { id: "milestone-004", projectId: "proj-mastery-framework", label: "Framework structure drafted" },
  { id: "milestone-005", projectId: "proj-mastery-framework", label: "Lesson flow reviewed" },
  { id: "milestone-006", projectId: "proj-mastery-framework", label: "Publishing rhythm clarified" },
  { id: "milestone-007", projectId: "proj-mo-client", label: "Client check-in completed" },
  { id: "milestone-008", projectId: "proj-mo-client", label: "Delivery map revised" },
  { id: "milestone-009", projectId: "proj-mo-client", label: "Final asset package prepared" },
  { id: "milestone-010", projectId: "proj-personal-reset", label: "Weekly reset completed" },
  { id: "milestone-011", projectId: "proj-personal-reset", label: "Reading review organized" },
  { id: "milestone-012", projectId: "proj-personal-reset", label: "Next week planned clearly" },
];

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}
