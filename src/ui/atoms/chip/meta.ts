import type { PatternMeta } from "../../../core/types";

export const chipMeta: PatternMeta = {
  id: "chip",
  level: "atom",
  groups: ["feedback", "control"],
  name: "Chip / Badge",
  fa: "چیپ و برچسب",
  description:
    "قرصِ کوتاه برای برچسب وضعیت، کلیدواژه یا فیلتر قابل‌انتخاب — با نقطهٔ وضعیت (dot) و حالت انتخاب‌شونده (selectable) برای فیلترهای استم و ژانر.",
  tags: ["چیپ", "chip", "badge", "برچسب", "tag", "فیلتر", "status"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/primitives.tsx",
  path: "src/ui/atoms/chip",
  variants: [
    {
      id: "neutral",
      label: "Neutral",
      fa: "خنثی",
      props: { children: "Pop" },
      snippet: `<Chip>Pop</Chip>`,
    },
    {
      id: "accent",
      label: "Accent",
      fa: "طلایی",
      props: { intent: "accent", children: "۴/۴" },
      snippet: `<Chip intent="accent">۴/۴</Chip>`,
    },
    {
      id: "status",
      label: "Status dot",
      fa: "نقطهٔ وضعیت",
      props: { intent: "success", dot: true, children: "آماده" },
      snippet: `<Chip intent="success" dot>آماده</Chip>`,
    },
    {
      id: "danger",
      label: "Danger",
      fa: "هشدار",
      props: { intent: "danger", dot: true, children: "ناسازگار" },
      snippet: `<Chip intent="danger" dot>ناسازگار</Chip>`,
    },
    {
      id: "selectable",
      label: "Selectable",
      fa: "قابل انتخاب",
      props: { selectable: true, children: "Vibes" },
      note: "روی آن کلیک کن",
      snippet: `<Chip selectable>Vibes</Chip>`,
    },
    {
      id: "sizes",
      label: "Sizes",
      fa: "اندازه‌ها",
      props: { children: "Lo-Fi" },
      note: "sm / md",
      snippet: `<Chip size="sm">Lo-Fi</Chip>`,
    },
  ],
};
