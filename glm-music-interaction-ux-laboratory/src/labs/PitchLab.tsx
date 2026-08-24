import { useEffect, useRef, useState } from "react";
import { Knob } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { cn } from "@/utils/cn";
import { useDrag, clamp, roundTo, haptic } from "@/lib/controls";

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const noteName = (semi: number) => NAMES[((semi % 12) + 12) % 12];
const sign = (s: number) => (s > 0 ? `+${s}` : `${s}`);
const BLACK = new Set([1, 3, 6, 8, 10]);

export default function PitchLab() {
  const [semi, setSemi] = useState(0);
  const readout = (tone: string) => (
    <Readout value={sign(semi)} unit="st" size="sm" tone={tone} />
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Keyboard"
        archetype="Spatial · tap key"
        tone="var(--color-accent)"
        value={readout("var(--color-accent)")}
        onReset={() => setSemi(0)}
      >
        <Keyboard semi={semi} setSemi={setSemi} />
      </ModelCard>

      <ModelCard
        name="Detent Knob"
        archetype="Rotary · snaps to step"
        tone="var(--color-violet)"
        value={readout("var(--color-violet)")}
        onReset={() => setSemi(0)}
      >
        <Knob
          value={semi}
          min={-12}
          max={12}
          step={1}
          def={0}
          onChange={setSemi}
          color="var(--color-violet)"
          detents={[0]}
          format={(v) => sign(Math.round(v))}
          sub="−12 – +12"
        />
      </ModelCard>

      <ModelCard
        name="Reel"
        archetype="Horizontal pan · snap"
        tone="var(--color-azure)"
        value={readout("var(--color-azure)")}
        onReset={() => setSemi(0)}
      >
        <Reel semi={semi} setSemi={setSemi} />
      </ModelCard>
    </div>
  );
}

function Keyboard({ semi, setSemi }: { semi: number; setSemi: (v: number) => void }) {
  const start = -12;
  const end = 12;
  const whites: { semi: number }[] = [];
  const blacks: { semi: number; after: number }[] = [];
  let wi = 0;
  for (let s = start; s <= end; s++) {
    if (BLACK.has(((s % 12) + 12) % 12)) blacks.push({ semi: s, after: wi - 1 });
    else {
      whites.push({ semi: s });
      wi++;
    }
  }
  const ww = 100 / whites.length;
  return (
    <div className="w-full">
      <div className="relative h-32 w-full select-none">
        <div className="flex h-full w-full gap-[1px]">
          {whites.map((w) => {
            const active = w.semi === semi;
            return (
              <button
                key={w.semi}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSemi(clamp(w.semi, -12, 12));
                  haptic(6);
                }}
                className="relative flex-1 rounded-b-md border border-line2 bg-[var(--color-raised)] transition"
                style={active ? { background: "var(--color-accent)" } : undefined}
              >
                {((w.semi % 12) + 12) % 12 === 0 && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-faint"
                    style={active ? { color: "#04130d" } : undefined}
                  >
                    C
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {blacks.map((b) => (
          <button
            key={b.semi}
            onPointerDown={(e) => {
              e.preventDefault();
              setSemi(clamp(b.semi, -12, 12));
              haptic(6);
            }}
            className="absolute top-0 z-10 h-[62%] rounded-b-md border border-black/60 bg-[var(--color-canvas)]"
            style={{
              left: `calc(${(b.after + 1) * ww}% - ${ww * 0.3}%)`,
              width: `${ww * 0.6}%`,
              background: b.semi === semi ? "var(--color-accent)" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Reel({ semi, setSemi }: { semi: number; setSemi: (v: number) => void }) {
  const W = 46;
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(220);
  useEffect(() => {
    const r = ref.current;
    if (!r) return;
    const ro = new ResizeObserver(() => setCw(r.clientWidth));
    ro.observe(r);
    setCw(r.clientWidth);
    return () => ro.disconnect();
  }, []);
  const drag = useDrag({
    onMove: ({ dx }) => setSemi(clamp(semi - dx / W, -12, 12)),
    onEnd: () => {
      setSemi(roundTo(semi, 1));
      haptic(6);
    },
  });
  const offset = cw / 2 - W / 2 - (semi + 12) * W;
  const semis = [];
  for (let s = -12; s <= 12; s++) semis.push(s);
  return (
    <div
      ref={ref}
      className="grab relative h-32 w-full overflow-hidden rounded-2xl border border-line bg-surface"
      onPointerDown={drag.onPointerDown}
    >
      <div className="absolute inset-y-0 flex items-center" style={{ transform: `translateX(${offset}px)` }}>
        {semis.map((s) => {
          const active = Math.round(semi) === s;
          return (
            <div key={s} className="flex flex-col items-center justify-center gap-1" style={{ width: W }}>
              <span className={cn("tnum text-sm font-medium", active ? "text-[var(--color-azure)]" : "text-faint")}>
                {sign(s)}
              </span>
              <span className={cn("text-[8px]", active ? "text-muted" : "text-faint")}>{noteName(s)}</span>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-[var(--color-azure)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
