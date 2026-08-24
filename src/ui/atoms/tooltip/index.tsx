import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const contentCva = cva(
  "z-50 max-w-60 rounded-lg border border-line-strong bg-overlay px-3 py-2 text-[12.5px] leading-relaxed text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] select-none",
  {
    variants: {
      tone: {
        dark: "",
        accent: "border-accent/50 text-accent",
        danger: "border-red/50 text-red",
      },
    },
    defaultVariants: { tone: "dark" },
  }
);

export interface TooltipProps extends VariantProps<typeof contentCva> {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  className?: string;
}

/**
 * @atom — accessible tooltip (Radix).
 * Lean labels for icon-only controls: mute, solo, tap, loop…
 */
export function Tooltip({
  label,
  children,
  side = "top",
  delayDuration = 180,
  tone,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className={cn(contentCva({ tone }), className)}
          >
            {label}
            <TooltipPrimitive.Arrow className="fill-overlay" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
