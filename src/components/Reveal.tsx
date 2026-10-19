import { motion } from "framer-motion";
import { ReactElement, ReactNode } from "react";

/**
 * Scroll-triggered reveal wrapper — fades/slides children in the first time
 * they enter the viewport. Respects prefers-reduced-motion via framer-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}): ReactElement {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
