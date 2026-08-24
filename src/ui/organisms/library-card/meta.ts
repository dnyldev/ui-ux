import type { PatternMeta } from "../../../core/types";

export const libraryCardMeta: PatternMeta = {
  id: "library-card",
  level: "organism",
  groups: ["layout", "transport"],
  name: "Library Card",
  fa: "کارت کتابخانه",
  description:
    "کارت ترک برای کتابخانه و نتایج جستجو — عمودی برای گرید آلبوم، ردیفی برای لیست، و حالت «در حال پخش» با اکولایزر زنده.",
  tags: ["کارت", "card", "کتابخانه", "library", "ترک", "track", "لیست"],
  source: "archive/qwen-music-interaction-ux-laboratory/src/domains/mix.tsx",
  path: "src/ui/organisms/library-card",
  variants: [
    {
      id: "vertical",
      label: "Vertical",
      fa: "عمودی/گرید",
      props: {},
      snippet: `<LibraryCard />`,
    },
    {
      id: "row",
      label: "Row",
      fa: "ردیفی",
      props: { variant: "row" as const },
      snippet: `<LibraryCard variant="row" />`,
    },
    {
      id: "selected",
      label: "Selected",
      fa: "در حال پخش",
      props: { variant: "selected" as const },
      snippet: `<LibraryCard variant="selected" />`,
    },
  ],
};
