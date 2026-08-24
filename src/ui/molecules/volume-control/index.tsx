import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";
import { Slider } from "../../atoms/slider";
import { IconButton } from "../../atoms/icon-button";
import { Tooltip } from "../../atoms/tooltip";

const volumeCva = cva("flex items-center", {
  variants: {
    variant: { default: "gap-2.5", compact: "gap-1.5" },
    tone: { accent: "", teal: "" },
  },
  defaultVariants: { variant: "default", tone: "accent" },
});

export interface VolumeControlProps extends VariantProps<typeof volumeCva> {
  defaultValue?: number;
  className?: string;
}

/**
 * @molecule — volume cluster: mute button · slider · percent badge.
 */
export function VolumeControl({ variant = "default", tone = "accent", defaultValue = 70, className }: VolumeControlProps) {
  const [vol, setVol] = useState(defaultValue);
  const [muted, setMuted] = useState(false);
  const [last, setLast] = useState(defaultValue);
  const display = muted ? 0 : vol;

  return (
    <div className={cn(volumeCva({ variant, tone }), className)}>
      <Tooltip label={display === 0 ? "صدا را برگردان" : "بی‌صدا"}>
        <IconButton
          size="sm"
          intent={display === 0 ? "danger" : "subtle"}
          aria-label="بی‌صدا"
          onClick={() => {
            if (display === 0) {
              setMuted(false);
              setVol(last || 70);
            } else {
              setLast(vol);
              setMuted(true);
            }
          }}
        >
          {display === 0 ? <VolumeX /> : <Volume2 />}
        </IconButton>
      </Tooltip>
      <Slider
        size="sm"
        tone={tone}
        className="w-24 min-w-16"
        value={display}
        min={0}
        max={100}
        onValueChange={(v) => {
          setVol(v[0] ?? 0);
          setMuted((v[0] ?? 0) === 0);
        }}
      />
      {variant === "default" && (
        <span className="w-9 text-start font-mono text-[11px] text-ink-3">{display}%</span>
      )}
    </div>
  );
}
