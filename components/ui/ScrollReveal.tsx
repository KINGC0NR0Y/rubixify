'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import type { Variants } from 'framer-motion';

type Direction = 'up' | 'left' | 'right' | 'scale' | 'panel';

interface Props {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

const variants: Record<Direction, Variants> = {
  up:    { hidden: { opacity: 0, y: 44 },             visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -44 },            visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 44 },             visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.88 },       visible: { opacity: 1, scale: 1 } },
  panel: { hidden: { opacity: 0, y: 32, rotateX: 6 }, visible: { opacity: 1, y: 0, rotateX: 0 } },
};

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-72px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{ ...style, transformOrigin: 'top center' }}
    >
      {children}
    </motion.div>
  );
}
