'use client';

// SVG-based 2D cube top-view diagram for OLL/PLL/F2L pattern display

interface Props {
  category: string;
  caseShape?: string;
  size?: number;
}

const YELLOW = '#f7c948';
const GRAY   = '#2a2a32';
const WHITE  = '#e8e8ed';
const VIOLET = '#8b7cf8';

// 9-char string for the U-face 3x3 grid, left-to-right top-to-bottom:
//   [0][1][2]
//   [3][4][5]
//   [6][7][8]
// 'Y' = yellow (oriented), '_' = gray (unoriented)
function getOLLPattern(caseShape?: string): string {
  const patterns: Record<string, string> = {
    dot:      '____Y____',  // only center — nothing else visible
    H:        'Y_YYYYY_Y',  // two vertical cols + center horizontal bar
    Pi:       'YYY_Y_Y_Y',  // top bar + center + two bottom feet
    Sune:     'YYY_Y____',  // top row + center
    AntiSune: '____Y_YYY',  // mirror of Sune: bottom row + center
    Bowtie:   'YY_YYY_YY',  // cross + 2 diagonal corners (top-left, bottom-right)
    T:        'YYYYYY_Y_',  // cross + 2 back corners
    L:        '_Y_YYY_YY',  // cross + front-right corner
    Fish:     'YYY_YY__Y',  // top row + right edge + front-right corner
    Cross:    '_Y_YYY_Y_',  // 4 edges + center only
    skip:     'YYYYYYYYY',
  };
  return patterns[caseShape ?? ''] ?? 'YYYYYYYYY';
}

// PLL: which of the 9 cells contain a "moving" piece (shown in violet)
// and which direction indicator to overlay
type PllArrow = 'cw' | 'ccw' | 'h' | 'z' | 'none';
interface PllInfo { moving: number[]; arrow: PllArrow }

function getPLLInfo(caseShape?: string): PllInfo {
  const map: Record<string, PllInfo> = {
    // Edge-only perms
    U:    { moving: [3, 5, 7],       arrow: 'cw'  }, // 3-edge cycle CW
    H:    { moving: [1, 3, 5, 7],    arrow: 'h'   }, // all 4 edges swap in pairs
    Z:    { moving: [1, 3, 5, 7],    arrow: 'z'   }, // adjacent edges swap (Z pattern)
    // Corner-only perms
    A:    { moving: [0, 2, 6],       arrow: 'cw'  }, // 3-corner cycle
    E:    { moving: [0, 2, 6, 8],    arrow: 'z'   }, // diagonal corner swap
    // Mixed perms
    T:    { moving: [0, 2, 3, 7],    arrow: 'none'}, // 2 corners + 2 opposite edges
    J:    { moving: [2, 8, 5],       arrow: 'cw'  }, // corner-edge J
    R:    { moving: [0, 6, 3],       arrow: 'cw'  }, // R perm
    Y:    { moving: [0, 6, 1, 7],    arrow: 'none'}, // Y perm diagonal
    F:    { moving: [0, 8, 1, 7],    arrow: 'none'}, // F perm
    N:    { moving: [0, 2, 6, 8],    arrow: 'h'   }, // N perm: all corners swap
    V:    { moving: [2, 8, 1, 5],    arrow: 'ccw' }, // V perm
    G:    { moving: [0, 2, 7, 1],    arrow: 'cw'  }, // G perm
    Skip: { moving: [],              arrow: 'none'},  // already solved
  };
  return map[caseShape ?? ''] ?? { moving: [1, 3, 5, 7], arrow: 'cw' };
}

export default function CubeDiagram({ category, caseShape, size = 60 }: Props) {
  const cell = size / 5;
  const gap  = 1;

  // ── OLL ───────────────────────────────────────────────────────────
  if (category === 'OLL') {
    const pattern = getOLLPattern(caseShape);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={0} y={0} width={size} height={size} rx={4} fill={GRAY} />
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = cell + col * (cell + gap);
          const y = cell + row * (cell + gap);
          return (
            <rect
              key={i}
              x={x} y={y}
              width={cell - gap} height={cell - gap}
              rx={2}
              fill={pattern[i] === 'Y' ? YELLOW : GRAY}
              stroke={GRAY}
              strokeWidth={0.5}
            />
          );
        })}
      </svg>
    );
  }

  // ── PLL ───────────────────────────────────────────────────────────
  if (category === 'PLL') {
    const { moving, arrow } = getPLLInfo(caseShape);
    const movingSet = new Set(moving);
    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.28; // arrow radius (fits within the cell grid)

    const cwPath  = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    const ccwPath = `M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy - r}`;
    const arrowColor = 'rgba(255,255,255,0.65)';
    const lineColor  = 'rgba(255,255,255,0.55)';

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <marker id="ah" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(255,255,255,0.65)" />
          </marker>
        </defs>

        <rect x={0} y={0} width={size} height={size} rx={4} fill={GRAY} />

        {/* 3x3 grid: yellow = stationary, violet = cycling piece */}
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = cell + col * (cell + gap);
          const y = cell + row * (cell + gap);
          return (
            <rect
              key={i}
              x={x} y={y}
              width={cell - gap} height={cell - gap}
              rx={2}
              fill={movingSet.has(i) ? VIOLET : YELLOW}
              stroke={GRAY}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Direction indicator */}
        {arrow === 'cw' && (
          <path d={cwPath} fill="none" stroke={arrowColor} strokeWidth={1.6} strokeLinecap="round" markerEnd="url(#ah)" />
        )}
        {arrow === 'ccw' && (
          <path d={ccwPath} fill="none" stroke={arrowColor} strokeWidth={1.6} strokeLinecap="round" markerEnd="url(#ah)" />
        )}
        {arrow === 'h' && <>
          <line x1={cx - r * 0.85} y1={cy - r * 0.45} x2={cx + r * 0.85} y2={cy - r * 0.45} stroke={lineColor} strokeWidth={1.4} markerEnd="url(#ah)" />
          <line x1={cx + r * 0.85} y1={cy + r * 0.45} x2={cx - r * 0.85} y2={cy + r * 0.45} stroke={lineColor} strokeWidth={1.4} markerEnd="url(#ah)" />
        </>}
        {arrow === 'z' && (
          <line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} stroke={lineColor} strokeWidth={1.4} markerEnd="url(#ah)" />
        )}
      </svg>
    );
  }

  // ── F2L ───────────────────────────────────────────────────────────
  if (category === 'F2L') {
    const s = size / 4;
    // Corner and edge sticker colors for the highlighted FR slot
    const slotColors: Record<string, [string, string]> = {
      basic:    [WHITE,     '#ff6b6b'],
      paired:   ['#6bffae', '#6bffae'],
      twisted:  ['#ff9d6b', WHITE    ],
      flipped:  ['#ff6b6b', WHITE    ],
      occupied: ['#4a4a5a', '#4a4a5a'],
    };
    const [cornerFill, edgeFill] = slotColors[caseShape ?? ''] ?? [WHITE, '#ff6b6b'];
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={0} y={0} width={size} height={size} rx={4} fill={GRAY} />
        {/* U face top row */}
        <rect x={s * 0.5} y={s * 0.5} width={s - 2} height={s - 2} rx={2} fill={YELLOW} />
        <rect x={s * 1.5} y={s * 0.5} width={s - 2} height={s - 2} rx={2} fill={YELLOW} />
        <rect x={s * 2.5} y={s * 0.5} width={s - 2} height={s - 2} rx={2} fill={YELLOW} />
        {/* FR slot: corner (row 2) + edge (row 3) */}
        <rect x={s * 2.5} y={s * 1.5} width={s - 2} height={s - 2} rx={2} fill={cornerFill} opacity={0.9} />
        <rect x={s * 2.5} y={s * 2.5} width={s - 2} height={s - 2} rx={2} fill={edgeFill}   opacity={0.9} />
      </svg>
    );
  }

  // ── Advanced ──────────────────────────────────────────────────────
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={0} y={0} width={size} height={size} rx={4} fill={GRAY} />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        fontSize={size * 0.28}
        fill="#f7971e"
        fontFamily="monospace"
      >
        ADV
      </text>
    </svg>
  );
}
