import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { JogWheel } from "@/components/primitives";
import { ScrubRail, formatTime } from "@/components/timeline";
import { ModelCard, Readout, Waveform } from "@/components/kit";
import { useDrag, clamp, makeBars } from "@/lib/controls";

const DUR = 198;
const bars = makeBars(7, 86);

export default function PlaybackLab() {
  const [pos, setPos] = useState(0.34);
  const time = (tone: string) => (
    <Readout value={formatTime(pos * DUR)} unit={`/ ${formatTime(DUR)}`} size="sm" tone={tone} />
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Transport Scrubber"
        archetype="Absolute · playhead"
        tone="var(--color-accent)"
        value={time("var(--color-accent)")}
        onReset={() => setPos(0.34)}
      >
        <Transport pos={pos} setPos={setPos} />
      </ModelCard>

      <ModelCard
        name="Jog Wheel"
        archetype="Rotational · momentum"
        tone="var(--color-amber)"
        value={time("var(--color-amber)")}
        onReset={() => setPos(0.34)}
      >
        <div className="flex flex-col items-center gap-3">
          <JogWheel
            position={pos}
            onChange={setPos}
            color="var(--color-amber)"
            format={(p) => formatTime(p * DUR)}
          />
        </div>
      </ModelCard>

      <ModelCard
        name="Shuttle Strip"
        archetype="Drag-anywhere · inertia"
        tone="var(--color-azure)"
        value={time("var(--color-azure)")}
        onReset={() => setPos(0.34)}
      >
        <Shuttle pos={pos} setPos={setPos} />
      </ModelCard>
    </div>
  );
}

function Transport({ pos, setPos }: { pos: number; setPos: (p: number) => void }) {
  const [play, setPlay] = useState(false);
  const pRef = useRef(pos);
  useEffect(() => {
    pRef.current = pos;
  }, [pos]);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      let np = pRef.current + dt / DUR;
      if (np >= 1) np = 0;
      setPos(np);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [play, setPos]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setPlay((p) => !p)}
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-fg)] text-[var(--color-canvas)] transition active:scale-95"
        >
          {play ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <span className="tnum text-sm text-muted">
          {formatTime(pos * DUR)} <span className="text-faint">/ {formatTime(DUR)}</span>
        </span>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-2">
        <ScrubRail pos={pos} onChange={setPos} height={84}>
          <Waveform bars={bars} progress={pos} />
        </ScrubRail>
      </div>
    </div>
  );
}

function Shuttle({ pos, setPos }: { pos: number; setPos: (p: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const base = useRef(0);
  const startX = useRef(0);
  const width = useRef(1);
  const vel = useRef(0);
  const raf = useRef<number | undefined>(undefined);
  const p = useRef(pos);
  useEffect(() => {
    p.current = pos;
  }, [pos]);

  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  const stop = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = undefined;
    }
  };
  const loop = () => {
    const v = vel.current;
    if (Math.abs(v) < 0.0008) {
      vel.current = 0;
      return;
    }
    let np = clamp(p.current + v, 0, 1);
    p.current = np;
    setPos(np);
    if (np <= 0 || np >= 1) {
      vel.current = 0;
      return;
    }
    vel.current *= 0.94;
    raf.current = requestAnimationFrame(loop);
  };

  const drag = useDrag({
    onStart: (e) => {
      stop();
      width.current = ref.current!.getBoundingClientRect().width;
      const j = fx(e.clientX);
      base.current = j;
      startX.current = e.clientX;
      p.current = j;
      setPos(j);
    },
    onMove: ({ px, dx }) => {
      const np = clamp(base.current + (px - startX.current) / width.current, 0, 1);
      vel.current = dx / width.current;
      p.current = np;
      setPos(np);
    },
    onEnd: () => {
      if (Math.abs(vel.current) > 0.004) raf.current = requestAnimationFrame(loop);
    },
  });

  return (
    <div className="w-full">
      <div className="mb-3 text-center">
        <span className="tnum text-sm text-muted">{formatTime(pos * DUR)}</span>
      </div>
      <div
        ref={ref}
        className="grab relative w-full overflow-hidden rounded-2xl border border-line bg-surface"
        style={{ height: 96 }}
        onPointerDown={drag.onPointerDown}
      >
        <div className="absolute inset-0 p-1">
          <Waveform bars={bars} progress={pos} />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[var(--color-azure)]"
          style={{ left: `${pos * 100}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-azure)] bg-[var(--color-fg)]"
          style={{ left: `${pos * 100}%` }}
        />
      </div>
    </div>
  );
}
