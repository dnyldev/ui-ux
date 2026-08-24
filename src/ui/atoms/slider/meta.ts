import type { PatternMeta } from "../../../core/types";

export const sliderMeta: PatternMeta = {
  id: "slider",
  level: "atom",
  groups: ["control"],
  name: "Slider",
  fa: "اسلایدر خطی",
  description:
    "اسلایدر قابل‌دسترس (Radix) با سه رنگ و دو اندازه + نشانگر زندهٔ مقدار — مادرِ ولوم، سی‌کی‌بار، تمپو و EQ.",
  tags: ["اسلایدر", "slider", "range", "volume", "seek", "مقدار"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/transport.tsx",
  path: "src/ui/atoms/slider",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: { defaultValue: 65 },
      snippet: `<Slider defaultValue={65} />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal", defaultValue: 40 },
      snippet: `<Slider tone="teal" defaultValue={40} />`,
    },
    {
      id: "violet",
      label: "Violet",
      fa: "بنفش",
      props: { tone: "violet", defaultValue: 80 },
      snippet: `<Slider tone="violet" defaultValue={80} />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { size: "sm", defaultValue: 55 },
      snippet: `<Slider size="sm" defaultValue={55} />`,
    },
    {
      id: "with-value",
      label: "With value",
      fa: "با نشانگر مقدار",
      props: { showValue: true, defaultValue: 33 },
      snippet: `<Slider showValue defaultValue={33} />`,
    },
    {
      id: "format",
      label: "Formatted",
      fa: "فرمت‌شده (BPM)",
      props: { showValue: true, defaultValue: 120, max: 220, format: (v: number) => `${v} BPM` },
      snippet: `<Slider showValue max={220} format={(v) => \`${"${v}"} BPM\`} />`,
    },
  ],
};
