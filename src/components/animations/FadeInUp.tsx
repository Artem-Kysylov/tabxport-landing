"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export default function FadeInUp({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 20,
}: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: duration,
        ease: "easeOut",
        delay: delay,
      }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}