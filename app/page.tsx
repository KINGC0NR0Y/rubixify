import Link from 'next/link';
import { BookOpen, Zap, Target, Star, Timer, BarChart3, Cpu } from 'lucide-react';
import { HorizonHero } from '@/components/ui/horizon-hero-section';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const features = [
  {
    icon: <BookOpen size={20} />,
    title: 'Complete Algorithm Database',
    desc: 'Every F2L, OLL, and PLL case with multiple algorithm options, move counts, and recognition tips.',
    accent: '#0045AD',
    bg: '#0045AD',
  },
  {
    icon: <Zap size={20} />,
    title: 'Instant Search',
    desc: 'Find any algorithm in milliseconds. Search by name, notation, case shape, or category.',
    accent: '#FFD500',
    bg: '#FFD500',
  },
  {
    icon: <Target size={20} />,
    title: 'Recognition Trainer',
    desc: 'Identify OLL and PLL cases from diagrams, track your accuracy, and drill your weakest cases with spaced repetition.',
    accent: '#B90000',
    bg: '#B90000',
  },
  {
    icon: <Star size={20} />,
    title: 'Add Favorites',
    desc: 'Save algorithms you are learning and build your personal reference collection.',
    accent: '#009B48',
    bg: '#009B48',
  },
];

const speedcubingTools = [
  {
    icon: <Timer size={22} />,
    title: 'Session Timer',
    desc: 'WCA-compliant scrambles, 15-second inspection countdown, spacebar/tap control, and a session list with +2 / DNF support.',
    bg: '#0045AD',
    textColor: '#FFFFFF',
  },
  {
    icon: <Cpu size={22} />,
    title: 'Virtual Cube',
    desc: 'Step through any scramble move-by-move with a live cube visualizer — practice without a physical cube.',
    bg: '#FFD500',
    textColor: '#0A0A0A',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Analytics',
    desc: 'Track Ao5, Ao12, Ao100, session mean, and best time. See your time distribution and pinpoint weakest OLL/PLL cases.',
    bg: '#009B48',
    textColor: '#FFFFFF',
  },
];

const cfopSteps = [
  {
    letter: 'C',
    word: 'Cross',
    bg: '#FFD500',
    textColor: '#0A0A0A',
    desc: 'Solve the four edge pieces on the bottom layer forming a cross. Typically 5–8 moves and done intuitively.',
  },
  {
    letter: 'F',
    word: 'First Two Layers',
    bg: '#0045AD',
    textColor: '#FFFFFF',
    desc: 'Insert corner-edge pairs into the middle and bottom layers simultaneously. 41 algorithmic cases.',
  },
  {
    letter: 'O',
    word: 'Orient Last Layer',
    bg: '#B90000',
    textColor: '#FFFFFF',
    desc: 'Orient all pieces on the top layer so the top face is one color. 57 unique cases, each with a dedicated algorithm.',
  },
  {
    letter: 'P',
    word: 'Permute Last Layer',
    bg: '#009B48',
    textColor: '#FFFFFF',
    desc: 'Move top-layer pieces into correct positions without disturbing orientation. 21 unique PLL cases.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <HorizonHero />

      {/* ── CFOP Method ──────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <div
                style={{
                  display: 'inline-block',
                  background: '#0045AD',
                  border: '3px solid #0A0A0A',
                  boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '3px 16px',
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.25em',
                  color: '#FFFFFF',
                  marginBottom: 16,
                }}
              >
                THE FASTEST METHOD
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                CUBE WITH{' '}
                <span style={{ color: '#B90000', textShadow: '2px 2px 0 #0A0A0A' }}>
                  EXCELLENCE
                </span>
              </h2>
              <p
                className="text-sm max-w-md mx-auto leading-relaxed mt-3"
                style={{ color: '#2a2a2a' }}
              >
                With CFOP, unlock your true potential by transforming solves into a structured,
                algorithm-driven process that maximizes speed, efficiency, and consistency.
              </p>
            </div>
          </ScrollReveal>

          {/* 4 CFOP step cards — staggered reveal */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {cfopSteps.map((step, i) => (
              <ScrollReveal key={step.letter} direction="panel" delay={i * 0.1}>
                <div
                  className="card-hover"
                  style={{
                    background: step.bg,
                    border: '3px solid #0A0A0A',
                    boxShadow: '4px 4px 0 #0A0A0A',
                    borderRadius: 4,
                    padding: '24px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                    color: step.textColor,
                    height: '100%',
                  }}
                >
                  {/* Huge letter watermark */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -8,
                      fontFamily: 'var(--font-bangers, Bangers, cursive)',
                      fontSize: '5.5rem',
                      lineHeight: 1,
                      opacity: 0.12,
                      color: step.textColor === '#FFFFFF' ? '#FFFFFF' : '#0A0A0A',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {step.letter}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-bangers, Bangers, cursive)',
                      fontSize: '3.5rem',
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    {step.letter}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 8 }}>
                    {step.word}
                  </div>
                  <p style={{ fontSize: '0.78rem', lineHeight: 1.65, opacity: 0.9 }}>
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Why CFOP info block */}
          <ScrollReveal direction="up" delay={0.1}>
            <div
              className="card-solid"
              style={{ borderRadius: 4, padding: '32px 28px' }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: '#FFD500',
                  border: '3px solid #0A0A0A',
                  boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '4px 14px',
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.15rem',
                  letterSpacing: '0.08em',
                  color: '#0A0A0A',
                  marginBottom: 20,
                }}
              >
                WHY LEARN CFOP?
              </div>
              <div className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed" style={{ color: '#2a2a2a' }}>
                <p>
                  CFOP was created by{' '}
                  <strong style={{ color: '#0A0A0A' }}>Jessica Fridrich</strong> while studying at
                  Binghamton University, published online in 1997. It reduces the average solve length
                  to{' '}
                  <strong style={{ color: '#B90000' }}>50–60 moves</strong> vs. 100+ for beginner
                  methods. Top competitors average ~45 moves and achieve sub-5-second solves.
                </p>
                <p>
                  CFOP&apos;s dominance comes from its{' '}
                  <strong style={{ color: '#0A0A0A' }}>efficiency and parallelism</strong> — Cross and
                  F2L can be planned during inspection, and fixed last-layer algorithms allow pure
                  muscle memory. Over{' '}
                  <strong style={{ color: '#0045AD' }}>90% of WCA top competitors</strong> use it.
                  World records (3.13s by Max Park) were set using this method.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Dashed divider ───────────────────────────── */}
      <hr className="section-divider" />

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2
                style={{
                  fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                EVERYTHING{' '}
                <span style={{ color: '#009B48', textShadow: '2px 2px 0 #0A0A0A' }}>
                  YOU NEED
                </span>
              </h2>
              <p className="text-sm mt-3" style={{ color: '#2a2a2a' }}>
                Built for speedcubers, from beginner to world-class.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.08}>
                <div
                  className="card-solid card-hover"
                  style={{ borderRadius: 4, overflow: 'hidden', padding: 0 }}
                >
                  {/* Colored top bar with icon */}
                  <div
                    style={{
                      background: f.bg,
                      borderBottom: '3px solid #0A0A0A',
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: f.accent === '#FFD500' ? '#0A0A0A' : '#FFFFFF',
                    }}
                  >
                    {f.icon}
                    <span
                      style={{
                        fontFamily: 'var(--font-bangers, Bangers, cursive)',
                        fontSize: '1rem',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {f.title}
                    </span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p className="text-xs leading-relaxed" style={{ color: '#2a2a2a' }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashed divider ───────────────────────────── */}
      <hr className="section-divider" />

      {/* ── Speedcubing Tools ────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <div
                style={{
                  display: 'inline-block',
                  background: '#0045AD',
                  border: '3px solid #0A0A0A',
                  boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '3px 16px',
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.25em',
                  color: '#FFFFFF',
                  marginBottom: 16,
                }}
              >
                BUILT FOR SPEED
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                SPEEDCUBING{' '}
                <span style={{ color: '#0045AD', textShadow: '2px 2px 0 #0A0A0A' }}>
                  TOOLS
                </span>
              </h2>
              <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: '#2a2a2a' }}>
                Everything you need to train smarter — from WCA-style scrambles to session analytics.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {speedcubingTools.map((tool, i) => (
              <ScrollReveal key={tool.title} direction="panel" delay={i * 0.1}>
                <Link href="/trainer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div
                    className="card-hover"
                    style={{
                      background: tool.bg,
                      border: '3px solid #0A0A0A',
                      boxShadow: '4px 4px 0 #0A0A0A',
                      borderRadius: 4,
                      padding: '24px 20px',
                      color: tool.textColor,
                      height: '100%',
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>{tool.icon}</div>
                    <div style={{
                      fontFamily: 'var(--font-bangers, Bangers, cursive)',
                      fontSize: '1.15rem', letterSpacing: '0.06em', marginBottom: 8,
                    }}>
                      {tool.title}
                    </div>
                    <p style={{ fontSize: '0.78rem', lineHeight: 1.65, opacity: 0.9 }}>
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center">
              <Link
                href="/trainer"
                className="btn-primary inline-flex items-center gap-2"
                style={{ padding: '14px 36px', fontSize: '1.1rem' }}
              >
                <Timer size={18} /> Open Speedcubing Hub
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Dashed divider ───────────────────────────── */}
      <hr className="section-divider" />

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Diagonal stripe background */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                rgba(255,213,0,0.06) 0px,
                rgba(255,213,0,0.06) 10px,
                transparent 10px,
                transparent 20px
              )
            `,
          }}
        />

        <ScrollReveal direction="scale" className="relative max-w-2xl mx-auto">
          <div
            aria-hidden
            style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
              letterSpacing: '0.3em',
              color: '#B90000',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            ★ ★ ★
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
              fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
              letterSpacing: '0.02em',
              color: '#0A0A0A',
              lineHeight: 0.95,
              marginBottom: 16,
            }}
          >
            START YOUR
            <br />
            <span style={{ color: '#B90000', textShadow: '3px 3px 0 #0A0A0A' }}>
              SPEEDCUBING
            </span>
            <br />
            JOURNEY
          </h2>

          <p
            className="mb-10 text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: '#2a2a2a' }}
          >
            Browse the complete algorithm database or jump straight into training mode to test your
            recognition skills.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/algorithms"
              className="btn-primary inline-flex items-center gap-2"
              style={{ padding: '14px 32px', fontSize: '1.1rem' }}
            >
              Browse Algorithms
            </Link>
            <Link
              href="/trainer"
              className="btn-secondary inline-flex items-center gap-2"
              style={{ padding: '14px 32px', fontSize: '1.1rem' }}
            >
              Open Trainer
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
