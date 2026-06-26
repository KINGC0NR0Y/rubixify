'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 57,  suffix: '',  label: 'OLL Cases',  color: '#B90000' },
  { value: 21,  suffix: '',  label: 'PLL Cases',  color: '#009B48' },
  { value: 41,  suffix: '',  label: 'F2L Pairs',  color: '#0045AD' },
  { value: 119, suffix: '+', label: 'Algorithms', color: '#FF5900' },
];

function Counter({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [count, setCount]  = useState(0);
  const spanRef            = useRef<HTMLSpanElement>(null);
  const inView             = useInView(spanRef, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const DURATION = 1800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={spanRef} style={{ color }}>
      {count}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section
      style={{
        borderTop: '4px solid #0A0A0A',
        borderBottom: '4px solid #0A0A0A',
        padding: '52px 24px',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                borderRight: i < STATS.length - 1 ? '3px solid #0A0A0A' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  marginBottom: 4,
                }}
              >
                <Counter target={s.value} suffix={s.suffix} color={s.color} />
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  color: '#555555',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  width: 36,
                  height: 3,
                  background: s.color,
                  margin: '0 auto',
                  border: '1px solid #0A0A0A',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
