import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const tones = {
  accent: "bg-accent",
  teal: "bg-teal",
  violet: "bg-violet",
} as const;

const sliderCva = cva("relative flex w-full touch-none select-none items-center", {
  variants: {
    size: { sm: "h-4", md: "h-5" },
    tone: { accent: "", teal: "", violet: "" },
  },
  defaultVariants: { size: "md", tone: "accent" },
});

export interface SliderProps extends VariantProps<typeof sliderCva> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number[]) => void;
  /** renders a live numeric badge next to the track */
  showValue?: boolean;
  format?: (v: number) => string;
  className?: string;
}

/**
 * @atom — accessible range slider (Radix).
 * tones: accent · teal · violet · sizes: sm · md
 * Building block of: volume, seek, tempo, EQ…
 */
export function Slider({
  size,
  tone,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 50,
  onValueChange,
  showValue,
  format,
  className,
}: SliderProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SliderPrimitive.Root
        className={cn(sliderCva({ size, tone }))}
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={(v) => {
          setInternal(v[0] ?? current);
          onValueChange?.(v);
        }}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <SliderPrimitive.Range className={cn("absolute h-full", tones[tone ?? "accent"])} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-[15px] rounded-full border-2 border-[#0f1014] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.55)] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
      </SliderPrimitive.Root>
      {showValue && (
        <span className="min-w-10 shrink-0 rounded-md border border-line bg-raised px-2 py-1 text-center font-mono text-[11px] text-ink-2">
          {format ? format(current) : current}
        </span>
      )}
    </div>
  );
}
