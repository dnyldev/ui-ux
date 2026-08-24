import { forwardRef, type ButtonHTMLAttributes } from "react";
import { ArrowLeft } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const backStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      intent: {
        circular:
          "size-11 bg-accent text-[#1a1305] shadow-[0_8px_22px_-8px_rgba(242,169,59,0.65)] hover:bg-accent-soft",
        outline:
          "size-11 border border-line-strong text-ink hover:border-accent/60 hover:text-accent",
        soft: "size-11 bg-white/6 text-ink hover:bg-white/10",
        pill: "h-11 px-5 bg-white/6 text-ink hover:bg-white/10",
        labeled: "h-11 -ms-2 px-3 bg-transparent text-ink-2 hover:text-ink",
        ghost: "size-11 bg-transparent text-ink-3 hover:bg-white/6 hover:text-ink",
      },
      size: {
        sm: "size-9 [&>svg]:size-4",
        md: "size-11 [&>svg]:size-5",
        lg: "size-[52px] [&>svg]:size-6",
      },
    },
    defaultVariants: { intent: "soft", size: "md" },
  }
);

export interface BackButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof backStyles> {
  /** text shown in pill / labeled intents */
  label?: string;
}

/**
 * @atom — back / return button.
 * 6 intents: circular · outline · soft · pill · labeled · ghost
 */
export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(function BackButton(
  { className, intent, size, label = "بازگشت", children, ...props },
  ref
) {
  return (
    <button ref={ref} className={cn(backStyles({ intent, size }), className)} {...props}>
      <ArrowLeft aria-hidden />
      {(intent === "pill" || intent === "labeled") && (children ?? label)}
    </button>
  );
});
