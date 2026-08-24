import type { PatternMeta } from "../../../core/types";

export const eqBandsMeta: PatternMeta = {
  id: "eq-bands",
  level: "molecule",
  groups: ["mix", "control"],
  name: "EQ Bands",
  fa: "باندهای EQ",
  description:
    "ویرایشگر باندهای اکولایزر به‌صورت عمودی — با کشیدن هر باند بالا/پایین؛ برای پنل EQ و شکل‌دهی به استم‌ها.",
  tags: ["اکولایزر", "eq", "equalizer", "باند", "frequency", "میکس"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/EQLab.tsx",
  path: "src/ui/molecules/eq-bands",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      note: "باندها را بکش",
      snippet: `<EqBands />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<EqBands tone="teal" />`,
    },
    {
      id: "violet",
      label: "Violet",
      fa: "بنفش",
      props: { tone: "violet" as const },
      snippet: `<EqBands tone="violet" />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { size: "compact" as const },
      snippet: `<EqBands size="compact" />`,
    },
  ],
};
