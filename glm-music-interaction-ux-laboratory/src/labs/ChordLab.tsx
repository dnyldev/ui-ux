import { useRef, useState } from "react";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { useDrag, clamp, roundTo, haptic, makeBars } from "@/lib/controls";

const CHORDS = ["C", "Dm", "Em", "F", "G", "Am"];
const TONE = "var(--color-accent)";
const bars = makeBars(19, 96);

type Block = { id: number; start: number; end: number; chord: string };

export default function ChordLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Drag Blocks" archetype="Move · resize" tone={TONE} value={<Readout value="4" unit="chords" size="sm" tone={TONE} />} onReset={() => {}}>
        <BlockTimeline />
      </ModelCard>
      <ModelCard name="Tap to Insert" archetype="Slots · palette" tone="var(--color-violet)" value={<Readout value="grid" size="sm" tone="var(--color-violet)" />} onReset={() => {}}>
        <TapInsert />
      </ModelCard>
      <ModelCard name="Chord Wheel" archetype="Horizontal · snap" tone="var(--color-amber)" value={<Readout value="reel" size="sm" tone="var(--color-amber)" />} onReset={() => {}}>
        <ChordWheel />
      </ModelCard>
    </div>
  );
}

function BeatRow() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="absolute inset-y-0 w-px bg-[var(--color-line)]" style={{ left: `${(i / 8) * 100}%` }} />
      ))}
    </>
  );
}

function BlockTimeline() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 1, start: 0.02, end: 0.26, chord: "Am" },
    { id: 2, start: 0.27, end: 0.5, chord: "F" },
    { id: 3, start: 0.51, end: 0.76, chord: "C" },
    { id: 4, start: 0.78, end: 0.98, chord: "G" },
  ]);
  const ref = useRef<HTMLDivElement>(null);
  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  return (
    <div ref={ref} className="relative h-28 w-full rounded-2xl border border-line bg-surface p-1">
      <div className="absolute inset-0 p-1 opacity-50">
        <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
      </div>
      <BeatRow />
      {blocks.map((b) => (
        <ChordBlock key={b.id} block={b} fx={fx} tone={TONE} onChange={(nb) => setBlocks((bs) => bs.map((x) => (x.id === nb.id ? nb : x)))} />
      ))}
    </div>
  );
}

function ChordBlock({ block, fx, tone, onChange }: { block: Block; fx: (px: number) => number; tone: string; onChange: (b: Block) => void }) {
  const mode = useRef<null | "move" | "l" | "r">(null);
  const grab = useRef(0);
  const drag = useDrag({
    onMove: ({ px }) => {
      const f = fx(px);
      if (mode.current === "move") {
        const w = block.end - block.start;
        const ns = clamp(f - grab.current, 0, 1 - w);
        onChange({ ...block, start: ns, end: ns + w });
      } else if (mode.current === "l") {
        onChange({ ...block, start: clamp(f, 0, block.end - 0.04) });
      } else if (mode.current === "r") {
        onChange({ ...block, end: clamp(f, block.start + 0.04, 1) });
      }
    },
  });
  const begin = (m: "move" | "l" | "r") => (e: React.PointerEvent) => {
    mode.current = m;
    if (m === "move") grab.current = fx(e.clientX) - block.start;
    drag.onPointerDown(e);
  };
  return (
    <div
      className="absolute inset-y-1.5 overflow-hidden rounded-lg border"
      style={{ left: `${block.start * 100}%`, width: `${(block.end - block.start) * 100}%`, borderColor: tone, background: `color-mix(in oklab, ${tone} 18%, transparent)` }}
    >
      <div className="grab absolute inset-y-0 left-0 w-2.5 cursor-ew-resize" onPointerDown={begin("l")} />
      <div className="grab absolute inset-0 grid place-items-center text-xs font-semibold" style={{ color: tone }} onPointerDown={begin("move")}>
        {block.chord}
      </div>
      <div className="grab absolute inset-y-0 right-0 w-2.5 cursor-ew-resize" onPointerDown={begin("r")} />
    </div>
  );
}

function TapInsert() {
  const [active, setActive] = useState("C");
  const [slots, setSlots] = useState<(string | null)[]>(["Am", "F", "C", "G", null, "Em", null, null]);
  return (
    <div className="w-full">
      <div className="flex gap-1">
        {slots.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setSlots((p) => p.map((v, j) => (j === i ? (v ? null : active) : v)));
              haptic(6);
            }}
            className="grid h-12 flex-1 place-items-center rounded-lg border text-xs font-medium transition"
            style={s ? { borderColor: "var(--color-violet)", background: "color-mix(in oklab, var(--color-violet) 16%, transparent)", color: "var(--color-violet)" } : { borderColor: "var(--color-line)", color: "var(--color-faint)" }}
          >
            {s ?? "·"}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {CHORDS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className="rounded-full border px-3 py-1 text-[11px] transition"
            style={active === c ? { borderColor: "var(--color-violet)", color: "var(--color-violet)", background: "color-mix(in oklab, var(--color-violet) 14%, transparent)" } : { borderColor: "var(--color-line)", color: "var(--color-faint)" }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChordWheel() {
  const [idx, setIdx] = useState(2);
  const W = 66;
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(240);
  const onResize = () => {
    if (ref.current) setCw(ref.current.clientWidth);
  };
  const drag = useDrag({
    onMove: ({ dx }) => setIdx((i) => clamp(roundTo(i - dx / W, 1), 0, CHORDS.length - 1)),
    onEnd: () => haptic(6),
  });
  const offset = cw / 2 - W / 2 - idx * W;
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <span className="tnum text-3xl font-semibold text-[var(--color-amber)]">{CHORDS[idx]}</span>
      <div ref={ref} className="grab relative h-16 w-full overflow-hidden rounded-2xl border border-line bg-surface" onPointerDown={(e) => { onResize(); drag.onPointerDown(e); }}>
        <div className="absolute inset-y-0 flex items-center" style={{ transform: `translateX(${offset}px)` }}>
          {CHORDS.map((c, i) => (
            <div key={c} className="grid place-items-center text-sm font-medium" style={{ width: W, color: i === idx ? "var(--color-amber)" : "var(--color-faint)" }}>
              {c}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-[var(--color-amber)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-surface to-transparent" />
      </div>
    </div>
  );
}
