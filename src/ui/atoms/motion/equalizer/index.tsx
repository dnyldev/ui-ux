import { cn } from "../../../../core/cn";

const tones = {
  accent: "bg-accent",
  teal: "bg-teal",
  violet: "bg-violet",
  green: "bg-green",
  ink: "bg-ink-2",
} as const;

const HEIGHTS = [12, 20, 15, 24, 14, 18, 9, 21, 13, 16, 22, 11];

export interface EqualizerBarsProps {
  bars?: number;
  active?: boolean;
  tone?: keyof typeof tones;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * @atom(motion) — animated equalizer bars.
 * Live-playing indicator for: now-playing card, stem meters, sidebar logo.
 */
export function EqualizerBars({
  bars = 5,
  active = true,
  tone = "accent",
  width = 3,
  height = 18,
  className,
}: EqualizerBarsProps) {
  return (
    <span className={cn("flex items-end gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("eq-bar rounded-full", tones[tone], !active && "[animation-play-state:paused] opacity-35")}
          style={{
            width,
            height: HEIGHTS[i % HEIGHTS.length] * (height / 18),
            animationDelay: `${(i % 5) * 0.13}s`,
            animationDuration: `${0.75 + (i % 3) * 0.14}s`,
          }}
        />
      ))}
    </span>
  );
}
