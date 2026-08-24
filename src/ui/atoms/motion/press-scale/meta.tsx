import { Play } from "lucide-react";
import type { PatternMeta } from "../../../../core/types";
import { cn } from "../../../../core/cn";

export const pressScaleMeta: PatternMeta = {
  id: "press-scale",
  level: "atom",
  groups: ["motion", "control"],
  name: "Press Scale",
  fa: "فشردن فنری",
  description:
    "لفافهٔ دکمه با بازخورد فنریِ فشردن (spring tap) — هر کنترل اکشنی را در آن بپیچ تا حس فیزیکیِ «کلیک» بگیرد.",
  tags: ["انیمیشن", "motion", "press", "tap", "فنر", "spring", "دکمه"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/kit.tsx",
  path: "src/ui/atoms/motion/press-scale",
  variants: [
    {
      id: "default",
      label: "Scale .94",
      fa: "فشردن معمولی",
      props: { children: <DemoIcon /> },
      snippet: `<PressScale><Play /></PressScale>`,
    },
    {
      id: "strong",
      label: "Scale .86",
      fa: "فشردن قوی",
      props: { scale: 0.86 as const, children: <DemoIcon /> },
      snippet: `<PressScale scale={0.86}><Play /></PressScale>`,
    },
  ],
};

function DemoIcon() {
  return (
    <span
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-accent text-[#1a1305] shadow-[0_8px_22px_-8px_rgba(242,169,59,0.65)]"
      )}
    >
      <Play className="size-5 fill-current" />
    </span>
  );
}
