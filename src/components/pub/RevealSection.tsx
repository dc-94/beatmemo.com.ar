
"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function RevealSection({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  // Con movimiento reducido: sin slide ni fade, aparece directo.
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}