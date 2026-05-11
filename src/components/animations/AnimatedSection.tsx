"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  /** When true, animate on mount (no scroll-in). */
  instant?: boolean;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 30,
  scale,
  instant = false,
}: AnimatedSectionProps) {
  const initialProps = {
    opacity: 0,
    y: y,
    ...(scale && { scale }),
  };

  const animateProps = {
    opacity: 1,
    y: 0,
    ...(scale && { scale: 1 }),
  };

  const transition = {
    duration: duration,
    ease: "easeOut" as const,
    delay: delay,
  };

  const viewport = { once: true, amount: 0.1 as const };

  if (instant) {
    return (
      <motion.div
        initial={initialProps}
        animate={animateProps}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initialProps}
      whileInView={animateProps}
      transition={transition}
      viewport={viewport}
      className={className}
    >
      {children}
    </motion.div>
  );
}
