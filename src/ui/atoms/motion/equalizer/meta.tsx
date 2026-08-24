import type { PatternMeta } from "../../../../core/types";

export const equalizerMeta: PatternMeta = {
  id: "equalizer-bars",
  level: "atom",
  groups: ["motion", "feedback"],
  name: "Equalizer Bars",
  fa: "اکولایزر متحرک",
  description:
    "نوارهای اکولایزر متحرک — نشانگر «در حال پخش» برای کارت ترک، متر استم‌ها و لوگو؛ با کنترل توقف (active=false).",
  tags: ["اکولایزر", "equalizer", "animation", "انیمیشن", "playing", "در حال پخش"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/App.tsx (logo)",
  path: "src/ui/atoms/motion/equalizer",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      snippet: `<EqualizerBars />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<EqualizerBars tone="teal" />`,
    },
    {
      id: "wide",
      label: "Wide",
      fa: "پهن",
      props: { bars: 9 as const, height: 22 as const },
      snippet: `<EqualizerBars bars={9} height={22} />`,
    },
    {
      id: "paused",
      label: "Paused",
      fa: "متوقف",
      props: { active: false as const },
      snippet: `<EqualizerBars active={false} />`,
    },
  ],
};
