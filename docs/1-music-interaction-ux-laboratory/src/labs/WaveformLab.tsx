import { useRef, useState } from "react";
import { Fader, Region } from "@/components/primitives";
import { ScrubRail } from "@/components/timeline";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { useDrag, clamp, makeBars } from "@/lib/controls";

const bars = makeBars(13, 120);

export default function WaveformLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Select + Scrub" archetype="Handles · playhead" tone="var(--color-accent)" value={<Readout value="A–B" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <SelectionScrub />
      </ModelCard>
      <ModelCard name="Zoom + Pan" archetype="Navigate · drag" tone="var(--color-amber)" value={<Readout value="N×" size="sm" tone="var(--color-amber)" />} onReset={() => {}}>
        <ZoomPan />
      </ModelCard>
      <ModelCard name="Overview + Detail" archetype="Minimap · linked" tone="var(--color-azure)" value={<Readout value="link" size="sm" tone="var(--color-azure)" />} onReset={() => {}}>
        <OverviewDetail />
      </ModelCard>
    </div>
  );
}

function SelectionScrub() {
  const [ph, setPh] = useState(0.42);
  const [a, setA] = useState(0.22);
  const [b, setB] = useState(0.68);
  return (
    <div className="w-full">
      <div className="mb-2 px-1">
        <Fader value={ph} min={0} max={1} orientation="h" onChange={setPh} color="var(--color-accent)" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-2">
        <div className="relative h-[80px]">
          <Waveform bars={bars} progress={ph} />
          <Region start={a} end={b} minSpan={0.03} onChange={(s, e) => { setA(s); setB(e); }} height={80} className="absolute inset-0" color="var(--color-accent)" />
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] tnum text-faint">
        {Math.round(a * 100)}% — {Math.round(b * 100)}%
      </div>
    </div>
  );
}

function ZoomPan() {
  const [zoom, setZoom] = useState(3);
  const [pan, setPan] = useState(0.3);
  const ref = useRef<HTMLDivElement>(null);
  const W = useRef(1);
  const drag = useDrag({
    onStart: () => {
      W.current = ref.current!.clientWidth;
    },
    onMove: ({ dx }) => {
      const max = zoom - 1;
      if (max <= 0) return;
      setPan((p) => clamp(p - dx / (max * W.current), 0, 1));
    },
  });
  return (
    <div className="w-full">
      <div ref={ref} className="grab relative h-[112px] overflow-hidden rounded-2xl border border-line bg-surface" onPointerDown={drag.onPointerDown}>
        <div className="absolute inset-y-0 flex items-center gap-[1px] px-[1px]" style={{ width: `${zoom * 100}%`, transform: `translateX(${(-pan * (zoom - 1)) / zoom * 100}%)` }}>
          {bars.map((v, i) => (
            <span key={i} className="rounded-full" style={{ height: `${Math.max(6, v * 100)}%`, width: `${100 / bars.length}%`, background: "var(--color-amber)" }} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-[var(--color-fg)]" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <button onClick={() => setZoom((z) => clamp(z - 1, 1, 12))} className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-muted transition hover:text-fg">−</button>
          <button onClick={() => setZoom((z) => clamp(z + 1, 1, 12))} className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-muted transition hover:text-fg">+</button>
        </div>
        <span className="tnum text-xs text-faint">{zoom.toFixed(1)}×</span>
      </div>
    </div>
  );
}

function OverviewDetail() {
  const [win, setWin] = useState({ start: 0.24, end: 0.5 });
  const [ph, setPh] = useState(0.4);
  const detail = bars.slice(Math.floor(win.start * bars.length), Math.ceil(win.end * bars.length));
  return (
    <div className="w-full space-y-2">
      <div className="rounded-xl border border-line bg-surface p-1.5">
        <div className="relative h-[42px]">
          <Waveform bars={bars} progress={0} dim="var(--color-hi)" />
          <Region start={win.start} end={win.end} minSpan={0.05} onChange={(s, e) => setWin({ start: s, end: e })} height={42} className="absolute inset-0" color="var(--color-azure)" />
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-2">
        <ScrubRail pos={ph} onChange={setPh} tone="var(--color-azure)" height={60}>
          <Waveform bars={detail} progress={ph} color="var(--color-azure)" />
        </ScrubRail>
      </div>
    </div>
  );
}
