import type { PatternMeta } from "../../../core/types";
import { STEMS } from "./index";

export const stemRowMeta: PatternMeta = {
  id: "stem-row",
  level: "molecule",
  groups: ["mix", "timeline"],
  name: "Stem Row",
  fa: "ردیف استم",
  description:
    "ردیف هر استم (وکال/درام/بیس/سایر) با متر سطح، بی‌صدا و سولو — تجربهٔ جداسازی صدا به سبک Moises.",
  tags: ["استم", "stem", "وکال", "vocals", "mute", "solo", "تفکیک", "جداسازی"],
  source: "archive/1-music-interaction-ux-laboratory/src/labs/StemMixerLab.tsx",
  path: "src/ui/molecules/stem-row",
  variants: [
    {
      id: "vocals",
      label: "Vocals",
      fa: "وکال",
      props: {},
      snippet: `<StemRow />`,
    },
    {
      id: "drums",
      label: "Drums",
      fa: "درام",
      props: { stem: STEMS[1] },
      snippet: `<StemRow stem={STEMS.drums} />`,
    },
    {
      id: "bass",
      label: "Bass",
      fa: "بیس",
      props: { stem: STEMS[2] },
      snippet: `<StemRow stem={STEMS.bass} />`,
    },
    {
      id: "selected",
      label: "Selected",
      fa: "انتخاب‌شده",
      props: { stem: STEMS[0], selected: true },
      snippet: `<StemRow stem={STEMS.vocals} selected />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { stem: STEMS[3], compact: true },
      snippet: `<StemRow stem={STEMS.other} compact />`,
    },
  ],
};
