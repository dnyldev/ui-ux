import type { PatternMeta } from "../../../core/types";

export const timelineMeta: PatternMeta = {
  id: "timeline",
  level: "organism",
  groups: ["timeline", "edit"],
  name: "Timeline",
  fa: "تایم‌لاین ویرایش",
  description:
    "نمای آرایش (Chordify-style): خط‌کش زمان، ویوفرم با ناحیهٔ لوپ، تیک‌های ضرب، کوردها و تمپو — همه در یک نوار همگام.",
  tags: ["تایم‌لاین", "timeline", "ویرایش", "edit", "کورد", "chord", "لوپ", "loop"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/ChordLab.tsx",
  path: "src/ui/organisms/timeline",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      note: "روی ویوفرم کلیک کن",
      snippet: `<Timeline />`,
    },
    {
      id: "grid",
      label: "Grid",
      fa: "با خطوط شبکه",
      props: { variant: "grid" as const },
      snippet: `<Timeline variant="grid" />`,
    },
    {
      id: "markers",
      label: "Markers",
      fa: "با تیک‌های ضرب",
      props: { variant: "markers" as const },
      snippet: `<Timeline variant="markers" />`,
    },
  ],
};
