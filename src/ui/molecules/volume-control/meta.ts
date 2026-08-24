import type { PatternMeta } from "../../../core/types";

export const volumeControlMeta: PatternMeta = {
  id: "volume-control",
  level: "molecule",
  groups: ["control", "mix"],
  name: "Volume Control",
  fa: "کنترل صدا",
  description:
    "خوشهٔ صدا: دکمهٔ بی‌صدا با تول‌تیپ + اسلایدر + درصد — در حالت فشرده برای هدرهای کوچک و حالت کامل برای پلیر.",
  tags: ["صدا", "volume", "ولوم", "میکس", "mute"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/VolumeLab.tsx",
  path: "src/ui/molecules/volume-control",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      snippet: `<VolumeControl />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { variant: "compact" as const },
      snippet: `<VolumeControl variant="compact" />`,
    },
    {
      id: "teal",
      label: "Teal",
      fa: "فیروزه‌ای",
      props: { tone: "teal" as const },
      snippet: `<VolumeControl tone="teal" />`,
    },
  ],
};
