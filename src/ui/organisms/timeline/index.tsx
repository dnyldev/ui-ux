import { cn } from "../../../core/cn";
import { Waveform } from "../../molecules/waveform";
import { Chip } from "../../atoms/chip";
import { TempoControl } from "../../molecules/tempo-control";

export interface TimelineProps {
  variant?: "default" | "grid" | "markers";
  bars?: number;
  className?: string;
}

const RULER = ["0:00", "0:30", "1:00", "1:30", "2:00"];

/**
 * @organism — editor timeline: ruler · waveform · loop region · beat markers.
 * The Chordify-style arrange view: harmony + sync in one strip.
 */
export function Timeline({ variant = "default", bars = 110, className }: TimelineProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4", className)}>
      {/* header row */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Chip intent="accent" size="sm">128 BPM</Chip>
          <Chip intent="teal" size="sm">Am</Chip>
          <Chip size="sm">4/4</Chip>
        </div>
        <TempoControl variant="compact" />
      </div>

      {/* ruler */}
      <div className="mb-1 flex justify-between px-0.5 font-mono text-[10px] text-ink-3">
        {RULER.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      {/* waveform area */}
      <div className="relative">
        <Waveform bars={bars} height={52} selection={[0.18, 0.44]} progress={0.12} interactive />
        {variant !== "markers" && <GridLines />}
        {variant !== "grid" && <BeatTicks />}
        {/* loop grips */}
        <span className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-teal bg-surface" style={{ left: "18%" }} />
        <span className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-teal bg-surface" style={{ left: "44%" }} />
      </div>

      {/* footer meta */}
      <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-ink-3">
        <span>لوپ: ۰:۱۳ – ۰:۳۴ · طول ترک ۲:۱۴</span>
        <span className="font-mono">C·A·G·E — کوردها همگام</span>
      </div>
    </div>
  );
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 flex justify-between" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-full w-px bg-white/4" />
      ))}
    </div>
  );
}

function BeatTicks() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-2 items-end" aria-hidden>
      {Array.from({ length: 55 }).map((_, i) => (
        <span key={i} className={cn("flex-1", i % 8 === 0 ? "h-full bg-accent/70" : "h-1/2 bg-white/20")} />
      ))}
    </div>
  );
}
