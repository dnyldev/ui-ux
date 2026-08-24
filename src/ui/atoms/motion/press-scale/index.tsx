import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { cn } from "../../../../core/cn";

export interface PressScaleProps extends HTMLMotionProps<"button"> {
  /** tap scale factor */
  scale?: number;
}

/**
 * @atom(motion) — button wrapper with spring press feedback.
 * Wrap any action control to get a physical "click" feel.
 */
export function PressScale({ scale = 0.94, className, children, ...props }: PressScaleProps) {
  return (
    <motion.button
      whileTap={{ scale }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn("cursor-pointer select-none", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
