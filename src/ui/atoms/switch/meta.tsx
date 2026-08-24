import { Volume2 } from "lucide-react";
import type { PatternMeta } from "../../../core/types";

export const switchMeta: PatternMeta = {
  id: "switch",
  level: "atom",
  groups: ["control", "feedback"],
  name: "Switch",
  fa: "سوئیچ",
  description:
    "سوئیچ روشن/خاموش قابل‌دسترس (Radix) — برای حالت‌هایی مثل لوپ، شافل، میک، سولو یا نمایش نت‌ها؛ با امکان آیکون داخل دستگیره.",
  tags: ["سوئیچ", "switch", "toggle", "روشن", "خاموش", "loop"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/transport.tsx",
  path: "src/ui/atoms/switch",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: { defaultChecked: true, "aria-label": "لوپ" },
      snippet: `<Switch defaultChecked aria-label="لوپ" />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal", defaultChecked: true, "aria-label": "سولو" },
      snippet: `<Switch tone="teal" defaultChecked aria-label="سولو" />`,
    },
    {
      id: "violet",
      label: "Violet",
      fa: "بنفش",
      props: { tone: "violet", "aria-label": "نمایش نت" },
      snippet: `<Switch tone="violet" aria-label="نمایش نت" />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { size: "sm", defaultChecked: true, "aria-label": "میک" },
      snippet: `<Switch size="sm" defaultChecked aria-label="میک" />`,
    },
    {
      id: "with-icon",
      label: "With icon",
      fa: "با آیکون",
      props: { icon: <Volume2 />, defaultChecked: true, "aria-label": "صدا" },
      snippet: `<Switch icon={<Volume2 />} defaultChecked aria-label="صدا" />`,
    },
    {
      id: "disabled",
      label: "Disabled",
      fa: "غیرفعال",
      props: { disabled: true, "aria-label": "غیرفعال" },
      snippet: `<Switch disabled aria-label="غیرفعال" />`,
    },
  ],
};
