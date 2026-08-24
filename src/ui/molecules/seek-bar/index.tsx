import { useState } from "react";
import { cn } from "../../../core/cn";
import { Slider } from "../../atoms/slider";

export function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export interface SeekBarProps {
  duration?: number;
  current?: number;
  tone?: "accent" | "teal" | "violet";
  variant?: "times" | "minimal";
  className?: string;
}

/**
 * @molecule — seek / scrub bar with time labels.
 * If you pass neither current nor onSeek the bar stays interactive internally.
 */
export function SeekBar({
  duration = 214,
  current,
  tone = "accent",
  variant = "times",
  className,
}: SeekBarProps) {
  const [internal, setInternal] = useState(current ?? 64);
  const pos = current ?? internal;

  return (
    <div className={cn("flex w-full items-center gap-2.5", className)}>
      {variant === "times" && (
        <span className="w-10 shrink-0 text-end font-mono text-[11px] text-ink-3">{fmtTime(pos)}</span>
      )}
      <Slider
        size="sm"
        tone={tone}
        min={0}
        max={Math.round(duration)}
        value={pos}
        onValueChange={(v) => setInternal(v[0] ?? pos)}
      />
      {variant === "times" && (
        <span className="w-10 shrink-0 font-mono text-[11px] text-ink-3">{fmtTime(duration)}</span>
      )}
    </div>
  );
}
