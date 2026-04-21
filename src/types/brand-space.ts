import { AccentTone, Status } from "@/types/common";
import { Brand } from "@/types/brand";

export interface BrandSpace extends Brand {
  tone: AccentTone;
  summary: string;
  focus: string;
  cadence: string;
  nextAction: string;
  status: Status;
  horizon: string;
  blueprint: string[];
  guidelines: string[];
  world: string[];
  tasks: string[];
  contentPlan: string[];
  notes: string[];
  calendar: string[];
  modules: string[];
}
