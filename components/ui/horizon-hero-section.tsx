'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Stagger variants for text elements
const textEnter = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0 },
};

export function ComicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

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
      {/* ── Centered text panel ──────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(45deg, #000000 25%, transparent 25%), linear-gradient(-135deg, #000000 25%, transparent 25%, transparent 75%, #000000 75%, #000000)`,
          backgroundSize: '50px 50px',
          perspective: '1000px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >
        <motion.div
          style={{
            y: textY,
            padding: 'clamp(40px, 6vw, 90px) clamp(28px, 5vw, 72px)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
                lineHeight: 1.65,
              }}
            >
              Algorithms, Tutorials, Speedcubing, and Community
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={textEnter} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
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
    </section>
  );
}

// Keep old export name for any potential imports
export { ComicHero as HorizonHero };
