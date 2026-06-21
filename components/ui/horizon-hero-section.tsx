'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RubiksCube3D } from './RubiksCube3D';

// Speed lines SVG radiating from center (pre-computed)
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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
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

// Stagger variants for the left-panel text elements
const textEnter = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0 },
};

export function ComicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: maps scroll progress 0→0.5 to Y offsets
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const textY  = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const cubeY  = useTransform(scrollYProgress, [0, 1], ['0%', '-9%']);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        position: 'relative',
        borderBottom: '4px solid #0A0A0A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top yellow banner ────────────────────────── */}
      <div
        style={{
          background: '#FFD500',
          borderBottom: '3px solid #0A0A0A',
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
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
          ★ THE ULTIMATE SPEEDCUBING RESOURCE ★
        </span>
      </div>

      {/* ── Two-panel grid ───────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          flex: 1,
          minHeight: 'calc(100vh - 42px)',
        }}
        className="hero-grid"
      >
        {/* LEFT: Text ─────────────────────────────── */}
        <div
          className="hero-text-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#0A0A0A',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1.2px, transparent 1.2px)',
            backgroundSize: '20px 20px',
            borderRight: '4px solid #0A0A0A',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Parallax content wrapper */}
          <motion.div
            style={{
              y: textY,
              padding: 'clamp(40px, 6vw, 90px) clamp(28px, 5vw, 72px)',
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            >
              {/* Yellow tag */}
              <motion.div variants={textEnter} style={{ marginBottom: 18 }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#FFD500',
                    border: '3px solid #0A0A0A',
                    boxShadow: '3px 3px 0 #0A0A0A',
                    padding: '3px 14px',
                    fontFamily: 'var(--font-bangers, Bangers, cursive)',
                    fontSize: 'clamp(0.7rem, 1.2vw, 0.88rem)',
                    letterSpacing: '0.2em',
                    color: '#0A0A0A',
                  }}
                >
                  MASTER THE ART OF SPEED
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                variants={textEnter}
                style={{
                  fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
                  fontSize: 'clamp(3.8rem, 11vw, 9rem)',
                  lineHeight: 0.9,
                  letterSpacing: '0.02em',
                  color: '#FFFFFF',
                  textShadow: '5px 5px 0 #B90000',
                  margin: 0,
                }}
              >
                MASTER
                <br />
                THE CUBE
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={textEnter}
                style={{
                  marginTop: 22,
                  marginBottom: 34,
                  fontSize: 'clamp(0.92rem, 1.4vw, 1.1rem)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                  maxWidth: 380,
                  lineHeight: 1.65,
                }}
              >
                Algorithms, Tutorials, Speedcubing, and Community
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={textEnter} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link
                  href="/algorithms"
                  className="btn-primary inline-flex items-center gap-2"
                  style={{ padding: '11px 26px', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)' }}
                >
                  Learn Algorithms
                </Link>
                <Link
                  href="/trainer"
                  className="btn-secondary inline-flex items-center gap-2"
                  style={{ padding: '11px 26px', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)' }}
                >
                  Start Solving
                </Link>
              </motion.div>

              {/* Rubik's color dots */}
              <motion.div variants={textEnter} style={{ display: 'flex', gap: 8, marginTop: 44 }}>
                {[
                  ['#B90000', 'Red'],
                  ['#0045AD', 'Blue'],
                  ['#FFD500', 'Yellow'],
                  ['#009B48', 'Green'],
                  ['#FF5900', 'Orange'],
                  ['#EEEEEE', 'White'],
                ].map(([c, label]) => (
                  <div
                    key={label}
                    title={label}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: c,
                      border: '2px solid #0A0A0A',
                      boxShadow: '2px 2px 0 #0A0A0A',
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT: 3D Cube ──────────────────────────── */}
        <div
          style={{
            background: '#0045AD',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '60px 24px 24px',
          }}
        >
          {/* Speed lines */}
          <SpeedLines />

          {/* Halftone dots */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {/* 3D Cube canvas — with parallax drift */}
          <motion.div
            style={{
              width: '100%',
              maxWidth: 'min(480px, 85%)',
              aspectRatio: '1 / 1',
              position: 'relative',
              zIndex: 1,
              y: cubeY,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <RubiksCube3D />
          </motion.div>
        </div>
      </div>

      {/* Mobile stacking styles */}
      <style>{`
        @media (max-width: 767px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-text-panel {
            border-right: none !important;
            border-top: 4px solid #0A0A0A;
            order: 2;
          }
          .hero-grid > :first-child {
            order: 2;
          }
          .hero-grid > :last-child {
            order: 1;
            min-height: 55vw;
          }
        }
      `}</style>
    </section>
  );
}

// Keep old export name for any potential imports
export { ComicHero as HorizonHero };
