import { Volume2 } from "lucide-react";
import type { PatternMeta } from "../../../core/types";

export const tooltipMeta: PatternMeta = {
  id: "tooltip",
  level: "atom",
  groups: ["feedback"],
  name: "Tooltip",
  fa: "تول‌تیپ",
  description:
    "راهنمای شناورِ قابل‌دسترس (Radix) برای دکمه‌های فقط-آیکون — با سه لحن رنگی: تیره، طلایی و هشدار.",
  tags: ["تولتیپ", "tooltip", "راهنما", "hint", "hover"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/kit.tsx",
  path: "src/ui/atoms/tooltip",
  variants: [
    {
      id: "top",
      label: "Top",
      fa: "بالا",
      props: { label: "افزایش حجم", children: <Volume2 /> },
      snippet: `<Tooltip label="افزایش حجم"><Volume2 /></Tooltip>`,
    },
    {
      id: "right",
      label: "Right",
      fa: "راست",
      props: { side: "right" as const, label: "سولو کردن استم", children: <Volume2 /> },
      snippet: `<Tooltip side="right" label="سولو کردن"><Volume2 /></Tooltip>`,
    },
    {
      id: "accent",
      label: "Accent",
      fa: "طلایی",
      props: { tone: "accent" as const, label: "TAP — ضرب‌گیری", children: <Volume2 /> },
      snippet: `<Tooltip tone="accent" label="TAP">…</Tooltip>`,
    },
  ],
};
