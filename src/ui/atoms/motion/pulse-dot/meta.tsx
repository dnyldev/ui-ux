import type { PatternMeta } from "../../../../core/types";

export const pulseDotMeta: PatternMeta = {
  id: "pulse-dot",
  level: "atom",
  groups: ["motion", "feedback"],
  name: "Pulse Dot",
  fa: "نقطهٔ تپنده",
  description:
    "نقطهٔ وضعیت با هالهٔ تپنده — برای ضبط، استریم، اتصال فعال یا «آنلاین». با رنگ‌های وضعیت و برچسب اختیاری.",
  tags: ["نقطه", "pulse", "status", "وضعیت", "ضبط", "record", "streaming"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/App.tsx (status chip)",
  path: "src/ui/atoms/motion/pulse-dot",
  variants: [
    {
      id: "green",
      label: "Online",
      fa: "آنلاین",
      props: { label: "در حال ضبط" },
      snippet: `<PulseDot label="در حال ضبط" />`,
    },
    {
      id: "accent",
      label: "Accent",
      fa: "طلایی",
      props: { tone: "accent" as const, label: "استریم" },
      snippet: `<PulseDot tone="accent" label="استریم" />`,
    },
    {
      id: "red",
      label: "Recording",
      fa: "ضبط",
      props: { tone: "red" as const, label: "REC" },
      snippet: `<PulseDot tone="red" label="REC" />`,
    },
    {
      id: "bare",
      label: "Bare",
      fa: "بدون برچسب",
      props: { tone: "teal" as const, size: "sm" as const },
      snippet: `<PulseDot tone="teal" size="sm" />`,
    },
  ],
};
