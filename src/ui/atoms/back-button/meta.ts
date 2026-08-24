import type { PatternMeta } from "../../../core/types";

export const backButtonMeta: PatternMeta = {
  id: "back-button",
  level: "atom",
  groups: ["navigation"],
  name: "Back Button",
  fa: "دکمه بازگشت",
  description:
    "دکمهٔ بازگشت در ۶ حالت: دایره‌ای برجسته، خطی، نرم، قرصی با متن، متنی و مخفی — پرکاربردترین الگوی ناوبری در هدر پلیر و صفحات جزئیات.",
  tags: ["بازگشت", "back", "navigation", "header", "دکمه", "button"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/core.tsx",
  path: "src/ui/atoms/back-button",
  variants: [
    {
      id: "circular",
      label: "Circular · solid",
      fa: "دایره‌ای برجسته",
      props: { intent: "circular" },
      snippet: `<BackButton intent="circular" />`,
    },
    {
      id: "outline",
      label: "Outline",
      fa: "دایره‌ای خطی",
      props: { intent: "outline" },
      snippet: `<BackButton intent="outline" />`,
    },
    {
      id: "soft",
      label: "Soft",
      fa: "نرم",
      props: { intent: "soft" },
      snippet: `<BackButton intent="soft" />`,
    },
    {
      id: "pill",
      label: "Pill",
      fa: "قرصی با متن",
      props: { intent: "pill", label: "بازگشت به لیست" },
      snippet: `<BackButton intent="pill" label="بازگشت به لیست" />`,
    },
    {
      id: "labeled",
      label: "Labeled",
      fa: "متنی با فلش",
      props: { intent: "labeled", label: "همهٔ ترک‌ها" },
      snippet: `<BackButton intent="labeled" label="همهٔ ترک‌ها" />`,
    },
    {
      id: "ghost",
      label: "Ghost",
      fa: "مخفی",
      props: { intent: "ghost" },
      snippet: `<BackButton intent="ghost" />`,
    },
  ],
};
