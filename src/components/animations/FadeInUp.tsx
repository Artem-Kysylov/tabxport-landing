"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  /** When true, animate on mount (no scroll-in). Use for deep-linked / auto-paste hero. */
  instant?: boolean;
}

export default function FadeInUp({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 20,
  instant = false,
}: FadeInUpProps) {
  const transition = {
    duration: duration,
    ease: "easeOut" as const,
    delay: delay,
  };

  const viewport = { once: true, amount: 0.1 as const };

  if (instant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: y }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={transition}
      viewport={viewport}
      className={className}
    >
      {children}
    </motion.div>
  );
}
