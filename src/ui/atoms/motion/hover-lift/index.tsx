import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { cn } from "../../../../core/cn";

export interface HoverLiftProps extends HTMLMotionProps<"div"> {
  /** hover lift distance in px */
  lift?: number;
}

/**
 * @atom(motion) — hover lift wrapper (cards, rows, list items).
 */
export function HoverLift({ lift = 4, className, children, ...props }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -lift }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
