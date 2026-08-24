import type { PatternMeta } from "../../../core/types";

export const knobMeta: PatternMeta = {
  id: "knob",
  level: "atom",
  groups: ["control"],
  name: "Knob",
  fa: "ناب (کنترل چرخشی)",
  description:
    "کنترل‌گر چرخشی: با کشیدن عمودی یا کلیدهای جهت‌دار مقدار را عوض کن — کلاسیک برای تمپو، پیچ، درایو و ری‌ورب در پلیرهای حرفه‌ای.",
  tags: ["ناب", "knob", "rotary", "تمپو", "tempo", "pitch", "کنترل"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/tone.tsx",
  path: "src/ui/atoms/knob",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: { defaultValue: 66 },
      snippet: `<Knob defaultValue={66} />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal", defaultValue: 30 },
      snippet: `<Knob tone="teal" defaultValue={30} />`,
    },
    {
      id: "violet",
      label: "Violet",
      fa: "بنفش",
      props: { tone: "violet", defaultValue: 82 },
      snippet: `<Knob tone="violet" defaultValue={82} />`,
    },
    {
      id: "tempo",
      label: "Tempo",
      fa: "تمپو (BPM)",
      props: {
        label: "TEMPO",
        defaultValue: 120,
        min: 40,
        max: 220,
        format: (v: number) => `${v} BPM`,
      },
      snippet: `<Knob label="TEMPO" min={40} max={220} format={(v) => \`${"${v}"} BPM\`} />`,
    },
    {
      id: "sizes",
      label: "Sizes",
      fa: "اندازه‌ها",
      props: {},
      note: "sm / md / lg",
      snippet: `<Knob size="lg" />`,
    },
  ],
};
