import { useRef } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { Knob, Stepper } from "@/components/primitives";
import { CATEGORIES } from "@/labs/registry";
import { useLab } from "@/lib/store";
import { clamp, haptic } from "@/lib/controls";
import { cn } from "@/utils/cn";

export default function Shell() {
  const category = useLab((s) => s.category);
  const setCategory = useLab((s) => s.setCategory);
  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const Lab = cat.C;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-canvas/80 px-4 backdrop-blur-md md:px-7">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-tight">Resonate</div>
            <div className="mt-0.5 hidden text-[10px] uppercase tracking-[0.22em] text-faint sm:block">
              Music Interaction Lab
            </div>
          </div>
        </div>
        <TempoPill />
      </header>

      <nav className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-b border-line bg-canvas/60 px-3 py-2 md:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
              c.id === category ? "border-line2 bg-hi text-fg" : "border-line text-faint"
            )}
          >
            <span className="tnum text-[9px] opacity-60">{c.no}</span>
            {c.title}
          </button>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-line py-4 md:flex">
          <div className="px-5 pb-2 text-[10px] uppercase tracking-[0.2em] text-faint">Categories</div>
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "group relative mx-2 flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                  active ? "bg-hi" : "hover:bg-hi/50"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-accent"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: c.tone }}
                  />
                )}
                <span className="tnum text-[10px] text-faint">{c.no}</span>
                <span className={cn("text-[13px] transition", active ? "text-fg" : "text-muted group-hover:text-fg")}>
                  {c.title}
                </span>
              </button>
            );
          })}
          <div className="mt-auto px-5 pt-6 text-[10px] leading-relaxed text-faint">
            Mock values · front-end only. Every control is fully interactive.
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <div className="tnum text-xs text-faint">{cat.no} / 15</div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-[28px]">{cat.title}</h1>
                <p className="mt-1 text-sm text-muted">{cat.tag}</p>
              </div>
              <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block" style={{ background: cat.tone }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <Lab />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <TempoDrawer />
    </div>
  );
}

function Logo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-panel">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="6" width="2" height="4" rx="1" fill="var(--color-accent)" />
        <rect x="6" y="3" width="2" height="10" rx="1" fill="var(--color-accent)" />
        <rect x="10" y="5" width="2" height="6" rx="1" fill="var(--color-accent)" opacity="0.5" />
      </svg>
    </div>
  );
}

function TempoPill() {
  const bpm = useLab((s) => s.bpm);
  const open = useLab((s) => s.setDrawer);
  return (
    <button
      onClick={() => open(true)}
      className="group flex items-center gap-2.5 rounded-full border border-line bg-panel py-1.5 pl-3 pr-2.5 transition hover:border-line2"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
      </span>
      <span className="tnum text-sm font-semibold">{Math.round(bpm)}</span>
      <span className="text-[10px] uppercase tracking-wider text-faint">bpm</span>
    </button>
  );
}

function TempoDrawer() {
  const open = useLab((s) => s.drawer);
  const setOpen = useLab((s) => s.setDrawer);
  const bpm = useLab((s) => s.bpm);
  const setBpm = useLab((s) => s.setBpm);
  const taps = useRef<number[]>([]);
  const controls = useDragControls();

  const tap = () => {
    const now = performance.now();
    const a = taps.current;
    a.push(now);
    while (a.length && now - a[0] > 2500) a.shift();
    if (a.length >= 2) {
      let s = 0;
      for (let i = 1; i < a.length; i++) s += a[i] - a[i - 1];
      setBpm(clamp(Math.round(60000 / (s / (a.length - 1))), 40, 240));
    }
    haptic(12);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="tempo-backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="tempo-panel"
            className="safe-b fixed inset-x-0 bottom-0 z-50 rounded-t-[30px] border-t border-line bg-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) setOpen(false);
            }}
          >
            <div className="mx-auto w-full max-w-md px-6 pb-8 pt-3">
              <div
                onPointerDown={(e) => controls.start(e)}
                className="grab mx-auto mb-5 h-6 w-full cursor-grab touch-none"
              >
                <div className="mx-auto h-1.5 w-10 rounded-full bg-line2" />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-faint">Tempo</div>
                  <div className="text-lg font-semibold tracking-tight">Set the pace</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-faint transition hover:border-line2 hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-6 py-4">
                <Knob
                  value={bpm}
                  min={40}
                  max={240}
                  step={1}
                  def={120}
                  onChange={setBpm}
                  size={208}
                  format={(v) => String(Math.round(v))}
                  sub="40 – 240"
                />
                <div className="flex items-center gap-3">
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      tap();
                    }}
                    className="rounded-xl border border-line bg-raised px-4 py-2.5 text-xs font-medium text-muted transition hover:border-line2 hover:text-fg active:scale-95"
                  >
                    Tap
                  </button>
                  <Stepper value={Math.round(bpm)} onChange={setBpm} step={1} min={40} max={240} def={120} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
