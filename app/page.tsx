import Link from 'next/link';
import { ArrowRight, Zap, BookOpen, Target, Star, Layers } from 'lucide-react';
import { HorizonHero } from '@/components/ui/horizon-hero-section';

const features = [
  {
    icon: <BookOpen size={18} />,
    title: 'Complete Algorithm Database',
    desc: 'Every F2L, OLL, and PLL case with multiple algorithm options, move counts, and recognition tips.',
    color: 'var(--violet)',
    bg: 'rgba(124,111,247,0.12)',
  },
  {
    icon: <Zap size={18} />,
    title: 'Instant Search',
    desc: 'Find any algorithm in milliseconds. Search by name, notation, case shape, or category.',
    color: 'var(--amber)',
    bg: 'rgba(251,191,36,0.12)',
  },
  {
    icon: <Target size={18} />,
    title: 'Recognition Trainer',
    desc: 'Test your OLL and PLL recognition. Generate random cases and practice identifying them.',
    color: 'var(--rose)',
    bg: 'rgba(240,98,146,0.12)',
  },
  {
    icon: <Star size={18} />,
    title: 'Add Favorites',
    desc: 'Save algorithms you are learning and build your personal reference collection.',
    color: 'var(--emerald)',
    bg: 'rgba(52,211,153,0.12)',
  },
];

const cfopSteps = [
  {
    letter: 'C',
    word: 'Cross',
    pill: 'pill-adv',
    color: 'var(--amber)',
    glow: 'rgba(251,191,36,0.15)',
    desc: 'Solve the four edge pieces on the bottom layer forming a cross. Typically 5–8 moves and done intuitively.',
  },
  {
    letter: 'F',
    word: 'First Two Layers',
    pill: 'pill-f2l',
    color: 'var(--violet-2)',
    glow: 'rgba(124,111,247,0.15)',
    desc: 'Insert corner-edge pairs into the middle and bottom layers simultaneously. 41 algorithmic cases.',
  },
  {
    letter: 'O',
    word: 'Orient Last Layer',
    pill: 'pill-oll',
    color: 'var(--rose)',
    glow: 'rgba(240,98,146,0.15)',
    desc: 'Orient all pieces on the top layer so the top face is one color. 57 unique cases, each with a dedicated algorithm.',
  },
  {
    letter: 'P',
    word: 'Permute Last Layer',
    pill: 'pill-pll',
    color: 'var(--emerald)',
    glow: 'rgba(52,211,153,0.15)',
    desc: 'Move top-layer pieces into correct positions without disturbing orientation. 21 unique PLL cases.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────── */}
      <HorizonHero />



      {/* ── CFOP Method ────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            
            <h2 className="text-4xl font-black mb-3">
              <span style={{ color: 'var(--fg)' }}>The </span>
              <span className="gradient-text-violet">CFOP Method</span>
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              The most widely used competitive speedcubing method in the world,
              used by over 90% of top WCA competitors.
            </p>
          </div>

          {/* 4-step cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {cfopSteps.map((step) => (
              <div
                key={step.letter}
                className="card-solid rounded-2xl p-6 card-hover relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 pointer-events-none"
                  style={{ background: step.glow, filter: 'blur(20px)' }}
                />
                <div
                  className="text-5xl font-black mb-3 leading-none"
                  style={{ color: step.color }}
                >
                  {step.letter}
                </div>
                <div className="font-bold mb-2 text-sm" style={{ color: 'var(--fg)' }}>
                  {step.word}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Info block */}
          <div className="card-solid rounded-2xl p-8">
            <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--fg)' }}>
              Why Learn CFOP?
            </h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              <p>
                CFOP was created by{' '}
                <strong style={{ color: 'var(--fg)' }}>Jessica Fridrich</strong> while
                studying at Binghamton University, published online in 1997. It reduces
                the average solve length to{' '}
                <strong style={{ color: 'var(--violet-2)' }}>50–60 moves</strong> vs.
                100+ for beginner methods. Top competitors average ~45 moves and achieve
                sub-5-second solves.
              </p>
              <p>
                CFOP&apos;s dominance comes from its{' '}
                <strong style={{ color: 'var(--fg)' }}>efficiency and parallelism</strong>{' '}
                — Cross and F2L can be planned during inspection, and fixed last-layer
                algorithms allow pure muscle memory. Over{' '}
                <strong style={{ color: 'var(--violet-2)' }}>
                  90% of WCA top competitors
                </strong>{' '}
                use it. World records (3.13s by Max Park) were set using this method.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider mx-8" />

      {/* ── Features ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-3">
              <span className="gradient-text">Everything You Need</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-2)' }}>
              Built for speedcubers, from beginner to world-class.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-solid rounded-2xl p-6 flex gap-4 card-hover"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: f.bg, color: f.color }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--fg)' }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider mx-8" />

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(124,111,247,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-4xl font-black mb-4">
            <span style={{ color: 'var(--fg)' }}>Start Your </span>
            <span className="gradient-text">Speedcubing Journey</span>
          </h2>
          <p className="mb-10 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            Browse the complete algorithm database or jump straight into training
            mode to test your recognition skills.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/algorithms"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Browse Algorithms <ArrowRight size={15} />
            </Link>
            <Link
              href="/trainer"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Open Trainer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
