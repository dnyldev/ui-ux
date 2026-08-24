import type { PatternMeta } from "../../../core/types";

export const playerBarMeta: PatternMeta = {
  id: "player-bar",
  level: "organism",
  groups: ["transport", "layout"],
  name: "Player Bar",
  fa: "نوار پلیر",
  description:
    "پلیر کامل: آرت‌ورک، اطلاعات ترک، کنترل‌های پخش، سی‌ک‌بار و صدا — در ۳ حالت: پیش‌فرض، فشرده و گسترده (با ویوفرم و تمپو).",
  tags: ["پلیر", "player", "پخش", "transport", "نوار پایین", "player bar"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/transport.tsx",
  path: "src/ui/organisms/player-bar",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: {},
      snippet: `<PlayerBar />`,
    },
    {
      id: "compact",
      label: "Compact",
      fa: "فشرده",
      props: { variant: "compact" as const },
      snippet: `<PlayerBar variant="compact" />`,
    },
    {
      id: "expanded",
      label: "Expanded",
      fa: "گسترده",
      props: { variant: "expanded" as const },
      snippet: `<PlayerBar variant="expanded" />`,
    },
  ],
};
