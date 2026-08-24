import { useState } from "react";
import { Music2, Play } from "lucide-react";
import { cn } from "../../../core/cn";
import { EqualizerBars } from "../../atoms/motion/equalizer";

const COVERS = [
  "linear-gradient(135deg,#f2a93b,#b9743a)",
  "linear-gradient(135deg,#45c4b0,#1f6f63)",
  "linear-gradient(135deg,#a78bfa,#5b3fa8)",
  "linear-gradient(135deg,#f2706d,#8a3434)",
];

export interface LibraryCardProps {
  variant?: "vertical" | "row" | "selected";
  title?: string;
  artist?: string;
  duration?: string;
  index?: number;
  className?: string;
}

/**
 * @organism — track card for library / search results.
 * vertical: album grid · row: list · selected: playing state with meter
 */
export function LibraryCard({
  variant = "vertical",
  title = "Neon Skyline",
  artist = "Aria Vale",
  duration = "3:42",
  index = 1,
  className,
}: LibraryCardProps) {
  const [playing, setPlaying] = useState(false);
  const cover = COVERS[(index - 1) % COVERS.length];

  if (variant === "row" || variant === "selected") {
    const selected = variant === "selected";
    return (
      <div
        className={cn(
          "group flex h-14 items-center gap-3 rounded-xl border border-line bg-surface px-3.5 transition-colors",
          selected && "border-accent/50 bg-accent/8",
          className
        )}
      >
        <span className="w-5 shrink-0 text-center font-mono text-[11.5px] text-ink-3">
          {selected ? <EqualizerBars bars={3} height={8} width={2} /> : String(index).padStart(2, "0")}
        </span>
        <span className="size-9 shrink-0 rounded-lg" style={{ background: cover }}>
          <Music2 className="mx-auto mt-2 size-4 text-[#1a1305]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-ink">{title}</div>
          <div className="truncate text-[11px] text-ink-3">{artist}</div>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ink-3">{duration}</span>
        <button
          type="button"
          aria-label="پخش"
          onClick={() => setPlaying((p) => !p)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[#1a1305] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Play className="size-4 fill-current translate-x-px" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("group w-40 select-none", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line" style={{ background: cover }}>
        <Music2 className="absolute inset-0 m-auto size-8 text-[#1a1305]/70" />
        <button
          type="button"
          aria-label="پخش"
          onClick={() => setPlaying((p) => !p)}
          className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-[#1a1305] shadow-lg active:scale-95">
            <Play className="size-5 fill-current translate-x-px" />
          </span>
        </button>
        {playing && (
          <span className="absolute inset-x-2 bottom-2 flex justify-center rounded-md bg-black/45 py-1.5">
            <EqualizerBars bars={4} height={10} />
          </span>
        )}
      </div>
      <div className="mt-2 truncate text-[13px] font-medium text-ink">{title}</div>
      <div className="truncate text-[11px] text-ink-3">{artist}</div>
    </div>
  );
}
