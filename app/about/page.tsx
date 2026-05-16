import Link from 'next/link';
import { BookOpen, ExternalLink, Code2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-3 fade-up" style={{ color: 'var(--fg-3)' }}>
        <Link href="/" className="transition-colors hover:text-(--fg-2)" style={{ color: 'var(--fg-3)' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--fg-2)' }}>About</span>
      </div>

      <div className="flex items-center gap-3 mb-10 fade-up">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,111,247,0.15)' }}
        >
          <BookOpen size={20} style={{ color: 'var(--violet-2)' }} />
        </div>
        <div>
          <h1 className="text-4xl font-black">
            <span style={{ color: 'var(--fg)' }}>About </span>
            <span className="gradient-text-violet">CuboPedia</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-2)' }}>
            The ultimate open-source algorithm reference for speedcubers
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <section className="card-solid rounded-2xl p-6 fade-up-2">
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--fg)' }}>
            What is CuboPedia?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            CuboPedia is a free, open-source Rubik&apos;s Cube algorithm database and training
            platform designed for speedcubers at every level. Whether you&apos;re learning your
            first OLL algorithms or perfecting your PLL recognition, CuboPedia gives you every
            tool you need in one place.
          </p>
        </section>

        <section className="card-solid rounded-2xl p-6 fade-up-2">
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--fg)' }}>
            The CFOP Method &amp; Jessica Fridrich
          </h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--fg-2)' }}>
            The CFOP method was developed by{' '}
            <strong style={{ color: 'var(--violet-2)' }}>Jessica Fridrich</strong>, a Czech
            professor at Binghamton University. She developed the method in the early 1980s
            and published it on her personal website in 1997, making systematic last-layer
            solving accessible to the global cubing community.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            Prior to CFOP, cubers used LBL (Layer-By-Layer) methods requiring significantly
            more moves. CFOP cut solve times dramatically and remains the foundation of
            essentially all competitive 3×3 speedsolving today.
          </p>
        </section>

        <section className="card-solid rounded-2xl p-6 fade-up-3">
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--fg)' }}>
            Algorithm Notation
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { notation: 'R / L / U / D / F / B', desc: 'Right, Left, Up, Down, Front, Back face clockwise' },
              { notation: "R' / L' / ...", desc: 'Counter-clockwise rotation (prime)' },
              { notation: 'R2 / U2 / ...', desc: 'Double turn (180°)' },
              { notation: 'r / u / f', desc: 'Wide move — includes adjacent middle slice' },
              { notation: 'M / E / S', desc: 'Middle, Equator, Standing slice moves' },
              { notation: 'x / y / z', desc: 'Full cube rotations on x, y, z axes' },
            ].map((item) => (
              <div
                key={item.notation}
                className="rounded-xl p-3.5 border"
                style={{ background: '#181828', borderColor: 'var(--border)' }}
              >
                <code className="alg-text text-xs" style={{ color: 'var(--violet-2)' }}>
                  {item.notation}
                </code>
                <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--fg-2)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-solid rounded-2xl p-6 fade-up-3">
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--fg)' }}>
            Resources &amp; Community
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { label: 'World Cube Association', url: 'https://www.worldcubeassociation.org' },
              { label: "Jessica Fridrich's Original Site", url: 'https://www.speedsolving.com/wiki/index.php/CFOP_method' },
              { label: 'Speedsolving.com Wiki', url: 'https://www.speedsolving.com/wiki' },
            ].map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all hover:bg-white/4"
                style={{ borderColor: 'var(--border)', color: 'var(--violet-2)' }}
              >
                <ExternalLink size={12} />
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <div className="card-solid rounded-2xl p-5 text-center fade-up-4">
          <Code2 size={18} className="mx-auto mb-2" style={{ color: 'var(--fg-3)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-3)' }}>
            CuboPedia is an open learning resource. Algorithm credit belongs to the cubing community.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
            Built with Next.js, Three.js, TailwindCSS &amp; TypeScript.
          </p>
        </div>
      </div>
    </div>
  );
}
