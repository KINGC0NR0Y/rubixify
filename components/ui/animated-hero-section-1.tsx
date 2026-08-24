'use client';

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedHeroProps {
  title?: string;
  description?: string;
  ctaButton?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

function SpeedLines() {
  const lines = Array.from({ length: 28 }, (_, i) => {
    const a  = (i / 28) * Math.PI * 2;
    const x1 = 200 + Math.cos(a) * 18;
    const y1 = 200 + Math.sin(a) * 18;
    const x2 = 200 + Math.cos(a) * 420;
    const y2 = 200 + Math.sin(a) * 420;
    return { x1, y1, x2, y2 };
  });
  return (
    <svg
      viewBox="0 0 400 400"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1}
          x2={l.x2} y2={l.y2}
          stroke="white"
          strokeWidth={i % 4 === 0 ? 3 : 1.5}
        />
      ))}
    </svg>
  );
}

const CUBE_COLORS = [
  { c: '#B90000', label: 'Red' },
  { c: '#0045AD', label: 'Blue' },
  { c: '#FFD500', label: 'Yellow' },
  { c: '#009B48', label: 'Green' },
  { c: '#FF5900', label: 'Orange' },
  { c: '#EEEEEE', label: 'White' },
];

export const AnimatedHero = ({
  title = 'MASTER THE CUBE',
  description = 'Algorithms, Tutorials, Speedcubing, and Community',
  ctaButton = { text: 'Learn Algorithms', href: '/algorithms' },
  secondaryCta = { text: 'Start Solving', href: '/trainer' },
  className,
}: AnimatedHeroProps) => {
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

  return (
    <section
      ref={sectionRef}
      className={cn(className)}
      style={{
        minHeight: '100vh',
        position: 'relative',
        borderBottom: '4px solid #0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
        overflow: 'hidden',
      }}
    >
      {/* Speed lines behind everything */}
      <SpeedLines />

      {/* ── Yellow top banner ─────────────────────────── */}
      <motion.div
        initial={{ y: -42, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          background: '#FFD500',
          borderBottom: '3px solid #0A0A0A',
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
            fontSize: 'clamp(0.75rem, 2vw, 1rem)',
            letterSpacing: '0.28em',
            color: '#0A0A0A',
          }}
        >
          ★ THE ULTIMATE GUIDE TO SPEEDCUBING  ★
        </span>
      </motion.div>

      {/* ── Centred content ───────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            y: contentY,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'clamp(40px, 6vw, 80px) clamp(24px, 6vw, 80px)',
            maxWidth: 900,
            width: '100%',
          }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
            <span
              style={{
                display: 'inline-block',
                background: '#FFD500',
                border: '3px solid #0A0A0A',
                boxShadow: '3px 3px 0 #0A0A0A',
                padding: '3px 18px',
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: 'clamp(0.7rem, 1.2vw, 0.88rem)',
                letterSpacing: '0.2em',
                color: '#0A0A0A',
              }}
            >
              MASTER THE ART OF SPEED
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
              fontSize: 'clamp(4.5rem, 14vw, 11rem)',
              lineHeight: 0.88,
              letterSpacing: '0.02em',
              color: '#FFFFFF',
              textShadow: '6px 6px 0 #B90000',
              margin: 0,
            }}
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            style={{
              marginTop: 28,
              marginBottom: 40,
              fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 500,
              maxWidth: 480,
              lineHeight: 1.65,
            }}
          >
            {description}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              href={ctaButton.href}
              className="btn-primary inline-flex items-center gap-2"
              style={{ padding: '13px 30px', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)' }}
            >
              {ctaButton.text}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="btn-secondary inline-flex items-center gap-2"
                style={{ padding: '13px 30px', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)' }}
              >
                {secondaryCta.text}
              </Link>
            )}
          </motion.div>

          {/* Rubik's face colour dots */}
          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: 10, marginTop: 52, justifyContent: 'center' }}
          >
            {CUBE_COLORS.map(({ c, label }) => (
              <div
                key={label}
                title={label}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: c,
                  border: '2px solid #0A0A0A',
                  boxShadow: '2px 2px 0 #0A0A0A',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
