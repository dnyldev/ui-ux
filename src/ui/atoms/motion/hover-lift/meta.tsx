import type { PatternMeta } from "../../../../core/types";

export const hoverLiftMeta: PatternMeta = {
  id: "hover-lift",
  level: "atom",
  groups: ["motion", "layout"],
  name: "Hover Lift",
  fa: "بلند شدن در هاور",
  description:
    "لفافهٔ کارت‌ها و ردیف‌ها — با هاور، کارت نرم بالا می‌آید؛ برای لیست ترک‌ها، کارت‌های آلبوم و نتایج جستجو.",
  tags: ["انیمیشن", "motion", "hover", "هاور", "کارت", "card", "lift"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/primitives.tsx",
  path: "src/ui/atoms/motion/hover-lift",
  variants: [
    {
      id: "soft",
      label: "Lift 4",
      fa: "نرم",
      props: { children: <DemoCard /> },
      snippet: `<HoverLift><Card /></HoverLift>`,
    },
    {
      id: "strong",
      label: "Lift 8",
      fa: "بلند",
      props: { lift: 8 as const, children: <DemoCard /> },
      snippet: `<HoverLift lift={8}><Card /></HoverLift>`,
    },
  ],
};

function DemoCard() {
  return (
    <div className="w-32 rounded-xl border border-line bg-raised p-3 text-center text-xs text-ink-2">
      روی من هاور کن
    </div>
  );
}
