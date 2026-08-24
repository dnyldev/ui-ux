import { useMemo, useState } from "react";
import { cn } from "../../../core/cn";

const toneHex = {
  accent: "#f2a93b",
  teal: "#45c4b0",
  violet: "#a78bfa",
  green: "#4cc9a6",
} as const;

export interface WaveformProps {
  bars?: number;
  progress?: number;
  selection?: [number, number] | null;
  tone?: keyof typeof toneHex;
  height?: number;
  interactive?: boolean;
  className?: string;
}

function genHeights(count: number, seed: number): number[] {
  return Array.from({ length: count }).map((_, i) => {
    const a = Math.sin(i * 0.42 + seed) * 0.5 + 0.5;
    const b = Math.sin(i * 0.13 + seed * 2.7) * 0.5 + 0.5;
    return 0.1 + 0.9 * (0.55 * a + 0.45 * b);
  });
}

/**
 * @molecule — waveform with progress, selection region and click-to-seek.
 */
export function Waveform({
  bars = 72,
  progress,
  selection = null,
  tone = "accent",
  height = 56,
  interactive = true,
  className,
}: WaveformProps) {
  const [internal, setInternal] = useState(progress ?? 0.42);
  const pos = progress ?? internal;
  const heights = useMemo(() => genHeights(bars, 3.1), [bars]);
  const color = toneHex[tone];

  return (
    <div
      className={cn("relative w-full select-none", interactive && "cursor-pointer", className)}
      style={{ height }}
      role={interactive ? "slider" : undefined}
      aria-label={interactive ? "جای پخش" : undefined}
      aria-valuenow={Math.round(pos * 100)}
      onPointerDown={(e) => {
        if (!interactive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setInternal(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!interactive || e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setInternal(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
      }}
    >
      <div className="absolute inset-0 flex items-center gap-[2px]">
        {heights.map((h, i) => {
          const played = (i + 1) / bars <= pos;
          return (
            <span
              key={i}
              className="min-w-0 flex-1 rounded-[2px] transition-colors duration-100"
              style={{
                height: `${h * 100}%`,
                background: played ? color : "rgba(255,255,255,0.12)",
                opacity: played ? 1 : 0.9,
              }}
            />
          );
        })}
      </div>
      {selection && (
        <div
          className="absolute inset-y-0 border-x border-teal/50 bg-teal/15"
          style={{ left: `${selection[0] * 100}%`, width: `${(selection[1] - selection[0]) * 100}%` }}
        />
      )}
      {interactive && (
        <span
          className="absolute inset-y-0 w-px bg-white/40"
          style={{ left: `${pos * 100}%` }}
        />
      )}
    </div>
  );
}
