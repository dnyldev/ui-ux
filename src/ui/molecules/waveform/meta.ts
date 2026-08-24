import type { PatternMeta } from "../../../core/types";

export const waveformMeta: PatternMeta = {
  id: "waveform",
  level: "molecule",
  groups: ["timeline", "edit"],
  name: "Waveform",
  fa: "ویوفرم",
  description:
    "آبشار نوارهای صوتی با پیشرفت پخش و ناحیهٔ انتخاب (لوپ) — کلیک = جست‌وجو در زمان. هستهٔ ویرایشگر، تایم‌لاین و پلیر.",
  tags: ["ویوفرم", "waveform", "موج", "wave", "selection", "انتخاب", "پخش"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/WaveformLab.tsx",
  path: "src/ui/molecules/waveform",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      note: "روی موج کلیک کن",
      snippet: `<Waveform />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<Waveform tone="teal" />`,
    },
    {
      id: "violet",
      label: "Violet",
      fa: "بنفش",
      props: { tone: "violet" as const },
      snippet: `<Waveform tone="violet" />`,
    },
    {
      id: "selection",
      label: "With selection",
      fa: "با ناحیهٔ انتخاب",
      props: { selection: [0.18, 0.42] as [number, number], progress: 0.1 as const },
      snippet: `<Waveform selection={[0.18, 0.42]} />`,
    },
    {
      id: "dense",
      label: "Dense",
      fa: "پرتراکم",
      props: { bars: 120 as const, height: 40 as const },
      snippet: `<Waveform bars={120} height={40} />`,
    },
  ],
};
