import { useState } from "react";
import { Region } from "@/components/primitives";
import { ScrubRail } from "@/components/timeline";
import { ModelCard, Readout, Segmented, Waveform } from "@/components/kit";
import { makeBars, roundTo, haptic } from "@/lib/controls";

const TONE = "var(--color-amber)";
const bars = makeBars(11, 80);
const TOTAL_BEATS = 16;
const Q = 1 / TOTAL_BEATS;

export default function LoopLab() {
  const [a, setA] = useState(0.22);
  const [b, setB] = useState(0.62);
  const beats = Math.max(1, Math.round((b - a) * TOTAL_BEATS));
  const len = (tone: string) => <Readout value={beats} unit="beats" size="sm" tone={tone} />;
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Region Handles"
        archetype="Direct · drag A–B"
        tone={TONE}
        value={len(TONE)}
        onReset={() => {
          setA(0.22);
          setB(0.62);
        }}
      >
        <RegionModel a={a} b={b} setA={setA} setB={setB} />
      </ModelCard>

      <ModelCard
        name="Length Stepper"
        archetype="Discrete · beat count"
        tone="var(--color-azure)"
        value={len("var(--color-azure)")}
        onReset={() => {
          setA(0.22);
          setB(0.62);
        }}
      >
        <LengthModel a={a} setB={setB} beats={beats} />
      </ModelCard>

      <ModelCard
        name="Capture A / B"
        archetype="Contextual · set points"
        tone="var(--color-violet)"
        value={len("var(--color-violet)")}
        onReset={() => {
          setA(0.22);
          setB(0.62);
        }}
      >
        <CaptureModel a={a} b={b} setA={setA} setB={setB} />
      </ModelCard>
    </div>
  );
}

function Backdrop({ children, a, b }: { children: React.ReactNode; a: number; b: number }) {
  return (
    <div className="relative w-full rounded-2xl border border-line bg-surface p-2">
      <div className="relative h-[96px]">
        <Waveform bars={bars} progress={0} />
        {children}
      </div>
      <div className="mt-2 flex justify-between px-1 text-[9px] tnum text-faint">
        <span>1</span>
        <span>5</span>
        <span>9</span>
        <span>13</span>
        <span>17</span>
      </div>
      <span className="sr-only">
        loop {a.toFixed(2)}–{b.toFixed(2)}
      </span>
    </div>
  );
}

function RegionModel({
  a,
  b,
  setA,
  setB,
}: {
  a: number;
  b: number;
  setA: (v: number) => void;
  setB: (v: number) => void;
}) {
  return (
    <Backdrop a={a} b={b}>
      <Region
        start={a}
        end={b}
        minSpan={Q}
        color={TONE}
        height={96}
        className="absolute inset-0"
        onChange={(s, e) => {
          setA(roundTo(s, Q));
          setB(roundTo(e, Q));
          haptic(4);
        }}
      />
    </Backdrop>
  );
}

function LengthModel({
  a,
  setB,
  beats,
}: {
  a: number;
  setB: (v: number) => void;
  beats: number;
}) {
  const opts = [1, 2, 4, 8, 16].map((n) => ({ label: `${n}`, value: String(n) }));
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Segmented
        options={opts}
        value={String(beats)}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setB(clampEnd(a + n / TOTAL_BEATS));
          haptic(6);
        }}
      />
      <Backdrop a={a} b={a + beats / TOTAL_BEATS}>
        <div
          className="pointer-events-none absolute inset-0 m-2 rounded-md"
          style={{
            left: `${a * 100}%`,
            right: `${(1 - clampEnd(a + beats / TOTAL_BEATS)) * 100}%`,
            background: "color-mix(in oklab, var(--color-azure) 16%, transparent)",
            borderInline: "2px solid var(--color-azure)",
          }}
        />
      </Backdrop>
    </div>
  );
}

function clampEnd(v: number) {
  return Math.min(1, Math.max(0, v));
}

function CaptureModel({
  a,
  b,
  setA,
  setB,
}: {
  a: number;
  b: number;
  setA: (v: number) => void;
  setB: (v: number) => void;
}) {
  const [playhead, setPlayhead] = useState(0.4);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full rounded-2xl border border-line bg-surface p-2">
        <ScrubRail pos={playhead} onChange={setPlayhead} tone="var(--color-violet)" height={70}>
          <Waveform bars={bars} progress={0} />
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{
              left: `${Math.min(a, b) * 100}%`,
              right: `${(1 - Math.max(a, b)) * 100}%`,
              background: "color-mix(in oklab, var(--color-violet) 16%, transparent)",
              borderInline: "2px solid var(--color-violet)",
            }}
          />
        </ScrubRail>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setA(playhead);
            haptic(10);
          }}
          className="rounded-lg border border-line bg-raised px-4 py-2 text-xs text-muted transition hover:border-line2 hover:text-fg"
        >
          Set A
        </button>
        <button
          onClick={() => {
            setB(playhead);
            haptic(10);
          }}
          className="rounded-lg border border-line bg-raised px-4 py-2 text-xs text-muted transition hover:border-line2 hover:text-fg"
        >
          Set B
        </button>
      </div>
    </div>
  );
}
