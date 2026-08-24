import { useState } from "react";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const chipCva = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]",
  {
    variants: {
      intent: {
        neutral: "border-line-strong bg-white/5 text-ink-2 hover:text-ink",
        accent: "border-accent/40 bg-accent/10 text-accent",
        teal: "border-teal/40 bg-teal/10 text-teal",
        violet: "border-violet/40 bg-violet/10 text-violet",
        success: "border-green/40 bg-green/10 text-green",
        danger: "border-red/40 bg-red/10 text-red",
      },
      size: { sm: "h-7 px-3 text-[12px]", md: "h-8 px-3.5 text-[13px]" },
    },
    defaultVariants: { intent: "neutral", size: "md" },
  }
);

const dotColor: Record<string, string> = {
  neutral: "bg-ink-3",
  accent: "bg-accent",
  teal: "bg-teal",
  violet: "bg-violet",
  success: "bg-green",
  danger: "bg-red",
};

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipCva> {
  /** colored status dot on the left */
  dot?: boolean;
  /** makes the chip a self-contained selectable pill */
  selectable?: boolean;
}

/**
 * @atom — small status / filter pill.
 * intents: neutral · accent · teal · violet · success · danger
 * extras: dot · selectable
 */
export function Chip({ className, intent, size, dot, selectable, children, onClick, ...props }: ChipProps) {
  const [selected, setSelected] = useState(false);
  const active = selectable ? selected : false;

  return (
    <button
      type="button"
      className={cn(
        chipCva({ intent, size }),
        active && "border-accent bg-accent/15 text-accent",
        dot && "ps-2.5",
        className
      )}
      onClick={(e) => {
        if (selectable) setSelected((s) => !s);
        onClick?.(e);
      }}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", active ? "bg-accent" : dotColor[intent ?? "neutral"])} />}
      {children}
      {active && <Check className="size-3.5" />}
    </button>
  );
}
