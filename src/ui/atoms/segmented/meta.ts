import type { PatternMeta } from "../../../core/types";

export const segmentedMeta: PatternMeta = {
  id: "segmented",
  level: "atom",
  groups: ["control", "motion"],
  name: "Segmented Control",
  fa: "کنترل سگمنت",
  description:
    "دکمه‌های گروهی با نشانگر لغزنده (spring) — برای جابه‌جایی بین نماها: موج/استم/کورد، یا انتخاب کیفیت و دامنه.",
  tags: ["سگمنت", "segmented", "tab", "تب", "switch", "نما"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/lib/core.tsx",
  path: "src/ui/atoms/segmented",
  variants: [
    {
      id: "pill",
      label: "Pill",
      fa: "قرصی",
      props: { options: "WAVES·STEMS·CHORDS".split("·").map((label) => ({ value: label, label })) },
      snippet: `<Segmented options={[{ value: "waves", label: "Waves" } /* … */]} />`,
    },
    {
      id: "underline",
      label: "Underline",
      fa: "زیرخطی",
      props: {
        variant: "underline",
        options: "همه·اخیراً·پلی‌لیست".split("·").map((label) => ({ value: label, label })),
      },
      snippet: `<Segmented variant="underline" options={[{ value: "all", label: "همه" } /* … */]} />`,
    },
    {
      id: "sizes",
      label: "Sizes",
      fa: "اندازه‌ها",
      props: {
        options: "sm/md/lg".split("/").map((label) => ({ value: label, label })),
        size: "sm" as const,
      },
      note: "sm · md · lg",
      snippet: `<Segmented size="sm" options={[…] />`,
    },
  ],
};
