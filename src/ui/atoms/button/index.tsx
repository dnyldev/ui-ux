import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      intent: {
        solid:
          "bg-accent text-[#1a1305] shadow-[0_8px_24px_-10px_rgba(242,169,59,0.7)] hover:bg-accent-soft hover:shadow-[0_10px_30px_-10px_rgba(242,169,59,0.8)]",
        soft: "bg-accent/12 text-accent hover:bg-accent/22",
        outline: "border border-line-strong text-ink hover:bg-white/5 hover:border-white/30",
        ghost: "text-ink-2 hover:bg-white/6 hover:text-ink",
        danger: "bg-red/12 text-red hover:bg-red/22",
        teal: "bg-teal/12 text-teal hover:bg-teal/22",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-10 p-0",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { intent: "solid", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

/**
 * @atom — the base action button.
 * intents: solid · soft · outline · ghost · danger · teal
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, intent, size, block, ...props },
  ref
) {
  return (
    <button ref={ref} className={cn(buttonStyles({ intent, size, block }), className)} {...props} />
  );
});
