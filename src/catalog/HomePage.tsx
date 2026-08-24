import { Layers, Lightbulb, Search, Sparkles } from "lucide-react";
import type { Level } from "../core/types";
import { GROUP_ORDER, GROUPS, LEVELS, PATTERNS, TOTAL_VARIANTS, patternsByGroup } from "../core/registry";
import { cn } from "../core/cn";

export function HomePage({
  levelFilter,
  onExploreLevel,
  onOpenGroup,
}: {
  levelFilter: Level | null;
  onExploreLevel: (l: Level | null) => void;
  onOpenGroup: (g: (typeof GROUP_ORDER)[number]) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-8 sm:p-10">
        <div
          className="pointer-events-none absolute -top-24 -end-24 size-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#f2a93b,transparent 65%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -start-20 size-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#45c4b0,transparent 65%)" }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-[11.5px] font-medium text-accent">
            <Sparkles className="size-3.5" />
            Design System اتمیک · پلتفرم موسیقی
          </div>
          <h1 className="mt-4 max-w-xl font-disp text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            هر المان،
            <br />
            در همهٔ حالت‌هایش. <span className="text-accent">یک‌جا.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-ink-2">
            به‌جای «پروژه»، اینجا یک <b className="text-ink">کتابخانهٔ قابل مرور و جستجو</b> می‌سازی: موسیقی
            مثل Chordify و Moises، به‌صورت اتم → مولکول → ارگانیسم تفکیک شده؛ هر دکمه، اسلایدر، ویوفرم و
            انیمیشن فایل مستقل دارد و در کاتالوگ پایین، همهٔ واریانت‌هایش را زنده می‌بینی.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={PATTERNS.length} label="الگو" />
            <Stat value={TOTAL_VARIANTS} label="حالت تعاملی" />
            <Stat value={3} label="سطح اتمیک" />
            <Stat value={GROUP_ORDER.length} label="دسته" />
          </div>
        </div>
      </section>

      {/* levels */}
      <h2 className="mt-10 mb-3 flex items-center gap-2 font-disp text-[15px] font-bold text-ink">
        <Layers className="size-4 text-accent" />
        سطوح اتمیک
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((l) => {
          const count = PATTERNS.filter((p) => p.level === l.id).length;
          const active = levelFilter === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onExploreLevel(active ? null : l.id)}
              className={cn(
                "cursor-pointer rounded-2xl border bg-surface p-5 text-start transition-all hover:border-line-strong",
                active && "border-accent/60 bg-accent/6"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-3">{l.en}</span>
                <span className="rounded-full border border-line bg-white/4 px-2 py-0.5 font-mono text-[10.5px] text-ink-2">
                  {count}
                </span>
              </div>
              <div className="mt-2 text-[15px] font-bold text-ink">{l.fa}</div>
              <p className="mt-1.5 text-[12px] leading-5 text-ink-3">{l.desc}</p>
            </button>
          );
        })}
      </div>

      {/* groups */}
      <h2 className="mt-10 mb-3 font-disp text-[15px] font-bold text-ink">مرور بر اساس دسته</h2>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {GROUP_ORDER.map((g) => {
          const items = patternsByGroup(g);
          return (
            <button
              key={g}
              type="button"
              onClick={() => onOpenGroup(g)}
              className="group cursor-pointer rounded-2xl border border-line bg-surface p-4 text-start transition-all hover:border-line-strong hover:bg-raised"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-teal">{GROUPS[g].en}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{items.length}</span>
              </div>
              <div className="mt-1 text-[13.5px] font-medium text-ink">{GROUPS[g].fa}</div>
              <div className="mt-1.5 truncate text-[11px] text-ink-3 group-hover:text-ink-2">
                {items.map((p) => p.fa).join(" · ")}
              </div>
            </button>
          );
        })}
      </div>

      {/* tip */}
      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="text-[12.5px] leading-6 text-ink-2">
          <b className="text-ink">راه پیدا کردن:</b> از جستجوی بالای صفحه استفاده کن (مثلاً «بک دکمه»،
          «اسلایدر»، «استم») یا از سایدبار سطح و دسته را انتخاب کن. هر کارت، همهٔ واریانت‌ها را زنده نشان
          می‌دهد + کد استفاده‌اش را با یک کلیک کپی کن.
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 text-[12px] text-ink-3">
        <Search className="size-3.5" />
        جستجوی نمونه: «بازگشت» · «تمپو» · «ویوفرم» · «انیمیشن» · «mute»
      </div>
      <div className="h-16" />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-bg/60 px-3.5 py-2">
      <b className="font-mono text-[15px] text-accent">{value}</b>
      <span className="text-[11.5px] text-ink-3">{label}</span>
    </span>
  );
}
