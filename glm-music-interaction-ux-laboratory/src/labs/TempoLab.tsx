import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Knob, Stepper } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { useLab } from "@/lib/store";
import { useDrag, clamp, roundTo, haptic } from "@/lib/controls";

const f = (v: number) => String(Math.round(v));

export default function TempoLab() {
  const bpm = useLab((s) => s.bpm);
  const setBpm = useLab((s) => s.setBpm);
  const readout = (tone: string) => (
    <Readout value={Math.round(bpm)} unit="bpm" size="sm" tone={tone} />
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Rotary"
        archetype="Knob · linear drag"
        tone="var(--color-accent)"
        value={readout("var(--color-accent)")}
        onReset={() => setBpm(120)}
      >
        <Knob
          value={bpm}
          min={40}
          max={240}
          step={1}
          def={120}
          onChange={setBpm}
          format={f}
          sub="40 – 240"
        />
      </ModelCard>

      <ModelCard
        name="Tap Tempo"
        archetype="Rhythmic detection"
        tone="var(--color-azure)"
        value={readout("var(--color-azure)")}
        onReset={() => {
          setBpm(120);
        }}
      >
        <TapTempo bpm={bpm} setBpm={setBpm} />
      </ModelCard>

      <ModelCard
        name="Direct Drag"
        archetype="Value scrub · inertia"
        tone="var(--color-violet)"
        value={readout("var(--color-violet)")}
        onReset={() => setBpm(120)}
      >
        <DirectBpmDrag bpm={bpm} setBpm={setBpm} />
      </ModelCard>
    </div>
  );
}

function TapTempo({ bpm, setBpm }: { bpm: number; setBpm: (v: number) => void }) {
  const taps = useRef<number[]>([]);
  const [pulse, setPulse] = useState(0);
  const [count, setCount] = useState(0);
  const tap = () => {
    const now = performance.now();
    const arr = taps.current;
    arr.push(now);
    while (arr.length && now - arr[0] > 2500) arr.shift();
    if (arr.length >= 2) {
      let sum = 0;
      for (let i = 1; i < arr.length; i++) sum += arr[i] - arr[i - 1];
      const avg = sum / (arr.length - 1);
      setBpm(clamp(Math.round(60000 / avg), 40, 240));
    }
    setCount(Math.min(arr.length, 4));
    setPulse((p) => p + 1);
    haptic(12);
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          tap();
        }}
        className="relative grid h-32 w-32 place-items-center rounded-full border border-line2 bg-surface outline-none transition active:scale-[0.97]"
      >
        <motion.span
          key={pulse}
          initial={{ scale: 0.7, opacity: 0.5 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-[var(--color-azure)]"
        />
        <span className="relative flex flex-col items-center">
          <span className="tnum text-3xl font-semibold text-fg">{Math.round(bpm)}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-faint">tap</span>
        </span>
      </button>
      <Stepper value={Math.round(bpm)} onChange={setBpm} step={1} min={40} max={240} def={120} />
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="h-1 w-4 rounded-full"
            style={{ background: i < count ? "var(--color-azure)" : "var(--color-hi)" }}
          />
        ))}
      </div>
    </div>
  );
}

function DirectBpmDrag({ bpm, setBpm }: { bpm: number; setBpm: (v: number) => void }) {
  const val = useRef(bpm);
  const vel = useRef(0);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    val.current = bpm;
  }, [bpm]);

  const stop = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = undefined;
    }
  };
  const loop = () => {
    const v = vel.current;
    if (Math.abs(v) < 0.18) {
      vel.current = 0;
      const snapped = clamp(roundTo(val.current, 1), 40, 240);
      val.current = snapped;
      setBpm(snapped);
      return;
    }
    val.current = clamp(val.current + v, 40, 240);
    vel.current *= 0.92;
    setBpm(val.current);
    raf.current = requestAnimationFrame(loop);
  };

  const drag = useDrag({
    onMove: ({ dy, shift }) => {
      stop();
      const k = shift ? 0.2 : 0.55;
      const nv = clamp(val.current - dy * k, 40, 240);
      val.current = nv;
      vel.current = -dy * k;
      setBpm(nv);
    },
    onEnd: () => {
      if (Math.abs(vel.current) > 0.25) raf.current = requestAnimationFrame(loop);
    },
  });

  return (
    <div
      className="grab relative flex h-44 w-full flex-col items-center justify-center rounded-2xl border border-line bg-surface"
      onPointerDown={drag.onPointerDown}
      onDoubleClick={() => setBpm(120)}
      role="slider"
      aria-valuenow={bpm}
    >
      <span className="tnum text-5xl font-semibold tracking-tight text-fg">{Math.round(bpm)}</span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-faint">bpm</span>
      <motion.div
        animate={{ opacity: drag.dragging ? 1 : 0.3 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute bottom-6 left-1/2 top-6 flex w-px -translate-x-1/2 flex-col items-center justify-center gap-1.5 bg-[var(--color-violet)]"
      >
        <span className="h-1 w-2.5 rounded-full bg-[var(--color-violet)]" />
        <span className="h-1 w-2.5 rounded-full bg-[var(--color-violet)]" />
      </motion.div>
    </div>
  );
}
