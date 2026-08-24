import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Knob, Fader } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { useDrag, clamp, roundTo } from "@/lib/controls";

const THREE = [
  { label: "Low", x: 0.14 },
  { label: "Mid", x: 0.5 },
  { label: "High", x: 0.86 },
];
const FIVE = ["60", "250", "1k", "4k", "12k"];

export default function EQLab() {
  const [curve, setCurve] = useState<number[]>([0, 0, 0]);
  const [knobs, setKnobs] = useState<number[]>([0, 0, 0]);
  const [graphic, setGraphic] = useState<number[]>([0, 0, 0, 0, 0]);
  const peak = (g: number[]) => Math.round(Math.max(...g.map(Math.abs)));

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Curve Editor"
        archetype="Direct · drag nodes"
        tone="var(--color-violet)"
        value={<Readout value={peak(curve)} unit="dB" size="sm" tone="var(--color-violet)" />}
        onReset={() => setCurve([0, 0, 0])}
      >
        <CurveEditor gains={curve} setGains={setCurve} />
      </ModelCard>

      <ModelCard
        name="Band Knobs"
        archetype="Rotary stack · compact"
        tone="var(--color-accent)"
        value={<Readout value={peak(knobs)} unit="dB" size="sm" tone="var(--color-accent)" />}
        onReset={() => setKnobs([0, 0, 0])}
      >
        <div className="flex items-end justify-center gap-5">
          {THREE.map((b, i) => (
            <div key={b.label} className="flex flex-col items-center gap-2">
              <Knob
                value={knobs[i]}
                min={-12}
                max={12}
                step={0.5}
                def={0}
                onChange={(v) => setKnobs((p) => p.map((g, j) => (j === i ? v : g)))}
                format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}`}
                detents={[0]}
              />
              <span className="text-[10px] text-faint">{b.label}</span>
            </div>
          ))}
        </div>
      </ModelCard>

      <ModelCard
        name="Graphic EQ"
        archetype="Fixed-band · faders"
        tone="var(--color-amber)"
        value={<Readout value={peak(graphic)} unit="dB" size="sm" tone="var(--color-amber)" />}
        onReset={() => setGraphic([0, 0, 0, 0, 0])}
      >
        <div className="flex items-end justify-center gap-2.5">
          {FIVE.map((f, i) => (
            <div key={f} className="flex flex-col items-center gap-1.5">
              <Fader
                value={graphic[i]}
                min={-12}
                max={12}
                def={0}
                onChange={(v) => setGraphic((p) => p.map((g, j) => (j === i ? v : g)))}
                color="var(--color-amber)"
                length={110}
                thumb={24}
                ticks={[
                  { pos: 1, label: "+12" },
                  { pos: 0.5, label: "0" },
                  { pos: 0, label: "−12" },
                ]}
              />
              <span className="text-[9px] tnum text-faint">{f}</span>
            </div>
          ))}
        </div>
      </ModelCard>
    </div>
  );
}

function CurveEditor({ gains, setGains }: { gains: number[]; setGains: (fn: (p: number[]) => number[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const H = 160;
  const yOf = (g: number) => H / 2 - (g / 12) * (H / 2 - 14);
  const pts = THREE.map((b, i) => ({ x: b.x, y: yOf(gains[i]) }));
  const all = [{ x: 0, y: pts[0].y }, ...pts, { x: 1, y: pts[pts.length - 1].y }];
  const path = all
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  return (
    <div className="w-full">
      <div ref={ref} className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface" style={{ height: H }}>
        <svg viewBox="0 0 1 160" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <line x1="0" y1={H / 2} x2="1" y2={H / 2} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path d={`${path} L 1 160 L 0 160 Z`} fill="color-mix(in oklab, var(--color-violet) 14%, transparent)" />
          <path d={path} fill="none" stroke="var(--color-violet)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        {THREE.map((b, i) => (
          <Node key={b.label} container={ref} x={b.x} y={yOf(gains[i])} h={H} onChange={(g) => setGains((p) => p.map((v, j) => (j === i ? g : v)))} />
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-between px-3 text-[9px] tnum text-faint">
          <span>+12</span>
          <span>0</span>
        </div>
      </div>
      <div className="mt-2 flex justify-between px-[6%] text-[10px] text-faint">
        {THREE.map((b) => (
          <span key={b.label}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

function Node({
  container,
  x,
  y,
  h,
  onChange,
}: {
  container: RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  h: number;
  onChange: (g: number) => void;
}) {
  const drag = useDrag({
    onMove: ({ py }) => {
      const r = container.current!.getBoundingClientRect();
      const t = clamp((py - r.top) / r.height, 0, 1);
      onChange(clamp(roundTo((0.5 - t) * 24, 0.5), -12, 12));
    },
  });
  return (
    <div
      className="grab absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-violet)] bg-[var(--color-fg)] shadow-lg shadow-black/40"
      style={{ left: `${x * 100}%`, top: `${(y / h) * 100}%` }}
      onPointerDown={drag.onPointerDown}
    />
  );
}
