import type { PatternMeta } from "../../../core/types";

export const buttonMeta: PatternMeta = {
  id: "button",
  level: "atom",
  groups: ["control", "navigation"],
  name: "Button",
  fa: "دکمه",
  description:
    "دکمهٔ پایهٔ اکشن — در ۶ حالت ظاهری و ۴ اندازه. پایهٔ همهٔ الگوهای اکشن در پلتفرم؛ رنگ طلایی برای اکشن اصلی، حالت‌های نرم/خطی/مخفی برای کنش‌های ثانویه.",
  tags: ["دکمه", "button", "action", "cta", "اکشن"],
  source: "archive/1-music-interaction-ux-laboratory/src/components/kit.tsx",
  path: "src/ui/atoms/button",
  variants: [
    {
      id: "solid",
      label: "Solid",
      fa: "توپر/اصلی",
      props: { children: "پخش کن" },
      snippet: `<Button>پخش کن</Button>`,
    },
    {
      id: "soft",
      label: "Soft",
      fa: "نرم",
      props: { intent: "soft", children: "پخش کن" },
      snippet: `<Button intent="soft">پخش کن</Button>`,
    },
    {
      id: "outline",
      label: "Outline",
      fa: "خطی",
      props: { intent: "outline", children: "باز کردن" },
      snippet: `<Button intent="outline">باز کردن</Button>`,
    },
    {
      id: "ghost",
      label: "Ghost",
      fa: "مخفی",
      props: { intent: "ghost", children: "بیشتر" },
      snippet: `<Button intent="ghost">بیشتر</Button>`,
    },
    {
      id: "danger",
      label: "Danger",
      fa: "هشدار",
      props: { intent: "danger", children: "حذف ترک" },
      snippet: `<Button intent="danger">حذف ترک</Button>`,
    },
    {
      id: "sizes",
      label: "Sizes",
      fa: "اندازه‌ها",
      props: { children: "حجم" },
      note: "sm / md / lg / icon",
      snippet: `<Button size="lg">حجم</Button>`,
    },
  ],
};
