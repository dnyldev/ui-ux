import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Knob, Stepper } from "@/components/primitives";
import { ModelCard, Readout, Segmented } from "@/components/kit";
import { useLab } from "@/lib/store";
import { clamp, haptic } from "@/lib/controls";

export default function MetronomeLab() {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Accent Grid" archetype="Tap beats · live" tone="var(--color-accent)" value={<Readout value="time" size="sm" tone="var(--color-accent)" />} onReset={() => {}}>
        <AccentGrid />
      </ModelCard>
      <ModelCard name="Time Signature" archetype="Rotary · accents" tone="var(--color-violet)" value={<Readout value="meter" size="sm" tone="var(--color-violet)" />} onReset={() => {}}>
        <MeterRotary />
      </ModelCard>
      <ModelCard name="Tempo + Pulse" archetype="Live · subdivision" tone="var(--color-amber)" value={<Readout value="bpm" size="sm" tone="var(--color-amber)" />} onReset={() => {}}>
        <TempoPulse />
      </ModelCard>
    </div>
  );
}

function useMetronome(bpm: number, steps: number, accentEvery: number, playing: boolean) {
  const [cur, setCur] = useState(-1);
  const accRef = useRef(accentEvery);
  accRef.current = accentEvery;
  useEffect(() => {
    if (!playing) {
      setCur(-1);
      return;
    }
    let i = 0;
    setCur(0);
    const id = setInterval(() => {
      if (i % accRef.current === 0) haptic(10);
      i++;
      setCur(i % steps);
    }, 60000 / bpm);
    return () => clearInterval(id);
  }, [bpm, steps, playing]);
  return cur;
}

function PlayBtn({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-fg)] text-[var(--color-canvas)] transition active:scale-95">
      {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
    </button>
  );
}

function Cells({ beats, accents, cur, onToggle, tones }: { beats: number; accents: boolean[]; cur: number; onToggle: (i: number) => void; tones: string[] }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: beats }).map((_, i) => {
        const isCur = cur === i;
        const tone = accents[i] ? tones[i % tones.length] : "var(--color-hi)";
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className="grid h-11 w-11 place-items-center rounded-xl border text-xs font-semibold transition"
            style={{
              borderColor: accents[i] ? tone : "var(--color-line)",
              background: isCur ? tone : "var(--color-surface)",
              color: isCur ? "#0a0a0c" : accents[i] ? tone : "var(--color-faint)",
              transform: isCur ? "scale(1.08)" : "scale(1)",
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

const TONES = ["var(--color-accent)", "var(--color-azure)", "var(--color-violet)", "var(--color-amber)", "#ff8fab", "#7dd3fc", "#86efac"];

function AccentGrid() {
  const [beats, setBeats] = useState(4);
  const [accents, setAccents] = useState<boolean[]>([true, false, false, false]);
  const [playing, setPlaying] = useState(true);
  const cur = useMetronome(useLab.getState().bpm, beats, 1, playing);
  const resize = (n: number) => {
    setBeats(n);
    setAccents((a) => {
      const next = Array(n).fill(false);
      for (let i = 0; i < n; i++) next[i] = a[i] ?? i === 0;
      return next;
    });
  };
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Cells beats={beats} accents={accents} cur={cur} tones={TONES} onToggle={(i) => setAccents((a) => a.map((v, j) => (j === i ? !v : v)))} />
      <div className="flex items-center gap-3">
        <Stepper value={beats} onChange={(v) => resize(clamp(v, 2, 7))} step={1} min={2} max={7} unit="/4" />
        <PlayBtn playing={playing} onClick={() => setPlaying((p) => !p)} />
      </div>
    </div>
  );
}

function MeterRotary() {
  const [beats, setBeats] = useState(4);
  const [accents, setAccents] = useState<boolean[]>([true, false, true, false]);
  const [playing, setPlaying] = useState(true);
  const cur = useMetronome(useLab.getState().bpm, beats, 1, playing);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Knob value={beats} min={2} max={7} step={1} def={4} detents={[2, 3, 4, 5, 6, 7]} onChange={(v) => { const n = Math.round(v); setBeats(n); setAccents((a) => { const next = Array(n).fill(false); for (let i = 0; i < n; i++) next[i] = a[i] ?? i === 0; return next; }); }} color="var(--color-violet)" format={(v) => `${Math.round(v)}/4`} sub="beats / bar" />
      <div className="flex gap-1.5">
        {Array.from({ length: beats }).map((_, i) => (
          <button key={i} onClick={() => setAccents((a) => a.map((v, j) => (j === i ? !v : v)))} className="h-6 w-6 rounded-full border text-[9px] font-semibold transition" style={{ borderColor: accents[i] ? "var(--color-violet)" : "var(--color-line)", background: cur === i ? "var(--color-violet)" : "transparent", color: cur === i ? "#0a0a0c" : "var(--color-faint)" }}>
            ›
          </button>
        ))}
      </div>
      <PlayBtn playing={playing} onClick={() => setPlaying((p) => !p)} />
    </div>
  );
}

function TempoPulse() {
  const bpm = useLab((s) => s.bpm);
  const setBpm = useLab((s) => s.setBpm);
  const [sub, setSub] = useState<"4" | "8">("4");
  const [playing, setPlaying] = useState(true);
  const steps = sub === "8" ? 8 : 4;
  const cur = useMetronome(bpm, steps, sub === "8" ? 2 : 1, playing);
  const pulse = cur % (sub === "8" ? 2 : 1) === 0 && cur >= 0;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        animate={{ scale: pulse ? 1 : 0.82, opacity: pulse ? 1 : 0.4 }}
        transition={{ type: "spring", stiffness: 900, damping: 18 }}
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{ background: pulse ? "var(--color-amber)" : "var(--color-raised)" }}
      >
        <span className="tnum text-2xl font-semibold" style={{ color: pulse ? "#0a0a0c" : "var(--color-fg)" }}>
          {Math.round(bpm)}
        </span>
      </motion.div>
      <Segmented options={[{ label: "¼", value: "4" }, { label: "⅛", value: "8" }]} value={sub} onChange={(v) => setSub(v)} />
      <div className="flex items-center gap-3">
        <Knob value={bpm} min={40} max={240} step={1} def={120} onChange={setBpm} color="var(--color-amber)" size={84} format={(v) => `${Math.round(v)}`} />
        <PlayBtn playing={playing} onClick={() => setPlaying((p) => !p)} />
      </div>
    </div>
  );
}
