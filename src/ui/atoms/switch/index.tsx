import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../core/cn";

const tones = {
  accent: "data-[state=checked]:bg-accent",
  teal: "data-[state=checked]:bg-teal",
  violet: "data-[state=checked]:bg-violet",
} as const;

const rootCva = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      size: { sm: "h-5 w-9", md: "h-6 w-11" },
      tone: { accent: "", teal: "", violet: "" },
    },
    defaultVariants: { size: "md", tone: "accent" },
  }
);

const thumbCva = cva(
  "pointer-events-none block rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-transform data-[state=unchecked]:translate-x-[2px]",
  {
    variants: {
      size: {
        sm: "size-4 data-[state=checked]:translate-x-[18px]",
        md: "size-[19px] data-[state=checked]:translate-x-[21px]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof rootCva> {
  /** optional icon inside the thumb (shown when on) */
  icon?: React.ReactNode;
}

/**
 * @atom — accessible toggle switch (Radix).
 * tones: accent · teal · violet · sizes: sm · md
 */
export function Switch({ className, size, tone, icon, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root className={cn(rootCva({ size, tone }), className)} {...props}>
      <SwitchPrimitive.Thumb className={cn(thumbCva({ size }), "relative")}>
        {icon && (
          <span className="absolute inset-0 flex items-center justify-center text-[#1a1305] [&>svg]:size-[11px] [&>svg]:stroke-[3]">
            {icon}
          </span>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
