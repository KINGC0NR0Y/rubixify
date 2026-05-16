'use client';

import { useEffect, useRef, useState } from 'react';
import { bgCamera } from '@/lib/bg-camera';

const SECTIONS = [
  { title: 'CUBOPEDIA',   l1: 'The Ultimate Speedcubing',         l2: 'Algorithm Database.' },
  { title: 'MASTER CFOP', l1: '57 OLL · 21 PLL · 41 F2L cases.',  l2: 'Every algorithm. Every step of the way.' },
  { title: 'GO FASTER',   l1: 'Build muscle memory.',              l2: 'Train recognition. Break records.' },
];

const CAM_POS = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 40, z: -50 },
  { x: 0, y: 50, z: -700 },
];

export function HorizonHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [section, setSection]   = useState(0);
  const [isReady, setIsReady]   = useState(false);

  // Enable mountains + set initial hero camera position
  useEffect(() => {
    bgCamera.tx = CAM_POS[0].x;
    bgCamera.ty = CAM_POS[0].y;
    bgCamera.tz = CAM_POS[0].z;
    setIsReady(true);

    return () => {
      // Restore ambient background when leaving home page
      bgCamera.tx = 0;
      bgCamera.ty = 30;
      bgCamera.tz = 200;
    };
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    if (!isReady) return;
    let killed = false;
    import('gsap').then(({ gsap }) => {
      if (killed) return;
      const tl = gsap.timeline();
      if (contentRef.current) {
        tl.from(contentRef.current, { y: 50, opacity: 0, duration: 1.4, ease: 'power3.out' });
      }
      if (scrollRef.current) {
        tl.from(scrollRef.current, { y: 20, opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.6');
      }
    });
    return () => { killed = true; };
  }, [isReady]);

  // Scroll → drive bgCamera
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollY  = window.scrollY;
      const heroMax  = container.offsetHeight - window.innerHeight;
      const heroFrac = Math.min(Math.max(scrollY / heroMax, 0), 1);

      setProgress(heroFrac);

      const n        = SECTIONS.length;
      const rawSect  = Math.floor(heroFrac * n);
      const sect     = Math.min(rawSect, n - 1);
      setSection(sect);

      // Camera interpolation
      const sectProg = (heroFrac * n) % 1;
      const cur      = CAM_POS[sect]     ?? CAM_POS[0];
      const nxt      = CAM_POS[sect + 1] ?? cur;
      bgCamera.tx = cur.x + (nxt.x - cur.x) * sectProg;
      bgCamera.ty = cur.y + (nxt.y - cur.y) * sectProg;
      bgCamera.tz = cur.z + (nxt.z - cur.z) * sectProg;

      // Slide GO FASTER panel down and fade it out when scrolling past hero
      const exitFrac = heroFrac > 0.88 ? (heroFrac - 0.88) / 0.12 : 0;
      const fade     = Math.max(0, 1 - exitFrac);
      const slideY   = exitFrac * -80;
      if (contentRef.current) {
        contentRef.current.style.opacity   = String(fade);
        contentRef.current.style.transform = `translate(-50%, calc(-50% + ${slideY}px))`;
      }
      if (scrollRef.current) scrollRef.current.style.opacity = String(fade);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const sect = SECTIONS[section] ?? SECTIONS[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400vh' }}>
      {/* Side marker */}
      <div style={{
        position: 'fixed', left: '2rem', top: '50%', transform: 'translateY(-50%)',
        zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: 22, height: 1.5,
              background: 'rgba(255,255,255,0.35)', borderRadius: 2,
            }} />
          ))}
        </div>
        <span style={{
          writingMode: 'vertical-rl', color: 'rgba(255,255,255,0.25)',
          fontSize: '0.6rem', letterSpacing: '0.25em', fontWeight: 700,
          fontFamily: 'var(--font-geist-mono)',
        }}>
          CFOP
        </span>
      </div>

      {/* Fixed hero content */}
      <div
        ref={contentRef}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5, textAlign: 'center', pointerEvents: 'none',
          width: '100%', padding: '0 1.5rem',
        }}
      >
        <div key={section} className="horizon-section-fade">
          <p style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.65rem', letterSpacing: '0.35em',
            color: 'rgba(160,140,255,0.7)', marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            {['By cubers, for cubers.', 'Learn & Practice', 'Algorithm Trainer & Timer'][section]}
          </p>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 9vw, 9rem)', fontWeight: 900,
            lineHeight: 1, letterSpacing: '-0.03em',
            color: 'var(--fg)', margin: 0,
          }}>
            {sect.title}
          </h1>
          <div style={{
            marginTop: '1.25rem',
            color: 'rgba(240,240,248,0.42)',
            fontSize: 'clamp(0.8rem, 1.4vw, 1rem)', lineHeight: 1.75,
          }}>
            <p style={{ margin: 0 }}>{sect.l1}</p>
            <p style={{ margin: 0 }}>{sect.l2}</p>
          </div>
        </div>
      </div>

      {/* Scroll progress */}
      <div
        ref={scrollRef}
        style={{
          position: 'fixed', bottom: '2.5rem', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6, display: 'flex', alignItems: 'center', gap: '1rem',
          color: 'rgba(255,255,255,0.28)',
          fontSize: '0.6rem', letterSpacing: '0.2em',
          fontFamily: 'var(--font-geist-mono)', pointerEvents: 'none',
        }}
      >
        <span style={{ letterSpacing: '0.3em' }}>SCROLL</span>
        <div style={{ width: 100, height: 1, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'rgba(160,140,255,0.85)',
            transition: 'width 0.06s linear',
          }} />
        </div>
        <span>
          {String(section + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll spacers */}
      <div style={{ height: '100vh' }} />
      <div style={{ height: '100vh' }} />
      <div style={{ height: '100vh' }} />
    </div>
  );
}
