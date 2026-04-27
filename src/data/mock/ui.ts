import { BrandId } from "@/types";

export const brandWorkspaceOrder: BrandId[] = [
  "aai",
  "masteryatelier",
  "mo-studio",
  "personal",
  "biro",
];

export const navigation = [
  { href: "/", label: "Home", marker: "00" },
  { href: "/brands", label: "Brands", marker: "01" },
  { href: "/projects", label: "Projects", marker: "02" },
  { href: "/calendar", label: "Calendar", marker: "03" },
  { href: "/tasks", label: "Actions", marker: "04" },
  { href: "/notes", label: "Thinking", marker: "05" },
  { href: "/prompts", label: "Prompts", marker: "06" },
] as const;

export const mobileNavigation = navigation;

export const workspaceSections = [
  "Overview",
  "Strategy",
  "Content",
  "Projects",
  "Prompts",
  "Thinking",
  "Actions",
] as const;
