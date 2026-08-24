import { useState, type PointerEvent } from "react";
import { cn } from "../../../core/cn";

const toneHex = {
  accent: "#f2a93b",
  teal: "#45c4b0",
  violet: "#a78bfa",
} as const;

const DEFAULTS = [0.72, 0.4, 0.88, 0.55, 0.66, 0.3, 0.78, 0.48];

export interface EqBandsProps {
  bands?: number;
  tone?: keyof typeof toneHex;
  size?: "default" | "compact";
  className?: string;
}

function Band({
  tone,
  value,
  onChange,
  compact,
}: {
  tone: keyof typeof toneHex;
  value: number;
  onChange: (v: number) => void;
  compact: boolean;
}) {
  const handle = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = 1 - (e.clientY - rect.top) / rect.height;
    onChange(Math.min(1, Math.max(0, v)));
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer touch-none overflow-hidden rounded-full bg-white/6",
        compact ? "w-3" : "w-4"
      )}
      onPointerDown={(e) => handle(e)}
      onPointerMove={(e) => {
        if (e.buttons === 1) handle(e);
      }}
    >
      <div
        className={cn("absolute inset-x-0 bottom-0 rounded-full", "transition-[height] duration-75")}
        style={{ height: `${value * 100}%`, background: toneHex[tone] }}
      />
      <div
        className="absolute left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-white/85 shadow"
        style={{ bottom: `calc(${value * 100}% - 2px)` }}
      />
    </div>
  );
}

/**
 * @molecule — vertical EQ band editor (drag up/down).
 * Frequency bands for the EQ panel; compact row for track-level shaping.
 */
export function EqBands({
  bands = 8,
  tone = "accent",
  size = "default",
  className,
}: EqBandsProps) {
  const [values, setValues] = useState<number[]>(() =>
    Array.from({ length: bands }).map((_, i) => DEFAULTS[i % DEFAULTS.length])
  );
  const compact = size === "compact";

  return (
    <div
      className={cn("flex items-end gap-1.5", compact ? "h-16" : "h-24", className)}
      style={{ minHeight: compact ? 64 : 96 }}
    >
      {values.map((v, i) => (
        <Band
          key={i}
          tone={tone}
          value={v}
          compact={compact}
          onChange={(nv) => setValues((prev) => prev.map((p, j) => (j === i ? nv : p)))}
        />
      ))}
    </div>
  );
}
