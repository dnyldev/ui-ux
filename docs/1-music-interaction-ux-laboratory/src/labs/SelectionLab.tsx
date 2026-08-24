import { useRef, useState } from "react";
import { Region, Stepper } from "@/components/primitives";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { formatTime } from "@/components/timeline";
import { useDrag, clamp, makeBars } from "@/lib/controls";

const bars = makeBars(23, 100);
const DUR = 200;
const TONE = "var(--color-amber)";

export default function SelectionLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Region Handles" archetype="Lasso · drag edges" tone={TONE} value={<Readout value="A→B" size="sm" tone={TONE} />} onReset={() => {}}>
        <RegionModel />
      </ModelCard>
      <ModelCard name="Marquee" archetype="Draw · press + drag" tone="var(--color-accent)" value={<Readout value="drag" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <MarqueeModel />
      </ModelCard>
      <ModelCard name="Timecode" archetype="Numeric · precise" tone="var(--color-azure)" value={<Readout value="in/out" size="sm" tone="var(--color-azure)" />} onReset={() => {}}>
        <NumericModel />
      </ModelCard>
    </div>
  );
}

function Track({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-[84px] w-full rounded-2xl border border-line bg-surface p-2">
      <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
      {children}
    </div>
  );
}

function RegionModel() {
  const [a, setA] = useState(0.22);
  const [b, setB] = useState(0.66);
  return (
    <div className="w-full">
      <Track>
        <Region start={a} end={b} minSpan={0.03} onChange={(s, e) => { setA(s); setB(e); }} height={84} className="absolute inset-0" color={TONE} />
      </Track>
      <div className="mt-2 text-center text-[11px] tnum text-faint">{formatTime((b - a) * DUR)} sel</div>
    </div>
  );
}

function MarqueeModel() {
  const [sel, setSel] = useState<{ s: number; e: number }>({ s: 0.2, e: 0.55 });
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  const drag = useDrag({
    onStart: (e) => {
      const f = fx(e.clientX);
      start.current = f;
      setSel({ s: f, e: f });
    },
    onMove: ({ px }) => {
      const f = fx(px);
      setSel({ s: Math.min(start.current, f), e: Math.max(start.current, f) });
    },
  });
  return (
    <div className="w-full">
      <div ref={ref} className="grab relative h-[84px] w-full overflow-hidden rounded-2xl border border-line bg-surface p-2" onPointerDown={drag.onPointerDown}>
        <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
        {sel.e - sel.s > 0.005 && (
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${sel.s * 100}%`, right: `${(1 - sel.e) * 100}%`, background: "color-mix(in oklab, var(--color-accent) 18%, transparent)", borderInline: "2px solid var(--color-accent)" }}
          />
        )}
      </div>
      <div className="mt-2 text-center text-[11px] tnum text-faint">{formatTime((sel.e - sel.s) * DUR)} sel</div>
    </div>
  );
}

function NumericModel() {
  const [inn, setInn] = useState(44);
  const [out, setOut] = useState(132);
  const safeIn = Math.min(inn, out - 1);
  const safeOut = Math.max(out, inn + 1);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-faint">In</span>
          <Stepper value={inn} onChange={(v) => setInn(clamp(v, 0, DUR - 1))} step={1} min={0} max={DUR - 1} format={formatTime} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-faint">Out</span>
          <Stepper value={out} onChange={(v) => setOut(clamp(v, 1, DUR))} step={1} min={1} max={DUR} format={formatTime} />
        </div>
      </div>
      <span className="tnum text-xs text-faint">{formatTime(safeOut - safeIn)} selection</span>
    </div>
  );
}
