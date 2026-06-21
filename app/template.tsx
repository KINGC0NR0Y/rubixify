'use client';

import { motion } from 'framer-motion';

// Runs on every route change in the App Router — drives page-enter transitions
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28, skewX: -0.8 }}
      animate={{ opacity: 1, x: 0, skewX: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
