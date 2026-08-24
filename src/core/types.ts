import type { ComponentType } from "react";

export type Level = "atom" | "molecule" | "organism";

export type GroupId =
  | "control"
  | "transport"
  | "mix"
  | "timeline"
  | "edit"
  | "layout"
  | "navigation"
  | "motion"
  | "feedback";

export interface VariantDemo {
  id: string;
  label: string;
  fa: string;
  props?: Record<string, unknown>;
  snippet: string;
  note?: string;
}

export interface PatternMeta {
  id: string;
  level: Level;
  groups: GroupId[];
  name: string;
  fa: string;
  description: string;
  tags: string[];
  source: string;
  path: string;
  variants: VariantDemo[];
}

export interface Pattern extends PatternMeta {
  Component: ComponentType<any>;
}
