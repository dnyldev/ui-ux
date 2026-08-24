import type { PatternMeta } from "../../../core/types";

export const seekBarMeta: PatternMeta = {
  id: "seek-bar",
  level: "molecule",
  groups: ["transport", "timeline"],
  name: "Seek Bar",
  fa: "نوار جست‌وجو در زمان",
  description:
    "نوار جست‌وجو/اسکراب با زمان فعلی و کل — قلب ناوبری زمانی پلیر؛ قابل استفاده در هدر پلیر، تایم‌لاین و میکسر.",
  tags: ["سیک", "seek", "scrub", "زمان", "time", "پلیر"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/PlaybackLab.tsx",
  path: "src/ui/molecules/seek-bar",
  variants: [
    {
      id: "times",
      label: "With times",
      fa: "با زمان‌ها",
      props: {},
      snippet: `<SeekBar />`,
    },
    {
      id: "minimal",
      label: "Minimal",
      fa: "مینیمال",
      props: { variant: "minimal" as const },
      snippet: `<SeekBar variant="minimal" />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<SeekBar tone="teal" />`,
    },
  ],
};
