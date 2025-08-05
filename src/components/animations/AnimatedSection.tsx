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
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 30,
  scale,
}: AnimatedSectionProps) {
  const initialProps: any = {
    opacity: 0,
    y: y,
  };

  const animateProps: any = {
    opacity: 1,
    y: 0,
  };

  if (scale) {
    initialProps.scale = scale;
    animateProps.scale = 1;
  }

  return (
    <motion.div
      initial={initialProps}
      whileInView={animateProps}
      transition={{
        duration: duration,
        ease: "easeOut",
        delay: delay,
      }}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}