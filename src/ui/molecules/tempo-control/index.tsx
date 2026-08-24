import { useRef, useState } from "react";
import { Minus, Plus, Waves } from "lucide-react";
import { cn } from "../../../core/cn";
import { IconButton } from "../../atoms/icon-button";
import { Tooltip } from "../../atoms/tooltip";
import { Knob } from "../../atoms/knob";
import { Button } from "../../atoms/button";

export interface TempoControlProps {
  bpm?: number;
  min?: number;
  max?: number;
  variant?: "stepper" | "knob" | "tap" | "compact";
  onChange?: (bpm: number) => void;
  className?: string;
}

/**
 * @molecule — tempo (BPM) control in 4 models:
 * stepper · knob · tap (beat detection) · compact
 */
export function TempoControl({
  bpm = 120,
  min = 40,
  max = 220,
  variant = "stepper",
  onChange,
  className,
}: TempoControlProps) {
  const [value, setValue] = useState(bpm);
  const taps = useRef<number[]>([]);
  const [flash, setFlash] = useState(false);

  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, Math.round(v)));
    setValue(next);
    onChange?.(next);
  };

  if (variant === "knob") {
    return (
      <div className={cn("inline-flex", className)}>
        <Knob
          label="TEMPO"
          min={min}
          max={max}
          defaultValue={value}
          format={(v) => `${Math.round(v)} BPM`}
          onChange={set}
        />
      </div>
    );
  }

  if (variant === "tap") {
    const onTap = () => {
      const now = performance.now();
      const list = [...taps.current.filter((t) => now - t < 3000), now];
      taps.current = list.slice(-5);
      if (list.length >= 2) {
        const deltas = list.slice(1).map((t, i) => t - list[i]);
        const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        set(60000 / avg);
      }
      setFlash(true);
      setTimeout(() => setFlash(false), 180);
    };
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className="w-20 text-end font-mono text-xl text-ink">{value}</span>
        <Button intent={flash ? "soft" : "outline"} onClick={onTap}>
          <Waves className="size-4" />
          TAP
        </Button>
        <span className="text-[11px] text-ink-3">چند بار ضربه بزن تا BPM محاسبه شود</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1 rounded-lg border border-line bg-surface px-1.5 py-1", className)}>
        <IconButton size="sm" intent="subtle" aria-label="کمتر" onClick={() => set(value - 1)}>
          <Minus />
        </IconButton>
        <span className="min-w-14 text-center font-mono text-[13px] text-ink">{value}</span>
        <IconButton size="sm" intent="subtle" aria-label="بیشتر" onClick={() => set(value + 1)}>
          <Plus />
        </IconButton>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="text-[11px] font-bold tracking-[0.18em] text-ink-3">TEMPO</span>
      <Tooltip label="کمتر">
        <IconButton size="sm" intent="subtle" aria-label="کمتر" onClick={() => set(value - 1)}>
          <Minus />
        </IconButton>
      </Tooltip>
      <span className="w-12 text-center font-mono text-lg text-ink">{value}</span>
      <Tooltip label="بیشتر">
        <IconButton size="sm" intent="subtle" aria-label="بیشتر" onClick={() => set(value + 1)}>
          <Plus />
        </IconButton>
      </Tooltip>
      <span className="text-[11px] text-ink-3">BPM</span>
    </div>
  );
}
