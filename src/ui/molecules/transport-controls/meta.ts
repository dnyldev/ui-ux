import type { PatternMeta } from "../../../core/types";

export const transportControlsMeta: PatternMeta = {
  id: "transport-controls",
  level: "molecule",
  groups: ["transport"],
  name: "Transport Controls",
  fa: "کنترل‌های پخش",
  description:
    "خوشهٔ کنترل پخش: شافل، قبلی، پخش/توقف، بعدی، لوپ — با تول‌تیپ فارسی، حالت فعال برای لوپ/شافل و سه چیدمان.",
  tags: ["پخش", "play", "transport", "کنترل", "پلیر", "player", "لوپ"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/PlaybackLab.tsx",
  path: "src/ui/molecules/transport-controls",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      note: "روی پخش کلیک کن",
      snippet: `<TransportControls />`,
    },
    {
      id: "minimal",
      label: "Minimal",
      fa: "مینیمال",
      props: { variant: "minimal" as const },
      snippet: `<TransportControls variant="minimal" />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { variant: "compact" as const, size: "sm" as const },
      snippet: `<TransportControls variant="compact" size="sm" />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<TransportControls tone="teal" />`,
    },
  ],
};
