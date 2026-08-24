import { cn } from "../../../../core/cn";

const tones = {
  accent: "bg-accent",
  teal: "bg-teal",
  violet: "bg-violet",
  green: "bg-green",
  red: "bg-red",
} as const;

export interface PulseDotProps {
  tone?: keyof typeof tones;
  size?: "sm" | "md";
  label?: React.ReactNode;
  className?: string;
}

/**
 * @atom(motion) — soft pinging status dot.
 * Recording / streaming / "آنلاین" indicators.
 */
export function PulseDot({ tone = "green", size = "md", label, className }: PulseDotProps) {
  const px = size === "sm" ? "size-2" : "size-2.5";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("relative inline-flex", px)}>
        <span
          className={cn("absolute inline-flex h-full w-full rounded-full", tones[tone])}
          style={{ animation: "ping-soft 1.7s cubic-bezier(0,0,0.2,1) infinite" }}
        />
        <span className={cn("relative inline-flex rounded-full", px, tones[tone])} />
      </span>
      {label && <span className="text-[11.5px] font-medium text-ink-2">{label}</span>}
    </span>
  );
}
