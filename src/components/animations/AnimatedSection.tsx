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