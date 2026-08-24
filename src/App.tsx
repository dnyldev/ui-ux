import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Level, Pattern } from "./core/types";
import {
  GROUP_ORDER,
  GROUPS,
  LEVEL_META,
  LEVELS,
  PATTERNS,
  TOTAL_VARIANTS,
  patternsByLevel,
  searchPatterns,
} from "./core/registry";
import { cn } from "./core/cn";
import { EqualizerBars } from "./ui/atoms/motion/equalizer";
import { HomePage } from "./catalog/HomePage";
import { PatternPage } from "./catalog/PatternPage";

export default function App() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<Level | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const searching = query.trim().length > 0;
  const results = useMemo(() => (searching ? searchPatterns(query) : []), [query, searching]);
  const active = activeId ? PATTERNS.find((p) => p.id === activeId) ?? null : null;

  return (
    <div className="min-h-screen">
      {/* ===== header ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveId(null);
              setQuery("");
              setLevelFilter(null);
            }}
            className="flex shrink-0 items-center gap-2.5 cursor-pointer"
            aria-label="خانه"
          >
            <span className="flex size-9 items-center justify-center rounded-xl border border-accent/35 bg-gradient-to-b from-raised to-bg">
              <EqualizerBars bars={4} height={14} />
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block font-disp text-[14px] font-bold tracking-tight text-ink">
                ATOMIC<span className="text-accent">·</span>MUSIC
              </span>
              <span className="mt-1 block text-[10px] text-ink-3">کتابخانه طراحی اتمیک</span>
            </span>
          </button>

          {/* search */}
          <div className="relative mx-auto w-full max-w-md">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (activeId) setActiveId(null);
              }}
              placeholder="جستجو: بک دکمه، اسلایدر، استم، انیمیشن…"
              className="h-10 w-full rounded-xl border border-line bg-surface ps-9 pe-4 text-[13px] text-ink placeholder:text-ink-3 outline-none transition-colors focus:border-accent/50"
            />
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[10.5px] text-ink-2 md:inline-flex">
            <span className="size-1.5 rounded-full bg-green shadow-[0_0_6px_#4cc9a6]" />
            {PATTERNS.length} الگو · {TOTAL_VARIANTS} حالت
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] items-start gap-6 px-4 sm:px-6">
        {/* ===== sidebar ===== */}
        <aside className="sticky top-16 hidden max-h-[calc(100vh-64px)] w-64 shrink-0 self-start overflow-y-auto py-6 pe-1 lg:block">
          {searching ? (
            <div>
              <SidebarTitle>نتایج</SidebarTitle>
              <div className="mb-1 grid grid-cols-1 gap-1">
                {results.map((p) => (
                  <SidebarItem key={p.id} pattern={p} active={false} onOpen={() => setActiveId(p.id)} />
                ))}
                {results.length === 0 && <p className="px-2 py-3 text-[12px] text-ink-3">چیزی پیدا نشد.</p>}
              </div>
              <p className="mt-2 px-2 text-[11px] leading-5 text-ink-3">
                جستجو روی نام فارسی/انگلیسی، تگ‌ها و توضیحات کار می‌کند.
              </p>
            </div>
          ) : (
            LEVELS.map((l) => {
              const levelPatterns = patternsByLevel(levelFilter && levelFilter !== l.id ? null : l.id);
              const has = levelPatterns.length > 0;
              if (!has) return null;
              return (
                <section key={l.id} className="mb-6">
                  <div className="mb-1.5 flex items-baseline justify-between px-2">
                    <h3 className="text-[10px] font-bold tracking-[0.18em] text-ink-3">
                      {l.en}
                      <span className="ms-1.5 font-normal tracking-normal text-ink-3/70">{l.fa}</span>
                    </h3>
                    <span className="font-mono text-[10px] text-ink-3">{levelPatterns.length}</span>
                  </div>
                  <SidebarGroup level={l.id} onOpen={(id) => setActiveId(id)} activeId={activeId} />
                </section>
              );
            })
          )}
        </aside>

        {/* ===== main ===== */}
        <main className="min-w-0 flex-1 py-6">
          {active ? (
            <PatternPage pattern={active} onHome={() => setActiveId(null)} />
          ) : searching ? (
            <ResultsGrid results={results} onOpen={(id) => setActiveId(id)} query={query} />
          ) : (
            <HomePage
              levelFilter={levelFilter}
              onExploreLevel={(l) => setLevelFilter(l)}
              onOpenGroup={(g) => {
                setLevelFilter(null);
                setQuery(GROUPS[g].fa);
              }}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-line py-6 text-center text-[11px] text-ink-3">
        ATOMIC·MUSIC — کتابخانه الگوهای اتمیک برای پلتفرم موسیقی · دادهٔ اولیه در{' '}
        <span className="font-mono" dir="ltr">archive/</span> نگهداری می‌شود
      </footer>
    </div>
  );
}

/* ================= internals ================= */

function SidebarTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 px-2 text-[10px] font-bold tracking-[0.18em] text-ink-3">{children}</h3>
  );
}

function SidebarGroup({
  level,
  activeId,
  onOpen,
}: {
  level: Level;
  activeId: string | null;
  onOpen: (id: string) => void;
}) {
  const items = patternsByLevel(level);
  return (
    <div className="grid gap-0.5">
      {GROUP_ORDER.map((g) => {
        const groupItems = items.filter((p) => p.groups.includes(g));
        if (groupItems.length === 0) return null;
        return (
          <div key={g} className="mb-2 last:mb-0">
            <div className="mb-0.5 px-2 text-[10px] text-ink-3/70">{GROUPS[g].fa}</div>
            {groupItems.map((p) => (
              <SidebarItem key={p.id} pattern={p} active={activeId === p.id} onOpen={() => onOpen(p.id)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SidebarItem({
  pattern,
  active,
  onOpen,
}: {
  pattern: Pattern;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-[7px] text-start transition-colors",
        active ? "border border-accent/40 bg-accent/8" : "hover:bg-white/4"
      )}
    >
      <span className={cn("truncate text-[12.5px]", active ? "font-medium text-accent" : "text-ink-2")}>
        {pattern.fa}
      </span>
      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wide text-ink-3">{pattern.name}</span>
    </button>
  );
}

function ResultsGrid({ results, onOpen, query }: { results: Pattern[]; onOpen: (id: string) => void; query: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-disp text-xl font-bold text-ink">
        نتایج «<span className="text-accent">{query.trim()}</span>»
        <span className="ms-2 text-sm font-normal text-ink-3">{results.length} الگو</span>
      </h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((p) => {
          const lm = LEVEL_META[p.level];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpen(p.id)}
              className="cursor-pointer rounded-2xl border border-line bg-surface p-4 text-start transition-all hover:border-line-strong hover:bg-raised"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", lm.bg, lm.color)}>
                  {p.level.toUpperCase()}
                </span>
                <span className="shrink-0 rounded-full border border-line bg-white/4 px-2 py-0.5 font-mono text-[10px] text-ink-2">
                  {p.variants.length} حالت
                </span>
              </div>
              <div className="mt-2.5 text-[14.5px] font-bold text-ink">
                {p.fa} <span className="text-[11.5px] font-normal text-ink-3">{p.name}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-ink-3">{p.description}</p>
            </button>
          );
        })}
      </div>
      {results.length === 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center text-[13px] text-ink-3">
          چیزی مطابق «{query}» پیدا نشد — کلمات دیگری مثل «دکمه»، «تمپو»، «موج» را امتحان کن.
        </div>
      )}
    </div>
  );
}
