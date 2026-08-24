import type { PatternMeta } from "../../../core/types";

export const tempoControlMeta: PatternMeta = {
  id: "tempo-control",
  level: "molecule",
  groups: ["control", "transport"],
  name: "Tempo Control",
  fa: "کنترل تمپو",
  description:
    "تمپو (BPM) در ۴ مدل ورودی: دکمه‌های +/− ، ناب چرخشی، TAP برای ضرب‌گیری از روی ریتم، و حالت فشرده برای هدرها.",
  tags: ["تمپو", "tempo", "bpm", "ریتم", "tap", "ضرب"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/TempoLab.tsx",
  path: "src/ui/molecules/tempo-control",
  variants: [
    {
      id: "stepper",
      label: "Stepper",
      fa: "دکمه‌ای",
      props: {},
      snippet: `<TempoControl />`,
    },
    {
      id: "knob",
      label: "Knob",
      fa: "ناب چرخشی",
      props: { variant: "knob" as const },
      snippet: `<TempoControl variant="knob" />`,
    },
    {
      id: "tap",
      label: "Tap",
      fa: "ضرب‌گیری",
      props: { variant: "tap" as const },
      note: "چند بار TAP بزن",
      snippet: `<TempoControl variant="tap" />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { variant: "compact" as const },
      snippet: `<TempoControl variant="compact" />`,
    },
  ],
};
