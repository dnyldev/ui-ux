import { useState } from "react";
import { Music2 } from "lucide-react";
import { cn } from "../../../core/cn";
import { TransportControls } from "../../molecules/transport-controls";
import { SeekBar } from "../../molecules/seek-bar";
import { VolumeControl } from "../../molecules/volume-control";
import { TempoControl } from "../../molecules/tempo-control";
import { Waveform } from "../../molecules/waveform";
import { EqualizerBars } from "../../atoms/motion/equalizer";

export interface TrackInfo {
  title: string;
  artist: string;
}

export interface PlayerBarProps {
  variant?: "default" | "compact" | "expanded";
  track?: TrackInfo;
  className?: string;
}

/**
 * @organism — the player bar.
 * default: artwork · info · transport · seek · volume
 * compact: strip for small viewports · expanded: + waveform & tempo row
 */
export function PlayerBar({
  variant = "default",
  track = { title: "Midnight Drive", artist: "Resonance" },
  className,
}: PlayerBarProps) {
  const [playing, setPlaying] = useState(true);
  const isCompact = variant === "compact";

  return (
    <div className={cn("rounded-2xl border border-line bg-raised p-3.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)]", className)}>
      <div className="flex items-center gap-3.5">
        {/* artwork */}
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-accent/85 via-[#b9743a] to-teal/80">
          <Music2 className="absolute inset-0 m-auto size-5 text-[#1a1305]" />
          {playing && (
            <span className="absolute inset-x-1 bottom-1 flex justify-center">
              <EqualizerBars bars={3} height={6} width={2} tone="ink" />
            </span>
          )}
        </div>

        {/* info */}
        <div className={cn("min-w-0 shrink-0", isCompact ? "" : "w-44")}>
          <div className="truncate text-[13.5px] font-medium text-ink">{track.title}</div>
          <div className="truncate text-[11px] text-ink-3">{track.artist}</div>
        </div>

        {/* transport */}
        {!isCompact && (
          <div className="flex flex-1 justify-center">
            <TransportControls variant="minimal" size="sm" playing={playing} onPlayingChange={setPlaying} />
          </div>
        )}

        {/* seek */}
        <div className={cn("min-w-0", isCompact ? "w-24" : "flex-1")}>
          <SeekBar variant={isCompact ? "minimal" : "times"} />
        </div>

        {/* volume */}
        {!isCompact && (
          <div className="hidden w-32 shrink-0 md:block">
            <VolumeControl variant="compact" />
          </div>
        )}
      </div>

      {variant === "expanded" && (
        <div className="mt-3.5 flex items-center justify-between gap-4">
          <Waveform className="min-w-0 flex-1" height={36} bars={96} interactive />
          <TempoControl variant="compact" className="shrink-0" />
        </div>
      )}
    </div>
  );
}
