import { useRef, useState } from "react";
import { Fader } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { useDrag, clamp, polar, wrap } from "@/lib/controls";

const STEMS = [
  { key: "vocals", label: "Vocals", tone: "var(--color-azure)" },
  { key: "drums", label: "Drums", tone: "var(--color-amber)" },
  { key: "bass", label: "Bass", tone: "var(--color-violet)" },
  { key: "other", label: "Other", tone: "var(--color-accent)" },
] as const;
type Key = (typeof STEMS)[number]["key"];
const DEF: Record<Key, number> = { vocals: 82, drums: 92, bass: 70, other: 58 };

function toggleSet(set: Set<Key>, k: Key) {
  const n = new Set(set);
  n.has(k) ? n.delete(k) : n.add(k);
  return n;
}

export default function StemMixerLab() {
  const [levels, setLevels] = useState<Record<Key, number>>({ ...DEF });
  const [muted, setMuted] = useState<Set<Key>>(new Set());
  const [solo, setSolo] = useState<Set<Key>>(new Set());
  const anySolo = solo.size > 0;
  const eff = (k: Key) =>
    muted.has(k) ? 0 : anySolo ? (solo.has(k) ? levels[k] / 100 : 0) : levels[k] / 100;
  const master = Math.round((STEMS.reduce((a, s) => a + eff(s.key), 0) / 4) * 100);

  const setLevel = (k: Key, v: number) => setLevels((p) => ({ ...p, [k]: clamp(v, 0, 100) }));
  const reset = () => {
    setLevels({ ...DEF });
    setMuted(new Set());
    setSolo(new Set());
  };

  const readout = (tone: string) => <Readout value={master} unit="mix" size="sm" tone={tone} />;
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard name="Fader Bank" archetype="Per-stem · mute / solo" tone="var(--color-accent)" value={readout("var(--color-accent)")} onReset={reset}>
        <FaderBank
          levels={levels}
          setLevel={setLevel}
          muted={muted}
          solo={solo}
          onMute={(k) => setMuted((s) => toggleSet(s, k))}
          onSolo={(k) => setSolo((s) => toggleSet(s, k))}
          eff={eff}
        />
      </ModelCard>
      <ModelCard name="Stem Wheel" archetype="Radial · drag segment" tone="var(--color-amber)" value={readout("var(--color-amber)")} onReset={reset}>
        <RadialStem levels={levels} setLevel={setLevel} />
      </ModelCard>
      <ModelCard name="Focus Mixer" archetype="Progressive · one fader" tone="var(--color-violet)" value={readout("var(--color-violet)")} onReset={reset}>
        <FocusMixer levels={levels} setLevel={setLevel} />
      </ModelCard>
    </div>
  );
}

function Mini({ active, tone, onClick, children }: { active: boolean; tone: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="grid h-5 w-5 place-items-center rounded-md border text-[9px] font-semibold transition"
      style={{
        borderColor: active ? tone : "var(--color-line)",
        color: active ? "#0a0a0c" : "var(--color-faint)",
        background: active ? tone : "transparent",
      }}
    >
      {children}
    </button>
  );
}

function FaderBank({
  levels,
  setLevel,
  muted,
  solo,
  onMute,
  onSolo,
  eff,
}: {
  levels: Record<Key, number>;
  setLevel: (k: Key, v: number) => void;
  muted: Set<Key>;
  solo: Set<Key>;
  onMute: (k: Key) => void;
  onSolo: (k: Key) => void;
  eff: (k: Key) => number;
}) {
  return (
    <div className="flex items-end justify-center gap-3">
      {STEMS.map((s) => {
        const on = eff(s.key) > 0.001;
        return (
          <div key={s.key} className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1">
              <Mini active={muted.has(s.key)} tone="var(--color-rose)" onClick={() => onMute(s.key)}>
                M
              </Mini>
              <Mini active={solo.has(s.key)} tone="var(--color-amber)" onClick={() => onSolo(s.key)}>
                S
              </Mini>
            </div>
            <Fader value={levels[s.key]} min={0} max={100} def={DEF[s.key]} onChange={(v) => setLevel(s.key, v)} color={on ? s.tone : "var(--color-faint)"} length={116} thumb={26} />
            <span className="text-[10px]" style={{ color: on ? "var(--color-muted)" : "var(--color-faint)" }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RadialStem({ levels, setLevel }: { levels: Record<Key, number>; setLevel: (k: Key, v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const center = useRef({ x: 0, y: 0 });
  const size = 212;
  const cx = size / 2;
  const cy = size / 2;
  const ri = 28;
  const R = 98;

  const apply = (px: number, py: number) => {
    const dx = px - center.current.x;
    const dy = py - center.current.y;
    const dist = Math.hypot(dx, dy);
    const ang = wrap((Math.atan2(dx, -dy) * 180) / Math.PI, 360);
    const seg = Math.floor(wrap(ang + 45, 360) / 90);
    setLevel(STEMS[seg].key, clamp(((dist - ri) / (R - ri)) * 100, 0, 100));
  };
  const drag = useDrag({
    onStart: (e) => {
      const r = ref.current!.getBoundingClientRect();
      center.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      apply(e.clientX, e.clientY);
    },
    onMove: ({ px, py }) => apply(px, py),
  });

  return (
    <div ref={ref} className="grab relative" style={{ width: size, height: size }} onPointerDown={drag.onPointerDown}>
      <svg width={size} height={size}>
        {STEMS.map((s, i) => {
          const a0 = i * 90 - 45;
          const a1 = i * 90 + 45;
          const lvl = levels[s.key] / 100;
          const r = ri + lvl * (R - ri);
          const track = (rad: number) => {
            const pi0 = polar(cx, cy, ri, a0);
            const pi1 = polar(cx, cy, ri, a1);
            const p0 = polar(cx, cy, rad, a0);
            const p1 = polar(cx, cy, rad, a1);
            return `M ${pi0.x} ${pi0.y} L ${p0.x} ${p0.y} A ${rad} ${rad} 0 0 1 ${p1.x} ${p1.y} L ${pi1.x} ${pi1.y} A ${ri} ${ri} 0 0 0 ${pi0.x} ${pi0.y} Z`;
          };
          return (
            <g key={s.key}>
              <path d={track(R)} fill={s.tone} opacity={0.1} />
              <path d={track(r)} fill={s.tone} opacity={0.92} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={ri - 6} fill="var(--color-surface)" stroke="var(--color-line)" />
      </svg>
      {STEMS.map((s, i) => {
        const lp = polar(cx, cy, R + 16, i * 90);
        return (
          <span
            key={s.key}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wide"
            style={{ left: lp.x, top: lp.y, color: s.tone }}
          >
            {s.label.slice(0, 3)}
          </span>
        );
      })}
    </div>
  );
}

function FocusMixer({ levels, setLevel }: { levels: Record<Key, number>; setLevel: (k: Key, v: number) => void }) {
  const [focus, setFocus] = useState<Key>("vocals");
  const ftone = STEMS.find((s) => s.key === focus)!.tone;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-1.5">
        {STEMS.map((s) => (
          <button
            key={s.key}
            onClick={() => setFocus(s.key)}
            className="rounded-full border px-3 py-1 text-[11px] transition"
            style={{
              borderColor: focus === s.key ? s.tone : "var(--color-line)",
              color: focus === s.key ? s.tone : "var(--color-faint)",
              background: focus === s.key ? `color-mix(in oklab, ${s.tone} 14%, transparent)` : "transparent",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-4">
        <Fader value={levels[focus]} min={0} max={100} def={DEF[focus]} onChange={(v) => setLevel(focus, v)} color={ftone} length={132} thumb={30} />
        <div className="flex h-[132px] items-end gap-1.5">
          {STEMS.map((s) => (
            <div key={s.key} className="flex w-3 flex-col items-center gap-1">
              <div className="relative h-[112px] w-3 overflow-hidden rounded-full bg-hi">
                <div className="absolute inset-x-0 bottom-0 rounded-full transition-[height]" style={{ height: `${levels[s.key]}%`, background: s.tone }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
