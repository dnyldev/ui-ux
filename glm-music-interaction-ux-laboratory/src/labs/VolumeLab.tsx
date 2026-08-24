import { useRef, useState } from "react";
import { Fader, ArcSlider } from "@/components/primitives";
import { ModelCard, Readout } from "@/components/kit";
import { useDrag, clamp } from "@/lib/controls";
import { Volume2, VolumeX } from "lucide-react";

const TONE = "var(--color-amber)";
const DBTICKS = [
  { pos: 1, label: "0" },
  { pos: 0.75, label: "-3" },
  { pos: 0.5, label: "-6" },
  { pos: 0.25, label: "-12" },
  { pos: 0.02, label: "-∞" },
];
const DEF = 80;

export default function VolumeLab() {
  const [vol, setVol] = useState(DEF);
  const readout = (tone: string) => (
    <Readout value={Math.round(vol)} unit="%" size="sm" tone={tone} />
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Channel Fader"
        archetype="Absolute · dB scale"
        tone={TONE}
        value={readout(TONE)}
        onReset={() => setVol(DEF)}
      >
        <Fader
          value={vol}
          min={0}
          max={100}
          def={DEF}
          onChange={setVol}
          color={TONE}
          unit="dB"
          ticks={DBTICKS}
          length={190}
        />
      </ModelCard>

      <ModelCard
        name="Radial"
        archetype="Arc · angular drag"
        tone="var(--color-azure)"
        value={readout("var(--color-azure)")}
        onReset={() => setVol(DEF)}
      >
        <ArcSlider
          value={vol}
          min={0}
          max={100}
          def={DEF}
          onChange={setVol}
          color="var(--color-azure)"
          format={(v) => `${Math.round(v)}`}
          label="level"
        />
      </ModelCard>

      <ModelCard
        name="Free Surface"
        archetype="Relative · occlusion-safe"
        tone="var(--color-violet)"
        value={readout("var(--color-violet)")}
        onReset={() => setVol(DEF)}
      >
        <FreeVol vol={vol} setVol={setVol} />
      </ModelCard>
    </div>
  );
}

function FreeVol({ vol, setVol }: { vol: number; setVol: (v: number) => void }) {
  const [muted, setMuted] = useState(false);
  const last = useRef(DEF);
  const drag = useDrag({
    onMove: ({ dy }) => {
      setVol(clamp(vol - dy * 0.5, 0, 100));
    },
  });
  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      setVol(last.current);
    } else {
      last.current = vol;
      setMuted(true);
      setVol(0);
    }
  };
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="tnum text-3xl font-semibold text-fg">{Math.round(vol)}</span>
        <button
          onClick={toggleMute}
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-faint transition hover:border-line2 hover:text-fg"
          style={muted ? { color: "var(--color-rose)", borderColor: "var(--color-rose)" } : undefined}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
      <div
        className="grab relative h-36 w-full overflow-hidden rounded-2xl border border-line bg-surface"
        onPointerDown={drag.onPointerDown}
      >
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-75"
          style={{ height: `${vol}%`, background: "linear-gradient(to top, var(--color-violet), color-mix(in oklab, var(--color-violet) 55%, transparent))" }}
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-faint/40">
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg leading-none">↑</span>
            <span className="h-8 w-px bg-current" />
            <span className="text-lg leading-none">↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
