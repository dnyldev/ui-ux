import { useId, useState } from "react";
import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const segCva = cva(
  "relative inline-flex items-center rounded-xl border border-line bg-white/5 p-1",
  {
    variants: {
      size: { sm: "h-9", md: "h-10", lg: "h-11" },
      variant: { pill: "", underline: "rounded-none border-0 bg-transparent p-0" },
    },
    defaultVariants: { size: "md", variant: "pill" },
  }
);

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  fa?: string;
}

export interface SegmentedProps<T extends string>
  extends VariantProps<typeof segCva> {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
  className?: string;
}

/**
 * @atom — segmented control with animated sliding indicator.
 * Use for: view switches (waves/stems/chords), quality A/B…
 */
export function Segmented<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  size,
  variant,
  className,
}: SegmentedProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const active = value ?? internal;
  const groupId = useId();

  if (variant === "underline") {
    return (
      <div className={cn("inline-flex items-center gap-1 border-b border-line", className)}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setInternal(o.value);
              onChange?.(o.value);
            }}
            className={cn(
              "relative cursor-pointer px-3.5 py-2 text-[13px] font-medium transition-colors",
              active === o.value ? "text-ink" : "text-ink-3 hover:text-ink-2"
            )}
          >
            {o.label}
            {active === o.value && (
              <motion.span
                layoutId={`${groupId}-u`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(segCva({ size, variant }), className)}>
      {options.map((o) => {
        const isActive = active === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setInternal(o.value);
              onChange?.(o.value);
            }}
            className={cn(
              "relative z-10 cursor-pointer px-4 text-[13px] font-medium transition-colors",
              size === "sm" ? "h-7" : size === "lg" ? "h-9" : "h-8",
              isActive ? "text-ink" : "text-ink-3 hover:text-ink-2"
            )}
          >
            {o.label}
            {isActive && (
              <motion.span
                layoutId={`${groupId}-p`}
                className="absolute inset-0 -z-10 rounded-lg border border-line-strong bg-overlay shadow"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
