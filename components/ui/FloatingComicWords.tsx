'use client';

// Deterministic floating background elements — no random values to avoid hydration mismatch

const WORDS = [
  { text: 'POW!',    color: '#6495ED', x: '6%',  y: '18%', rotate: -14, size: '1.3rem', dur: '7s',  del: '0s'   },
  { text: 'BAM!',    color: '#0045AD', x: '80%', y: '9%',  rotate:  9,  size: '1.1rem', dur: '9s',  del: '1.4s' },
  { text: 'SNAP!',   color: '#009B48', x: '88%', y: '44%', rotate: -6,  size: '1rem',   dur: '11s', del: '2.8s' },
  { text: 'TWIST!',  color: '#FF5900', x: '4%',  y: '58%', rotate: 11,  size: '1rem',   dur: '8s',  del: '0.7s' },
  { text: 'SOLVED!', color: '#FFD500', x: '62%', y: '82%', rotate: -8,  size: '1.15rem',dur: '10s', del: '2s'   },
  { text: 'ZAP!',    color: '#6495ED', x: '32%', y: '72%', rotate: 13,  size: '0.9rem', dur: '12s', del: '1s'   },
  { text: 'CRUNCH!', color: '#0045AD', x: '48%', y: '11%', rotate: -5,  size: '0.85rem',dur: '9s',  del: '3s'   },
  { text: 'SPIN!',   color: '#009B48', x: '18%', y: '90%', rotate: 7,   size: '0.9rem', dur: '8s',  del: '1.6s' },
];

// Cube color swatches drifting in the background
const FRAGMENTS = [
  { color: '#6495ED', size: 20, x: '22%',  y: '28%', rotate:  15, dur: '11s', del: '0.4s' },
  { color: '#0045AD', size: 16, x: '72%',  y: '18%', rotate: -20, dur: '9s',  del: '1.1s' },
  { color: '#FFD500', size: 26, x: '91%',  y: '62%', rotate:  30, dur: '13s', del: '2s'   },
  { color: '#009B48', size: 18, x: '10%',  y: '78%', rotate: -10, dur: '10s', del: '0.2s' },
  { color: '#FF5900', size: 14, x: '54%',  y: '55%', rotate:  22, dur: '8s',  del: '1.7s' },
  { color: '#6495ED', size: 22, x: '38%',  y: '88%', rotate: -18, dur: '12s', del: '0.9s' },
  { color: '#0045AD', size: 12, x: '76%',  y: '73%', rotate:  28, dur: '7s',  del: '3.1s' },
  { color: '#FFD500', size: 18, x: '2%',   y: '40%', rotate: -25, dur: '10s', del: '2.3s' },
  { color: '#009B48', size: 24, x: '60%',  y: '30%', rotate:  10, dur: '14s', del: '1.5s' },
];

export function FloatingComicWords() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {WORDS.map((w, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: w.x,
            top: w.y,
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: w.size,
            color: w.color,
            transform: `rotate(${w.rotate}deg)`,
            opacity: 0.1,
            letterSpacing: '0.06em',
            userSelect: 'none',
            animation: `floatWord ${w.dur} ease-in-out ${w.del} infinite`,
            textShadow: '1px 1px 0 #0A0A0A',
          }}
        >
          {w.text}
        </span>
      ))}

      {FRAGMENTS.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: f.x,
            top: f.y,
            width: f.size,
            height: f.size,
            background: f.color,
            border: '1.5px solid #0A0A0A',
            opacity: 0.07,
            animation: `floatFragment ${f.dur} ease-in-out ${f.del} infinite`,
            transform: `rotate(${f.rotate}deg)`,
            borderRadius: 1,
          }}
        />
      ))}

      {/* Radiating speed lines — top-right corner */}
      <svg
        viewBox="0 0 300 300"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '22vw',
          minWidth: 120,
          opacity: 0.04,
        }}
        aria-hidden
      >
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 0.5; // quarter-circle fan
          return (
            <line
              key={i}
              x1={300} y1={0}
              x2={Math.round(300 - Math.cos(a) * 380)}
              y2={Math.round(Math.sin(a) * 380)}
              stroke="#0A0A0A"
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
            />
          );
        })}
      </svg>

      {/* Speed lines — bottom-left corner */}
      <svg
        viewBox="0 0 300 300"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '18vw',
          minWidth: 100,
          opacity: 0.04,
        }}
        aria-hidden
      >
        {Array.from({ length: 12 }, (_, i) => {
          const a = Math.PI + (i / 12) * Math.PI * 0.5;
          return (
            <line
              key={i}
              x1={0} y1={300}
              x2={Math.round(Math.cos(a) * 360)}
              y2={Math.round(300 + Math.sin(a) * 360)}
              stroke="#0A0A0A"
              strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            />
          );
        })}
      </svg>

    </div>
  );
}
