import { useState } from "react";
import { Knob, XYPad } from "@/components/primitives";
import { ModelCard, Readout, Segmented } from "@/components/kit";

export default function VocalIsolationLab() {
  const [strength, setStrength] = useState(72);
  const [pad, setPad] = useState({ x: 0.72, y: 0.62 });
  const [mode, setMode] = useState<"off" | "soft" | "hard">("soft");
  const [thresh, setThresh] = useState(68);

  const master = (tone: string, v: number, unit = "%") => (
    <Readout value={Math.round(v)} unit={unit} size="sm" tone={tone} />
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      <ModelCard
        name="Intensity"
        archetype="Rotary · continuous"
        tone="var(--color-accent)"
        value={master("var(--color-accent)", strength)}
        onReset={() => setStrength(72)}
      >
        <div className="flex flex-col items-center gap-4">
          <Knob
            value={strength}
            min={0}
            max={100}
            step={1}
            def={72}
            onChange={setStrength}
            format={(v) => `${Math.round(v)}`}
            sub="isolation"
          />
          <SplitMeter v={strength / 100} tone="var(--color-accent)" />
        </div>
      </ModelCard>

      <ModelCard
        name="Separation Pad"
        archetype="2D · blend"
        tone="var(--color-azure)"
        value={
          <div className="flex flex-col items-end gap-1 leading-none">
            <Readout value={Math.round(pad.x * 100)} unit="iso" size="sm" tone="var(--color-azure)" />
            <Readout value={Math.round(pad.y * 100)} unit="vox" size="xs" tone="var(--color-faint)" />
          </div>
        }
        onReset={() => setPad({ x: 0.72, y: 0.62 })}
      >
        <div className="flex flex-col items-center gap-2">
          <XYPad
            x={pad.x}
            y={pad.y}
            onChange={(x, y) => setPad({ x, y })}
            color="var(--color-azure)"
            labels={{ x0: "Dry", x1: "Isolated" }}
          />
          <span className="text-[9px] uppercase tracking-wider text-faint">vocals ↑ · instruments ↓</span>
        </div>
      </ModelCard>

      <ModelCard
        name="Mode + Threshold"
        archetype="Progressive · discrete→fine"
        tone="var(--color-violet)"
        value={mode === "off" ? <Readout value="off" size="sm" tone="var(--color-faint)" /> : master("var(--color-violet)", thresh)}
        onReset={() => {
          setMode("soft");
          setThresh(68);
        }}
      >
        <div className="flex flex-col items-center gap-5">
          <Segmented
            options={[
              { label: "Off", value: "off" },
              { label: "Soft", value: "soft" },
              { label: "Hard", value: "hard" },
            ]}
            value={mode}
            onChange={(v) => setMode(v)}
          />
          {mode !== "off" ? (
            <Knob
              value={thresh}
              min={40}
              max={95}
              step={1}
              def={68}
              onChange={setThresh}
              color="var(--color-violet)"
              format={(v) => `${Math.round(v)}`}
              sub="threshold"
            />
          ) : (
            <div className="grid h-[108px] w-[108px] place-items-center rounded-full border border-line text-faint">
              <span className="text-[11px] uppercase tracking-widest">bypass</span>
            </div>
          )}
        </div>
      </ModelCard>
    </div>
  );
}

function SplitMeter({ v, tone }: { v: number; tone: string }) {
  return (
    <div className="flex h-6 w-44 items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider text-faint">vox</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-hi">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v * 100}%`, background: tone }} />
      </div>
      <span className="text-[9px] uppercase tracking-wider text-faint">inst</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-hi">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(1 - v) * 100}%`, background: "var(--color-muted)" }} />
      </div>
    </div>
  );
}
