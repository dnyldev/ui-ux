import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const iconStyles = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      intent: {
        default: "bg-white/6 text-ink-2 hover:bg-white/10 hover:text-ink",
        subtle: "bg-transparent text-ink-3 hover:bg-white/6 hover:text-ink",
        active: "bg-accent/15 text-accent hover:bg-accent/25",
        danger: "bg-red/10 text-red hover:bg-red/20",
      },
      size: {
        sm: "size-8 [&>svg]:size-4",
        md: "size-10 [&>svg]:size-5",
        lg: "size-12 [&>svg]:size-6",
      },
    },
    defaultVariants: { intent: "default", size: "md" },
  }
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconStyles> {}

/**
 * @atom — square icon-only button (toolbar, transport, rows…).
 * intents: default · subtle · active · danger
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, intent, size, ...props },
  ref
) {
  return <button ref={ref} className={cn(iconStyles({ intent, size }), className)} {...props} />;
});
