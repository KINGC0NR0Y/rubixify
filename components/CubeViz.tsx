'use client';

import { useEffect, useRef, useState } from 'react';
import {
  buildCubeOptions,
  cubeCacheKey,
  type CubeState,
  type ViewportRotation,
} from '@/lib/cubeImage';
import type { Category } from '@/lib/algorithms';

interface Props {
  alg: string;
  category: string;
  size?: number;
  /** Which cube state to draw. Defaults to the category's recognition state. */
  state?: CubeState;
}

// Rendered SVG markup is memoized across every card/detail mount. VisualCube is
// deterministic, so an identical option-set always yields identical markup —
// re-mounting a cached case is an innerHTML assignment with no re-computation.
const svgCache = new Map<string, string>();

const AXIS = { x: 0, y: 1, z: 2 } as const;

export default function CubeViz({ alg, category, size = 80, state }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let cancelled = false;

    const input = { alg, category: category as Category, state, style: { size } };
    const key = cubeCacheKey(input);

    const cached = svgCache.get(key);
    if (cached) {
      el.innerHTML = cached;
      setReady(true);
      return;
    }

    import('sr-visualizer')
      .then(({ cubeSVG }) => {
        if (cancelled || !el) return;
        el.innerHTML = '';

        const o = buildCubeOptions(input);
        try {
          cubeSVG(el, {
            width: o.width,
            height: o.height,
            backgroundColor: o.backgroundColor,
            cubeColor: o.cubeColor,
            maskColor: o.maskColor,
            colorScheme: o.colorScheme,
            // `mask` values match the library's Masking string-enum exactly.
            mask: o.mask as never,
            view: o.view,
            viewportRotations: o.viewportRotations?.map(
              ([axis, deg]: ViewportRotation) => [AXIS[axis], deg] as [number, number],
            ) as never,
            case: o.case,
            algorithm: o.algorithm,
          });

          // Make the drawn SVG scale to its container (responsive).
          const svg = el.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
          }
          svgCache.set(key, el.innerHTML);
          if (!cancelled) setReady(true);
        } catch {
          // Silently ignore rendering errors for unsupported algorithm strings.
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [alg, category, size, state]);

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#0d0d12',
        flexShrink: 0,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.18s ease',
      }}
    />
  );
}
