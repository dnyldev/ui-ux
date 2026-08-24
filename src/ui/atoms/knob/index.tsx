import { useCallback, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const tones = {
  accent: "bg-accent",
  teal: "bg-teal",
  violet: "bg-violet",
} as const;

const knobCva = cva(
  "relative inline-block shrink-0 rounded-full border border-line-strong bg-[radial-gradient(circle_at_35%_30%,#2a2e38,#17191f_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_18px_-6px_rgba(0,0,0,0.6)] touch-none cursor-ns-resize select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  {
    variants: {
      size: { sm: "size-11", md: "size-14", lg: "size-[72px]" },
      tone: { accent: "", teal: "", violet: "" },
    },
    defaultVariants: { size: "md", tone: "accent" },
  }
);

export interface KnobProps extends VariantProps<typeof knobCva> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  label?: string;
  format?: (v: number) => string;
  className?: string;
}

/**
 * @atom — rotary knob (drag vertically / arrow keys).
 * Classic for: tempo, pitch, drive, reverb…
 * tones: accent · teal · violet · sizes: sm · md · lg
 */
export function Knob({
  size,
  tone,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 50,
  onChange,
  label,
  format = (v) => `${Math.round(v)}`,
  className,
}: KnobProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const drag = useRef<{ startY: number; start: number } | null>(null);

  const setVal = useCallback(
    (v: number) => {
      const stepped = Math.round(v / step) * step;
      const clamped = Math.min(max, Math.max(min, stepped));
      setInternal(clamped);
      onChange?.(clamped);
    },
    [min, max, step, onChange]
  );

  const pct = (current - min) / (max - min);
  const angle = -135 + pct * 270;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        tabIndex={0}
        className={cn(knobCva({ size, tone }))}
        onPointerDown={(e) => {
          drag.current = { startY: e.clientY, start: current };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dy = drag.current.startY - e.clientY;
          const range = max - min;
          setVal(drag.current.start + (dy / 90) * range);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") setVal(current + step);
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") setVal(current - step);
          if (e.key === "Home") setVal(min);
          if (e.key === "End") setVal(max);
        }}
      >
        {/* rotating indicator */}
        <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
          <div
            className={cn(
              "absolute left-1/2 top-[12%] h-[34%] w-[3px] -translate-x-1/2 rounded-full",
              tones[tone ?? "accent"]
            )}
          />
        </div>
      </div>
      {label && <span className="text-[10.5px] font-medium tracking-wide text-ink-3">{label}</span>}
      <span className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[11px] text-ink-2">
        {format(current)}
      </span>
    </div>
  );
}
