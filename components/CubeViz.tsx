'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  alg: string;
  category: string;
  size?: number;
}

const BG = '#0d0d12';

export default function CubeViz({ alg, category, size = 80 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let cancelled = false;

    import('sr-visualizer').then(({ cubeSVG, Masking }) => {
      if (cancelled || !el) return;
      el.innerHTML = '';

      const base = {
        width: size,
        height: size,
        backgroundColor: BG,
        cubeColor: '#1a1a24',
      };

      try {
        if (category === 'OLL') {
          cubeSVG(el, { ...base, case: alg || undefined, view: 'plan', mask: Masking.OLL });
        } else if (category === 'PLL') {
          cubeSVG(el, { ...base, case: alg || undefined, view: 'plan', mask: Masking.LL });
        } else if (category === 'F2L') {
          cubeSVG(el, { ...base, case: alg || undefined, mask: Masking.F2L });
        } else {
          cubeSVG(el, { ...base, algorithm: alg || undefined });
        }
        if (!cancelled) setReady(true);
      } catch {
        // silently ignore rendering errors for unsupported algorithm strings
      }
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [alg, category, size]);

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: 'hidden',
        background: BG,
        flexShrink: 0,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.18s ease',
      }}
    />
  );
}
