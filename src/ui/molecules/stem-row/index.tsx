import { useState } from "react";
import { Drum, Guitar, Headphones, Mic, Music2, VolumeX, type LucideIcon } from "lucide-react";
import { cn } from "../../../core/cn";
import { IconButton } from "../../atoms/icon-button";
import { Tooltip } from "../../atoms/tooltip";

export interface Stem {
  id: string;
  label: string;
  fa: string;
  color: string;
  icon: LucideIcon;
}

/** Preset stems — the four canonical moises/chordify layers. */
export const STEMS: Stem[] = [
  { id: "vocals", label: "Vocals", fa: "وکال", color: "#45c4b0", icon: Mic },
  { id: "drums", label: "Drums", fa: "درام", color: "#f2a93b", icon: Drum },
  { id: "bass", label: "Bass", fa: "بیس", color: "#a78bfa", icon: Guitar },
  { id: "other", label: "Other", fa: "سایر", color: "#4cc9a6", icon: Music2 },
];

export interface StemRowProps {
  stem?: Stem;
  playing?: boolean;
  compact?: boolean;
  selected?: boolean;
  className?: string;
}

/**
 * @molecule — single stem row: icon · label · level meter · mute / solo.
 * Core of the "de-mix" experience (Moises-style stem separation).
 */
export function StemRow({
  stem = STEMS[0],
  playing = true,
  compact,
  selected,
  className,
}: StemRowProps) {
  const [muted, setMuted] = useState(false);
  const [solo, setSolo] = useState(false);
  const Icon = stem.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-line bg-surface px-3 transition-colors",
        compact ? "h-9" : "h-12",
        selected && "border-accent/50 bg-accent/8",
        className
      )}
    >
      <span
        className={cn("flex shrink-0 items-center justify-center rounded-lg", compact ? "size-7" : "size-9")}
        style={{ background: `${stem.color}1f`, color: stem.color }}
      >
        <Icon className={compact ? "size-3.5" : "size-4"} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-ink">{stem.label}</div>
        {!compact && <div className="text-[10.5px] text-ink-3">{stem.fa}</div>}
      </div>
      <span className="flex h-4 shrink-0 items-end gap-[2.5px]" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("eq-bar w-[2.5px] rounded-full", muted && "[animation-play-state:paused] opacity-25")}
            style={{
              height: [8, 14, 10, 16, 9][i],
              background: stem.color,
              animationDelay: `${i * 0.11}s`,
            }}
          />
        ))}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Tooltip label={muted ? "رفع بی‌صدا" : "بی‌صدا"}>
          <IconButton
            size={compact ? "sm" : "md"}
            intent={muted ? "danger" : "subtle"}
            aria-label="بی‌صدا"
            onClick={() => setMuted((m) => !m)}
          >
            <VolumeX />
          </IconButton>
        </Tooltip>
        <Tooltip label={solo ? "لغو سولو" : "سولو"}>
          <IconButton
            size={compact ? "sm" : "md"}
            intent={solo ? "active" : "subtle"}
            aria-label="سولو"
            onClick={() => setSolo((s) => !s)}
          >
            <Headphones />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
