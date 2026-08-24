import { useState } from "react";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";
import { IconButton } from "../../atoms/icon-button";
import { Tooltip } from "../../atoms/tooltip";

const playCva = cva(
  "flex items-center justify-center rounded-full text-[#1a1305] transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent shadow-[0_10px_28px_-10px_rgba(242,169,59,0.75)]",
  {
    variants: {
      size: {
        sm: "size-9 [&>svg]:size-4",
        md: "size-12 [&>svg]:size-5",
        lg: "size-14 [&>svg]:size-6",
      },
      tone: {
        accent: "bg-accent hover:bg-accent-soft",
        teal: "bg-teal hover:bg-teal/90",
      },
    },
    defaultVariants: { size: "md", tone: "accent" },
  }
);

export interface TransportControlsProps extends VariantProps<typeof playCva> {
  variant?: "default" | "minimal" | "compact";
  playing?: boolean;
  onPlayingChange?: (p: boolean) => void;
  className?: string;
}

/**
 * @molecule — playback controls cluster.
 * variant: default (shuffle·prev·play·next·loop) · minimal (prev·play·next) · compact (dense)
 */
export function TransportControls({
  variant = "default",
  size = "md",
  tone = "accent",
  playing,
  onPlayingChange,
  className,
}: TransportControlsProps) {
  const [internal, setInternal] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const isPlaying = playing ?? internal;
  const toggle = () => {
    const next = !isPlaying;
    setInternal(next);
    onPlayingChange?.(next);
  };
  const dense = variant === "compact";

  return (
    <div className={cn("flex items-center gap-1.5", dense && "gap-1", className)}>
      {variant !== "minimal" && (
        <Tooltip label={shuffleOn ? "شافل: روشن" : "شافل"}>
          <IconButton
            size="sm"
            intent={shuffleOn ? "active" : "subtle"}
            aria-label="شافل"
            onClick={() => setShuffleOn((s) => !s)}
          >
            <Shuffle />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip label="قبلی">
        <IconButton size="sm" intent="subtle" aria-label="قبلی">
          <SkipBack className="fill-current" />
        </IconButton>
      </Tooltip>
      <button
        type="button"
        aria-label={isPlaying ? "توقف" : "پخش"}
        onClick={toggle}
        className={cn(playCva({ size, tone }), dense && "size-10 [&>svg]:size-4")}
      >
        {isPlaying ? <Pause className="fill-current" /> : <Play className="translate-x-[1px] fill-current" />}
      </button>
      <Tooltip label="بعدی">
        <IconButton size="sm" intent="subtle" aria-label="بعدی">
          <SkipForward className="fill-current" />
        </IconButton>
      </Tooltip>
      {variant !== "minimal" && (
        <Tooltip label={loopOn ? "لوپ: روشن" : "لوپ"}>
          <IconButton
            size="sm"
            intent={loopOn ? "active" : "subtle"}
            aria-label="لوپ"
            onClick={() => setLoopOn((s) => !s)}
          >
            <Repeat />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}
