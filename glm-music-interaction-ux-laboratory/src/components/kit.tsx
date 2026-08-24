import { useId } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";

export function ResetButton({
  onClick,
  label = "Reset",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-faint outline-none transition hover:border-line2 hover:text-fg focus-visible:border-line2 focus-visible:text-fg active:scale-90"
    >
      <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-[140deg]" />
    </button>
  );
}

export function Waveform({
  bars,
  progress = 0,
  color = "var(--color-accent)",
  dim = "var(--color-hi)",
  className,
  min = 0.05,
  gap = 2,
}: {
  bars: number[];
  progress?: number;
  color?: string;
  dim?: string;
  className?: string;
  min?: number;
  gap?: number;
}) {
  return (
    <div className={cn("flex h-full w-full items-center", className)} style={{ gap }}>
      {bars.map((b, i) => {
        const active = i / bars.length <= progress;
        return (
          <span
            key={i}
            className="flex-1 rounded-full transition-colors duration-150"
            style={{
              height: `${Math.max(min, b) * 100}%`,
              background: active ? color : dim,
              minWidth: 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function ModelCard({
  name,
  archetype,
  value,
  onReset,
  children,
  tone = "var(--color-accent)",
  className,
  bodyClassName,
}: {
  name: string;
  archetype: string;
  value?: ReactNode;
  onReset?: () => void;
  children: ReactNode;
  tone?: string;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-panel/70",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tone }}
            />
            <h3 className="truncate text-[13px] font-medium tracking-tight text-fg">
              {name}
            </h3>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-faint">
            {archetype}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {value}
          {onReset && <ResetButton onClick={onReset} />}
        </div>
      </header>
      <div className={cn("flex flex-1 items-center justify-center px-5 py-7", bodyClassName)}>
        {children}
      </div>
    </motion.section>
  );
}

export function Readout({
  value,
  unit,
  sub,
  size = "md",
  tone = "var(--color-fg)",
  className,
}: {
  value: string | number;
  unit?: string;
  sub?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: string;
  className?: string;
}) {
  const s = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }[size];
  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn("tnum font-semibold tracking-tight", s)} style={{ color: tone }}>
          {value}
        </span>
        {unit && (
          <span className="text-[10px] uppercase tracking-wider text-faint">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-faint">
          {sub}
        </span>
      )}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface p-1",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative rounded-full px-3.5 py-1.5 text-xs outline-none"
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-hi"
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
              />
            )}
            <span
              className={cn(
                "relative transition-colors",
                active ? "text-fg" : "text-faint"
              )}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Tag({
  children,
  tone = "var(--color-muted)",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
      <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  );
}

export function Frame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface/60", className)}>
      {children}
    </div>
  );
}
