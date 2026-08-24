import { useRef, useState } from "react";
import { Knob } from "@/components/primitives";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { useDrag, clamp, makeBars } from "@/lib/controls";

const bars = makeBars(29, 90);
const TONE = "var(--color-azure)";

export default function FadeLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Envelope" archetype="Drag vertices · timing" tone={TONE} value={<Readout value="↑↓" size="sm" tone={TONE} />} onReset={() => {}}>
        <Envelope />
      </ModelCard>
      <ModelCard name="Curve Shape" archetype="Bezier · ease" tone="var(--color-accent)" value={<Readout value="shape" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <CurveShape />
      </ModelCard>
      <ModelCard name="Dual Rotary" archetype="In / out · amount" tone="var(--color-violet)" value={<Readout value="ms" size="sm" tone="var(--color-violet)" />} onReset={() => {}}>
        <DualKnob />
      </ModelCard>
    </div>
  );
}

function Envelope() {
  const [fi, setFi] = useState(0.2);
  const [fo, setFo] = useState(0.22);
  const ref = useRef<HTMLDivElement>(null);
  const mode = useRef<"" | "i" | "o">("");
  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  const drag = useDrag({
    onMove: ({ px }) => {
      const f = fx(px);
      if (mode.current === "i") setFi(clamp(f, 0, 1 - fo - 0.02));
      else if (mode.current === "o") setFo(clamp(1 - f, 0, 1 - fi - 0.02));
    },
  });
  const begin = (m: "i" | "o") => (e: React.PointerEvent) => {
    mode.current = m;
    drag.onPointerDown(e);
  };
  const H = 96;
  const pt = (x: number, v: number) => ({ x: x * 100, y: (1 - v) * H });
  const a = pt(0, 0);
  const b = pt(fi, 1);
  const c = pt(1 - fo, 1);
  const d = pt(1, 0);
  const path = `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y}`;
  return (
    <div className="w-full">
      <div ref={ref} className="relative h-[96px] w-full overflow-hidden rounded-2xl border border-line bg-surface p-2">
        <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
        <svg viewBox="0 0 100 96" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d={`${path} L 100 96 L 0 96 Z`} fill="color-mix(in oklab, var(--color-azure) 16%, transparent)" />
          <path d={path} fill="none" stroke="var(--color-azure)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        <div className="grab absolute inset-y-0" style={{ left: `${fi * 100}%`, transform: "translateX(-50%)", width: 20 }} onPointerDown={begin("i")}>
          <div className="mx-auto h-full w-[3px] rounded-full bg-[var(--color-azure)]" />
        </div>
        <div className="grab absolute inset-y-0" style={{ left: `${(1 - fo) * 100}%`, transform: "translateX(-50%)", width: 20 }} onPointerDown={begin("o")}>
          <div className="mx-auto h-full w-[3px] rounded-full bg-[var(--color-azure)]" />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] tnum text-faint">
        <span>in {Math.round(fi * 1000)}ms</span>
        <span>out {Math.round(fo * 1000)}ms</span>
      </div>
    </div>
  );
}

function CurveShape() {
  const [p, setP] = useState({ x: 0.42, y: 0.42 });
  const ref = useRef<HTMLDivElement>(null);
  const size = 168;
  const drag = useDrag({
    onMove: ({ px, py }) => {
      const r = ref.current!.getBoundingClientRect();
      setP({ x: clamp((px - r.left) / r.width, 0, 1), y: clamp((py - r.top) / r.height, 0, 1) });
    },
  });
  const cx = p.x * size;
  const cy = p.y * size;
  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className="grab relative overflow-hidden rounded-2xl border border-line bg-surface" style={{ width: size, height: size }} onPointerDown={drag.onPointerDown}>
        <svg width={size} height={size} className="absolute inset-0">
          <line x1={0} y1={size} x2={size} y2={0} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 4" />
          <path d={`M 0 ${size} C ${cx} ${cy} ${cx} ${cy} ${size} 0`} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
          <path d={`M 0 ${size} C ${cx} ${cy} ${cx} ${cy} ${size} 0 L ${size} ${size} Z`} fill="color-mix(in oklab, var(--color-accent) 12%, transparent)" />
        </svg>
        <div className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-fg)]" style={{ left: p.x * 100 + "%", top: p.y * 100 + "%" }} />
      </div>
      <span className="text-[9px] uppercase tracking-wider text-faint">ease in ↔ ease out</span>
    </div>
  );
}

function DualKnob() {
  const [fi, setFi] = useState(22);
  const [fo, setFo] = useState(28);
  return (
    <div className="flex items-end justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Knob value={fi} min={0} max={100} step={1} def={22} onChange={setFi} color="var(--color-violet)" format={(v) => `${Math.round(v)}`} sub="fade in" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Knob value={fo} min={0} max={100} step={1} def={28} onChange={setFo} color="var(--color-violet)" format={(v) => `${Math.round(v)}`} sub="fade out" />
      </div>
    </div>
  );
}
