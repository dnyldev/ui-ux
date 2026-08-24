import { useState } from "react";
import { Fader } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { formatTime } from "@/components/timeline";
import { useDrag } from "@/lib/controls";

const LINES = [
  "Thunder only happens when it's raining",
  "Players only love you when they're playing",
  "Women, they will come and they will go",
  "When the rain washes you clean, you'll know",
];
const DUR = 212;
const TONES = ["var(--color-accent)", "var(--color-azure)", "var(--color-violet)", "var(--color-amber)"];

export default function LyricsLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Tap to Anchor" archetype="Scrub · stamp time" tone="var(--color-accent)" value={<Readout value="sync" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <TapAnchor />
      </ModelCard>
      <ModelCard name="Drag Cards" archetype="Nudge · reorder" tone="var(--color-azure)" value={<Readout value="align" size="sm" tone="var(--color-azure)" />} onReset={() => {}}>
        <DragCards />
      </ModelCard>
      <ModelCard name="Karaoke Scrub" archetype="Word · highlight" tone="var(--color-amber)" value={<Readout value="live" size="sm" tone="var(--color-amber)" />} onReset={() => {}}>
        <Karaoke />
      </ModelCard>
    </div>
  );
}

function TapAnchor() {
  const [pos, setPos] = useState(0.3);
  const [times, setTimes] = useState<number[]>([16, 54, 92, 150]);
  const t = pos * DUR;
  let active = 0;
  for (let i = 0; i < times.length; i++) if (times[i] <= t) active = i;
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="px-1">
        <Fader value={pos} min={0} max={1} orientation="h" onChange={setPos} color="var(--color-accent)" />
      </div>
      <div className="space-y-1.5">
        {LINES.map((line, i) => {
          const on = i === active;
          return (
            <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition" style={{ background: on ? "color-mix(in oklab, var(--color-accent) 12%, transparent)" : "transparent" }}>
              <button
                onClick={() => setTimes((p) => p.map((v, j) => (j === i ? t : v)))}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px]"
                style={{ borderColor: on ? "var(--color-accent)" : "var(--color-line)", color: on ? "var(--color-accent)" : "var(--color-faint)" }}
              >
                ●
              </button>
              <span className={`flex-1 truncate text-[11px] ${on ? "text-fg" : "text-muted"}`}>{line}</span>
              <span className="tnum text-[10px] text-faint">{formatTime(times[i])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DragCards() {
  const [rows, setRows] = useState(LINES.map((t, i) => ({ text: t, off: i === 0 ? 0 : 0, tone: TONES[i] })));
  const swap = (i: number, d: number) => {
    setRows((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };
  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((r, i) => (
        <Card key={i} text={r.text} off={r.off} tone={r.tone} onOff={(v) => setRows((p) => p.map((x, j) => (j === i ? { ...x, off: v } : x)))} onUp={() => swap(i, -1)} onDown={() => swap(i, 1)} />
      ))}
    </div>
  );
}

function Card({ text, off, tone, onOff, onUp, onDown }: { text: string; off: number; tone: string; onOff: (v: number) => void; onUp: () => void; onDown: () => void }) {
  const drag = useDrag({
    onMove: ({ dx }) => onOff(off + dx * 3.5),
  });
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <button onClick={onUp} className="text-faint hover:text-fg">▲</button>
        <button onClick={onDown} className="text-faint hover:text-fg">▼</button>
      </div>
      <div className="grab flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5" onPointerDown={drag.onPointerDown}>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
        <span className="flex-1 truncate text-[11px] text-muted">{text}</span>
        <span className="tnum text-[10px]" style={{ color: Math.abs(off) > 1 ? tone : "var(--color-faint)" }}>
          {off > 0 ? "+" : ""}
          {Math.round(off)}ms
        </span>
      </div>
    </div>
  );
}

function Karaoke() {
  const words = LINES[2].split(" ");
  const [pos, setPos] = useState(0.42);
  const n = words.length;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex h-20 flex-wrap content-center items-center justify-center gap-x-2 gap-y-1 text-center">
        {words.map((w, i) => {
          const wp = i / n;
          const state = pos >= wp + 1 / n ? "done" : pos >= wp ? "now" : "future";
          return (
            <span
              key={i}
              className="text-lg font-semibold transition-all"
              style={{
                color: state === "now" ? "var(--color-amber)" : state === "done" ? "var(--color-fg)" : "var(--color-faint)",
                transform: state === "now" ? "scale(1.12)" : "scale(1)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div className="w-full px-1">
        <Fader value={pos} min={0} max={1} orientation="h" onChange={setPos} color="var(--color-amber)" />
      </div>
    </div>
  );
}
