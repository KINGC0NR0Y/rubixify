import Link from 'next/link';
import {
  BookOpen,
  Timer,
  BarChart3,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { AnimatedHero } from '@/components/ui/animated-hero-section-1';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { StatsSection } from '@/components/ui/StatsSection';

// ── Data ───────────────────────────────────────────────────────────────────────

const cfopSteps = [
  {
    letter: 'C',
    word: 'Cross',
    bg: '#FFD500',
    textColor: '#0A0A0A',
    cases: '1 Pattern',
    desc: 'Solve the four edge pieces on the bottom layer forming a cross. Typically 5–8 moves and done intuitively.',
  },
  {
    letter: 'F',
    word: 'First Two Layers',
    bg: '#0045AD',
    textColor: '#FFFFFF',
    cases: '41 Cases',
    desc: 'Insert corner-edge pairs into the middle and bottom layers simultaneously. 41 algorithmic cases.',
  },
  {
    letter: 'O',
    word: 'Orient Last Layer',
    bg: '#B90000',
    textColor: '#FFFFFF',
    cases: '57 Cases',
    desc: 'Orient all pieces on the top layer so the top face is one colour. 57 unique cases, each with a dedicated algorithm.',
  },
  {
    letter: 'P',
    word: 'Permute Last Layer',
    bg: '#009B48',
    textColor: '#FFFFFF',
    cases: '21 Cases',
    desc: 'Move top-layer pieces into their correct positions without disturbing orientation. 21 unique PLL cases.',
  },
];

const algCategories = [
  {
    id: 'oll',
    name: 'OLL',
    full: 'Orient Last Layer',
    cases: 57,
    color: '#B90000',
    bg: 'rgba(185,0,0,0.07)',
    desc: 'All 57 OLL cases with recognition tips, multiple algorithm options, and finger-trick guides.',
  },
  {
    id: 'pll',
    name: 'PLL',
    full: 'Permute Last Layer',
    cases: 21,
    color: '#009B48',
    bg: 'rgba(0,155,72,0.07)',
    desc: 'Every PLL algorithm with finger tricks, AUF cases, and recognition patterns from every angle.',
  },
  {
    id: 'f2l',
    name: 'F2L',
    full: 'First Two Layers',
    cases: 41,
    color: '#0045AD',
    bg: 'rgba(0,69,173,0.07)',
    desc: 'All F2L pair cases covering standard, edge / corner separated, and advanced intuitive approaches.',
  },
];

const tools = [
  {
    icon: <Timer size={22} />,
    title: 'Session Timer',
    desc: 'WCA-compliant scrambles, 15-second inspection countdown, spacebar / tap control, and a session list with +2 / DNF support.',
    bg: '#0045AD',
    textColor: '#FFFFFF',
  },
  {
    icon: <Cpu size={22} />,
    title: 'Virtual Cube',
    desc: 'Step through any scramble move-by-move with a live cube visualiser — practice without a physical cube.',
    bg: '#FFD500',
    textColor: '#0A0A0A',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Analytics',
    desc: 'Track Ao5, Ao12, Ao100, session mean, and best time. See your time distribution and pinpoint weakest OLL / PLL cases.',
    bg: '#009B48',
    textColor: '#FFFFFF',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function Badge({ text, color = '#FFD500' }: { text: string; color?: string }) {
  const isLight = color === '#FFD500';
  return (
    <span
      style={{
        display: 'inline-block',
        background: color,
        border: '3px solid #0A0A0A',
        boxShadow: '3px 3px 0 #0A0A0A',
        padding: '3px 16px',
        fontFamily: 'var(--font-bangers)',
        fontSize: 'clamp(0.62rem, 0.9vw, 0.78rem)',
        letterSpacing: '0.3em',
        color: isLight ? '#0A0A0A' : '#FFFFFF',
        marginBottom: 16,
      }}
    >
      {text}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <AnimatedHero />

      {/* ══ 2. STATS BAND ════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ══ 3. CFOP METHOD ═══════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '4px solid #0A0A0A',
          padding: '80px 0',
        }}
      >
        <div className="max-w-5xl mx-auto px-4">

          {/* Heading */}
          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Badge text="★ THE FASTEST METHOD ★" />
              <h2
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                CUBE WITH{' '}
                <span style={{ color: '#B90000', textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
                  EXCELLENCE
                </span>
              </h2>
              <p
                style={{
                  color: '#555555',
                  fontSize: '0.88rem',
                  marginTop: 12,
                  maxWidth: 420,
                  margin: '12px auto 0',
                  lineHeight: 1.65,
                }}
              >
                With CFOP, unlock your true potential by transforming solves into a structured,
                algorithm-driven process that maximises speed, efficiency, and consistency.
              </p>
            </div>
          </ScrollReveal>

          {/* 4 CFOP step cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
                    minHeight: 210,
                  }}
                >
                  {/* Ghost watermark */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -8,
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '5.5rem',
                      lineHeight: 1,
                      opacity: 0.1,
                      color: step.textColor === '#FFFFFF' ? '#FFFFFF' : '#0A0A0A',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {step.letter}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '3.5rem',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {step.letter}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: 6, opacity: 0.92 }}>
                    {step.word}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'rgba(0,0,0,0.18)',
                      borderRadius: 2,
                      padding: '2px 8px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      marginBottom: 10,
                    }}
                  >
                    {step.cases}
                  </div>
                  <p style={{ fontSize: '0.76rem', lineHeight: 1.65, opacity: 0.88 }}>
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
              style={{
                borderRadius: 4,
                padding: '32px 28px',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: '#FFD500',
                  border: '3px solid #0A0A0A',
                  boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '4px 14px',
                  fontFamily: 'var(--font-bangers)',
                  fontSize: '1.15rem',
                  letterSpacing: '0.08em',
                  color: '#0A0A0A',
                  marginBottom: 20,
                }}
              >
                WHY LEARN CFOP?
              </div>
              <div
                className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed"
                style={{ color: '#2a2a2a' }}
              >
                <p>
                  CFOP was developed from early speedcubing techniques in the 1980s, with <strong style={{ color: '#0A0A0A' }}>Jessica Fridrich</strong> later 
                  refining and popularizing the method by publishing it online in 1997. It combines Cross, F2L, OLL, and PLL, giving advanced solvers an efficient, 
                  highly repeatable system that averages around 55 moves at the top level.
                </p>
                <p>
                 CFOP’s dominance comes from its <strong style={{ color: '#0A0A0A' }}>speed, efficiency, and predictability</strong>. Solvers can plan the Cross during inspection, 
                 build F2L pairs intuitively, and use memorized OLL and PLL algorithms to finish the last layer quickly. 
                 Its structured approach minimizes unnecessary moves while allowing fast, consistent execution, making CFOP the most widely used method among elite 3×3 speedcubers.

                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ 4. ALGORITHM CATEGORIES ══════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '4px solid #0A0A0A',
          padding: '80px 0',
        }}
      >
        <div className="max-w-5xl mx-auto px-4">

          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Badge text="★ THE DATABASE ★" color="#B90000" />
              <h2
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                EXPLORE{' '}
                <span style={{ color: '#FFD500', textShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>
                  ALGORITHMS
                </span>
              </h2>
              <p
                style={{
                  color: '#555555',
                  fontSize: '0.88rem',
                  marginTop: 12,
                }}
              >
                Every case documented. Multiple algorithm options. Full recognition guides.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {algCategories.map((cat, i) => (
              <ScrollReveal key={cat.id} direction="panel" delay={i * 0.12}>
                <Link
                  href={`/algorithms?category=${cat.id}`}
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <div
                    className="card-hover"
                    style={{
                      background: cat.bg,
                      border: `3px solid ${cat.color}`,
                      boxShadow: `4px 4px 0 ${cat.color}`,
                      borderRadius: 4,
                      padding: '28px 24px',
                      height: '100%',
                      minHeight: 220,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {/* Ghost name */}
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        right: -14,
                        bottom: -24,
                        fontFamily: 'var(--font-bangers)',
                        fontSize: '7rem',
                        lineHeight: 1,
                        color: cat.color,
                        opacity: 0.08,
                        userSelect: 'none',
                        pointerEvents: 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {cat.name}
                    </div>

                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-bangers)',
                          fontSize: '2.4rem',
                          color: cat.color,
                          display: 'block',
                          lineHeight: 1,
                          marginBottom: 4,
                        }}
                      >
                        {cat.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#555555',
                          letterSpacing: '0.16em',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {cat.full}
                      </span>
                    </div>

                    <div
                      style={{
                        background: cat.color,
                        color: cat.color === '#FFD500' ? '#0A0A0A' : '#FFFFFF',
                        display: 'inline-block',
                        padding: '3px 12px',
                        fontFamily: 'var(--font-bangers)',
                        fontSize: '1.05rem',
                        letterSpacing: '0.05em',
                        borderRadius: 2,
                        alignSelf: 'flex-start',
                      }}
                    >
                      {cat.cases} Cases
                    </div>

                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#555555',
                        lineHeight: 1.65,
                        marginTop: 'auto',
                      }}
                    >
                      {cat.desc}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: cat.color,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                      }}
                    >
                      <ArrowRight size={13} />
                      View All {cat.name}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up" delay={0.28}>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link
                href="/algorithms"
                className="btn-secondary inline-flex items-center gap-2"
                style={{ padding: '13px 32px', fontSize: '1.05rem' }}
              >
                <BookOpen size={16} /> Browse Full Database
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

     
      {/* ══ 6. SPEEDCUBING TOOLS ═════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '4px solid #0A0A0A',
          padding: '80px 0',
        }}
      >
        <div className="max-w-5xl mx-auto px-4">

          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Badge text="★ BUILT FOR SPEED ★" color="#0045AD" />
              <h2
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  letterSpacing: '0.03em',
                  color: '#0A0A0A',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                SPEEDCUBING{' '}
                <span style={{ color: '#0045AD', textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
                  TOOLS
                </span>
              </h2>
              <p
                style={{
                  color: '#555555',
                  fontSize: '0.88rem',
                  marginTop: 12,
                  maxWidth: 420,
                  margin: '12px auto 0',
                  lineHeight: 1.65,
                }}
              >
                Everything you need to train smarter — from WCA-style scrambles to session analytics.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {tools.map((tool, i) => (
              <ScrollReveal key={tool.title} direction="panel" delay={i * 0.1}>
                <Link
                  href="/trainer"
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
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
                    <div
                      style={{
                        fontFamily: 'var(--font-bangers)',
                        fontSize: '1.15rem',
                        letterSpacing: '0.06em',
                        marginBottom: 8,
                      }}
                    >
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
            <div style={{ textAlign: 'center' }}>
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

      {/* ══ 7. FINAL CTA ═════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'transparent',
          borderTop: '4px solid #0A0A0A',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 0',
          textAlign: 'center',
        }}
      >

        <ScrollReveal direction="scale" className="relative" style={{ zIndex: 1 }}>
          <div className="max-w-2xl mx-auto px-4">
            <div
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
                letterSpacing: '0.3em',
                color: '#B90000',
                marginBottom: 14,
              }}
            >
              ★ ★ ★
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
                letterSpacing: '0.02em',
                color: '#0A0A0A',
                lineHeight: 0.95,
                marginBottom: 20,
              }}
            >
              START YOUR
              <br />
              <span style={{ color: '#B90000', textShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}>
                SPEEDCUBING
              </span>
              <br />
              JOURNEY
            </h2>

            <p
              style={{
                color: '#2a2a2a',
                fontSize: '0.9rem',
                lineHeight: 1.72,
                maxWidth: 400,
                margin: '0 auto 40px',
              }}
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 32px',
                  fontSize: '1.1rem',
                  background: '#0A0A0A',
                  color: '#FFFFFF',
                  border: '3px solid #0A0A0A',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
                  borderRadius: 2,
                  fontFamily: 'var(--font-bangers)',
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                }}
              >
                Open Trainer
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
