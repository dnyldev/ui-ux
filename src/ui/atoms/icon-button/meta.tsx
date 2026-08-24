import { MoreHorizontal, Play, Volume2, VolumeX } from "lucide-react";
import type { PatternMeta } from "../../../core/types";

export const iconButtonMeta: PatternMeta = {
  id: "icon-button",
  level: "atom",
  groups: ["control", "navigation"],
  name: "Icon Button",
  fa: "دکمه آیکونی",
  description:
    "دکمهٔ مربعیِ فقط-آیکون برای تولبارها، کنترل‌های پخش و ردیف‌ها — با حالت فعال (active) برای دکمه‌های روشن/خاموش.",
  tags: ["آیکون", "icon", "toolbar", "دکمه", "button"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/kit.tsx",
  path: "src/ui/atoms/icon-button",
  variants: [
    {
      id: "default",
      label: "Default",
      fa: "پیش‌فرض",
      props: { children: <Play />, "aria-label": "پخش" },
      snippet: `<IconButton aria-label="پخش"><Play /></IconButton>`,
    },
    {
      id: "subtle",
      label: "Subtle",
      fa: "لطیف/پس‌زمینه",
      props: { intent: "subtle", children: <MoreHorizontal />, "aria-label": "بیشتر" },
      snippet: `<IconButton intent="subtle"><MoreHorizontal /></IconButton>`,
    },
    {
      id: "active",
      label: "Active",
      fa: "فعال (روشن)",
      props: { intent: "active", children: <Volume2 />, "aria-label": "صدا" },
      snippet: `<IconButton intent="active"><Volume2 /></IconButton>`,
    },
    {
      id: "danger",
      label: "Danger",
      fa: "هشدار",
      props: { intent: "danger", children: <VolumeX />, "aria-label": "بی‌صدا" },
      snippet: `<IconButton intent="danger"><VolumeX /></IconButton>`,
    },
    {
      id: "sizes",
      label: "Sizes",
      fa: "اندازه‌ها",
      props: { children: <Play />, "aria-label": "پخش" },
      note: "sm / md / lg",
      snippet: `<IconButton size="sm"><Play /></IconButton>`,
    },
  ],
};
