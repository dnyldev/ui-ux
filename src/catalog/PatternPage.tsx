import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Pattern } from "../core/types";
import { GROUPS, LEVEL_META, LEVELS } from "../core/registry";
import { cn } from "../core/cn";
import { CodeBlock } from "./CodeBlock";

export function PatternPage({ pattern, onHome }: { pattern: Pattern; onHome: () => void }) {
  const [openCode, setOpenCode] = useState<string | null>(null);
  const levelMeta = LEVEL_META[pattern.level];
  const level = LEVELS.find((l) => l.id === pattern.level);
  const variants = pattern.variants;

  return (
    <div className="mx-auto max-w-5xl">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-ink-3">
        <button type="button" onClick={onHome} className="cursor-pointer transition-colors hover:text-ink">
          خانه
        </button>
        <ChevronRight className="size-3.5" />
        <span>{level?.fa}</span>
        <ChevronRight className="size-3.5" />
        <span className="text-ink">{pattern.fa}</span>
      </nav>

      {/* title */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-disp text-3xl font-bold tracking-tight text-ink">
            {pattern.name}
            <span className="ms-3 text-lg font-normal text-ink-3">{pattern.fa}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", levelMeta.bg, levelMeta.color)}>
              {level?.en}
            </span>
            {pattern.groups.map((g) => (
              <span key={g} className="rounded-full border border-line bg-white/4 px-2.5 py-0.5 text-[11px] text-ink-2">
                {GROUPS[g].fa}
              </span>
            ))}
            <span className="rounded-full border border-line bg-white/4 px-2.5 py-0.5 font-mono text-[11px] text-ink-2">
              {variants.length} حالت
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-[14px] leading-7 text-ink-2">{pattern.description}</p>

      {/* file paths */}
      <div className="mt-4 flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3 font-mono text-[11px] text-ink-3">
        <div>
          <span className="me-2 text-ink-3/70">کامپوننت:</span>
          <span className="text-teal" dir="ltr">{pattern.path}/index.tsx</span>
        </div>
        <div>
          <span className="me-2 text-ink-3/70">متادیتا:</span>
          <span className="text-teal" dir="ltr">{pattern.path}/meta.ts</span>
        </div>
        <div>
          <span className="me-2 text-ink-3/70">منبع (دیتای اولیه):</span>
          <span className="text-ink-3" dir="ltr">{pattern.source}</span>
        </div>
      </div>

      {/* variants */}
      <h2 className="mt-8 mb-3 font-disp text-[15px] font-bold text-ink">
        همهٔ حالت‌ها <span className="font-normal text-ink-3">· {variants.length} مدل تعاملی</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
            {/* interactive stage */}
            <div className="flex min-h-28 items-center justify-center border-b border-line bg-white/[0.02] px-4 py-6">
              <pattern.Component {...v.props} />
            </div>
            {/* header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-ink">{v.fa}</div>
                <div className="truncate font-mono text-[10.5px] uppercase tracking-wide text-ink-3">{v.label}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpenCode(openCode === v.id ? null : v.id)}
                className={cn(
                  "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                  openCode === v.id
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-line bg-white/4 text-ink-2 hover:text-ink"
                )}
              >
                {openCode === v.id ? "بستن کد" : "کد"}
              </button>
            </div>
            {v.note && (
              <p className="px-4 pb-3 text-[11.5px] text-ink-3">💡 {v.note}</p>
            )}
            {openCode === v.id && (
              <div className="border-t border-line p-3">
                <CodeBlock code={v.snippet} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* usage note */}
      <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
        <h3 className="text-[13px] font-bold text-ink">استفاده در پلتفرم</h3>
        <p className="mt-1.5 text-[12.5px] leading-6 text-ink-2">
          هر الگو فقط از مسیر خودش ایمپورت می‌شود — بدون وابستگی به فایل‌های دیگر:
        </p>
        <div className="mt-3">
          <CodeBlock
            code={`import { ${pattern.name.replace(/[\s-]/g, "")} } from "@atomic-music-ui/${pattern.path.split("/").pop()}";`}
          />
        </div>
      </div>
    </div>
  );
}
