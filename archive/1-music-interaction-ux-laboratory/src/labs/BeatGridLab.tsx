import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Stepper } from "@/components/primitives";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { useDrag, clamp, wrap, roundTo, haptic, makeBars } from "@/lib/controls";

const bars = makeBars(17, 110);

export default function BeatGridLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Phase Drag" archetype="Drag grid · lock ↓1" tone="var(--color-accent)" value={<Readout value="grid" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <PhaseDrag />
      </ModelCard>
      <ModelCard name="Numeric" archetype="Steppers · precise" tone="var(--color-violet)" value={<Readout value="nudge" size="sm" tone="var(--color-violet)" />} onReset={() => {}}>
        <NumericGrid />
      </ModelCard>
      <ModelCard name="Downbeat Handle" archetype="Grab · snap · ÷/×" tone="var(--color-amber)" value={<Readout value="align" size="sm" tone="var(--color-amber)" />} onReset={() => {}}>
        <HandleDrag />
      </ModelCard>
    </div>
  );
}

function GridWave({ offset, divs = 16, children }: { offset: number; divs?: number; children?: ReactNode }) {
  const lines = [];
  for (let i = 0; i < divs; i++) {
    lines.push({ p: wrap(i / divs + offset, 1), down: i % 4 === 0 });
  }
  return (
    <div className="relative h-[92px] w-full overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="absolute inset-0 p-2">
        <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="absolute inset-y-0" style={{ left: `${l.p * 100}%`, width: l.down ? 2 : 1, background: l.down ? "var(--color-accent)" : "var(--color-line2)", opacity: l.down ? 0.95 : 0.5 }} />
      ))}
      {children}
    </div>
  );
}

function PhaseDrag() {
  const [offset, setOffset] = useState(0.08);
  const ref = useRef<HTMLDivElement>(null);
  const W = useRef(1);
  const drag = useDrag({
    onStart: () => {
      W.current = ref.current!.clientWidth;
    },
    onMove: ({ dx }) => setOffset((o) => wrap(o + dx / W.current, 1)),
  });
  return (
    <div className="w-full">
      <GridWave offset={offset}>
        <div ref={ref} className="grab absolute inset-0" onPointerDown={drag.onPointerDown} />
      </GridWave>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => {
            setOffset(0.5);
            haptic(10);
          }}
          className="rounded-lg border border-line bg-raised px-3 py-1.5 text-[11px] text-muted transition hover:border-line2 hover:text-fg"
        >
          Set ↓1
        </button>
        <span className="tnum text-xs text-faint">Δ {Math.round(offset * 100)}%</span>
      </div>
    </div>
  );
}

function NumericGrid() {
  const [bpm, setBpm] = useState(120);
  const [offset, setOffset] = useState(8);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <GridWave offset={offset / 100} />
      <div className="flex flex-col items-center gap-3">
        <Stepper value={bpm} onChange={setBpm} step={1} min={40} max={240} unit=" bpm" />
        <Stepper value={offset} onChange={setOffset} step={1} min={0} max={99} unit="%" />
      </div>
    </div>
  );
}

function HandleDrag() {
  const [offset, setOffset] = useState(0.1);
  const [divs, setDivs] = useState(16);
  const ref = useRef<HTMLDivElement>(null);
  const W = useRef(1);
  const drag = useDrag({
    onStart: () => {
      W.current = ref.current!.clientWidth;
    },
    onMove: ({ dx }) => setOffset((o) => wrap(o + dx / W.current, 1)),
    onEnd: () => {
      setOffset((o) => roundTo(o * divs, 1) / divs);
      haptic(6);
    },
  });
  return (
    <div className="w-full">
      <GridWave offset={offset} divs={divs}>
        <div
          ref={ref}
          className="grab absolute inset-y-0"
          style={{ left: `${wrap(offset, 1) * 100}%`, transform: "translateX(-50%)", width: 22 }}
          onPointerDown={drag.onPointerDown}
        >
          <div className="mx-auto h-full w-[3px] rounded-full bg-[var(--color-amber)]" />
          <div className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--color-amber)]" />
        </div>
      </GridWave>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <button onClick={() => setDivs((d) => clamp(d / 2, 4, 32))} className="grid h-8 w-9 place-items-center rounded-lg border border-line bg-raised text-xs text-muted hover:text-fg">÷2</button>
          <button onClick={() => setDivs((d) => clamp(d * 2, 4, 32))} className="grid h-8 w-9 place-items-center rounded-lg border border-line bg-raised text-xs text-muted hover:text-fg">×2</button>
        </div>
        <span className="tnum text-xs text-faint">1/{divs}</span>
      </div>
    </div>
  );
}
