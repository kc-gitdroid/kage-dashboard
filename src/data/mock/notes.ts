import { NoteItem, NoteType } from "@/types";

export const noteTypes: NoteType[] = ["idea", "reflection", "reminder", "reference"];

export const notes: NoteItem[] = [
  {
    id: "note-001",
    title: "AAI campaign phrase",
    brandId: "aai",
    type: "idea",
    body: "Quiet confidence in motion.",
    createdAt: "2026-04-10T09:30:00",
  },
  {
    id: "note-002",
    title: "Personal reminder",
    brandId: "personal",
    type: "reminder",
    body: "Review dashboard mobile spacing after calendar build.",
    createdAt: "2026-04-10T11:00:00",
  },
  {
    id: "note-003",
    title: "Masteryatelier workshop note",
    brandId: "masteryatelier",
    type: "reference",
    body: "Keep the lesson flow closer to operating principles before examples.",
    createdAt: "2026-04-10T15:45:00",
  },
  {
    id: "note-004",
    title: "MO Studio client reminder",
    brandId: "mo-studio",
    type: "reminder",
    body: "Confirm the next checkpoint deck before the Thursday review.",
    createdAt: "2026-04-09T18:15:00",
  },
];
