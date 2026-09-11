// ─────────────────────────────────────────────────────────────────────────────
// Reusable CFOP cube-image generation utility.
//
// This module turns an algorithm + a CFOP category into a deterministic set of
// render options for `sr-visualizer` (a TypeScript fork of VisualCube). It is
// intentionally DOM-free and dependency-free so it can be unit-tested with the
// built-in Node test runner and imported from both server and client code.
//
// The actual SVG rendering (which needs the browser DOM) happens in
// `components/CubeViz.tsx`, which consumes `buildCubeOptions()` from here.
// ─────────────────────────────────────────────────────────────────────────────

import type { Category } from './algorithms';

/**
 * What cube state to draw for a case:
 *  - `recognition` → the state you see *before* executing the algorithm
 *    (rendered via VisualCube's `case`, i.e. the inverse of the algorithm).
 *    This is what a solver actually looks at, so it is the default.
 *  - `execution`   → a solved cube with the algorithm applied (via `algorithm`).
 *    Useful for "what does this alg do" style learning.
 *  - `solved`      → a clean solved cube with the relevant mask, i.e. the goal.
 */
export type CubeState = 'recognition' | 'execution' | 'solved';

export interface CubeStyle {
  size?: number;
  background?: string;
  cubeColor?: string;
  maskColor?: string;
}

export interface CubeImageInput {
  alg: string;
  category: Category;
  state?: CubeState;
  style?: CubeStyle;
}

/** Symbolic viewport rotation — mapped to the library's `Axis` enum in CubeViz. */
export type ViewportRotation = ['x' | 'y' | 'z', number];

/**
 * Structurally compatible with sr-visualizer's `ICubeOptions`, but defined
 * locally so this file never imports the (DOM-bound) renderer. `mask` is a plain
 * string here — it matches the library's `Masking` string-enum values exactly
 * and is cast at the call site.
 */
export interface CubeRenderOptions {
  width: number;
  height: number;
  backgroundColor: string;
  cubeColor: string;
  maskColor: string;
  colorScheme: Record<number, string>;
  mask?: string;
  view?: 'plan';
  viewportRotations?: ViewportRotation[];
  case?: string;
  algorithm?: string;
}

// ── Consistent look across every generated image ────────────────────────────
// VisualCube face indices: U=0, R=1, F=2, D=3, L=4, B=5.
// Standard (yellow-top) speedcubing scheme, pinned explicitly so images stay
// identical regardless of any library-default changes.
export const WCA_COLOR_SCHEME: Record<number, string> = {
  0: '#FFD500', // U — yellow
  1: '#C41E3A', // R — red
  2: '#0051BA', // F — blue
  3: '#FFFFFF', // D — white
  4: '#FF5800', // L — orange
  5: '#009B48', // B — green
};

// Classic OLL diagram scheme: only the U (yellow) face is coloured; every other
// face is gray. Because a mis-oriented last-layer piece shows a side colour on
// top, those stickers render gray while oriented (yellow-up) stickers stay
// yellow — giving the familiar yellow/gray OLL recognition pattern.
export const OLL_GRAY = '#555566';
export const OLL_COLOR_SCHEME: Record<number, string> = {
  0: '#FFD500', // U — yellow (oriented)
  1: OLL_GRAY,
  2: OLL_GRAY,
  3: OLL_GRAY,
  4: OLL_GRAY,
  5: OLL_GRAY,
};

export const DEFAULT_STYLE: Required<CubeStyle> = {
  size: 80,
  background: '#0d0d12',
  cubeColor: '#1a1a24',
  maskColor: OLL_GRAY,
};

// VisualCube `Masking` string-enum value, referenced without importing the lib.
// The last-layer mask reveals the whole last layer (U face + the side "tabs"),
// which is required to read corner-twist direction — VisualCube's narrower
// `oll` mask hides the side tabs and makes e.g. Sune/Anti-Sune indistinguishable.
const MASK = {
  LL: 'll',
} as const;

interface CategoryConfig {
  mask?: string;
  /** Plan (top-down) view is ideal for last-layer cases. */
  planView: boolean;
  /** Explicit rotations when not using plan view (e.g. tilt to reveal bottom). */
  viewportRotations?: ViewportRotation[];
  /** Default state for the category's headline image. */
  defaultState: CubeState;
  /** Per-category sticker colour scheme (defaults to WCA). */
  colorScheme?: Record<number, string>;
}

const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  // F2L recognition needs the U-layer pair visible, so no mask — show the whole
  // cube (cross + solved slots + the pair to insert) in the standard 3D view.
  F2L: { planView: false, defaultState: 'recognition' },
  // OLL reads only orientation: the last layer from the top, with non-oriented
  // stickers greyed out (classic OLL diagram) via the gray colour scheme.
  OLL: { mask: MASK.LL, planView: true, defaultState: 'recognition', colorScheme: OLL_COLOR_SCHEME },
  // PLL needs full colours to read the permutation.
  PLL: { mask: MASK.LL, planView: true, defaultState: 'recognition' },
};

/** Fallback for a category with no entry above (e.g. data from an older build). */
const DEFAULT_CONFIG: CategoryConfig = { planView: false, defaultState: 'execution' };

// ── Notation helpers (pure, unit-tested) ────────────────────────────────────

/** Split an algorithm string into individual move tokens. */
export function tokenizeMoves(alg: string): string[] {
  return alg.trim().split(/\s+/).filter(Boolean);
}

// A single WCA move: optional layer count, a face/slice/rotation letter, an
// optional wide `w`, and an optional `2` / `'` (or `2'` / `'2`) modifier.
const MOVE_RE = /^([2-9])?([UuFfRrDdLlBbMESxyz])(w)?(?:2'|'2|['2])?$/;

/** True when every token in the algorithm is valid WCA notation. */
export function isValidNotation(alg: string): boolean {
  const tokens = tokenizeMoves(alg);
  if (tokens.length === 0) return true; // an empty alg ("skip") is valid
  return tokens.every((t) => MOVE_RE.test(t));
}

/**
 * Whether the algorithm's NET whole-cube rotation is the identity — i.e. the
 * six centres end where they started. Composes only the x/y/z tokens (face and
 * slice moves don't reorient the fixed frame of a complete case). This is the
 * property that keeps a `case`-rendered image in the standard orientation, so a
 * balanced rotation like `x … x'` counts as neutral even though it contains
 * rotation tokens.
 */
export function isRotationNeutral(alg: string): boolean {
  type Vec = [number, number, number];
  let up: Vec = [0, 1, 0];
  let front: Vec = [0, 0, 1];
  const rotX = (v: Vec): Vec => [v[0], v[2], -v[1]]; // "x" follows R
  const rotY = (v: Vec): Vec => [-v[2], v[1], v[0]]; // "y" follows U
  const rotZ = (v: Vec): Vec => [v[1], -v[0], v[2]]; // "z" follows F
  for (const tok of tokenizeMoves(alg)) {
    const m = /^([xyz])(2'|'2|2|')?$/.exec(tok);
    if (!m) continue;
    const fn = m[1] === 'x' ? rotX : m[1] === 'y' ? rotY : rotZ;
    const count = m[2] === "'" ? 3 : m[2] ? 2 : 1;
    for (let i = 0; i < count; i++) {
      up = fn(up);
      front = fn(front);
    }
  }
  return up[0] === 0 && up[1] === 1 && up[2] === 0 && front[0] === 0 && front[1] === 0 && front[2] === 1;
}

/** Count of non-rotation moves (rotations don't turn any layer). */
export function moveCount(alg: string): number {
  return tokenizeMoves(alg).filter((t) => !/^[xyz]/.test(t)).length;
}

// ── Core builder ────────────────────────────────────────────────────────────

/**
 * Build the deterministic VisualCube render options for a case. Given identical
 * input this always returns a deeply-equal object.
 */
export function buildCubeOptions(input: CubeImageInput): CubeRenderOptions {
  const cfg = CATEGORY_CONFIG[input.category] ?? DEFAULT_CONFIG;
  const state = input.state ?? cfg.defaultState;
  const style = { ...DEFAULT_STYLE, ...input.style };
  const alg = input.alg.trim();

  const options: CubeRenderOptions = {
    width: style.size,
    height: style.size,
    backgroundColor: style.background,
    cubeColor: style.cubeColor,
    maskColor: style.maskColor,
    colorScheme: cfg.colorScheme ?? WCA_COLOR_SCHEME,
  };

  if (cfg.mask) options.mask = cfg.mask;
  if (cfg.planView) {
    options.view = 'plan';
  } else {
    // Non-plan categories (F2L) MUST carry explicit rotations. The
    // renderer reads `viewportRotations` unconditionally when not in plan view,
    // so leaving it undefined throws and renders a blank cube. Default to the
    // standard 3D isometric view (VisualCube's own default angles).
    options.viewportRotations = cfg.viewportRotations ?? [['y', 45], ['x', -34]];
  }

  // Choose how the algorithm maps onto the drawn state.
  if (alg) {
    if (state === 'recognition') {
      // Draw the state that `alg` solves (VisualCube applies the inverse).
      options.case = alg;
    } else if (state === 'execution') {
      // Apply `alg` to a solved cube and draw the result.
      options.algorithm = alg;
    }
    // `solved` intentionally applies no moves → the clean/target state.
  }

  return options;
}

/**
 * Stable cache key for a rendered image. Two inputs that produce identical
 * pixels produce identical keys, so rendered SVG can be memoized safely.
 */
export function cubeCacheKey(input: CubeImageInput): string {
  const o = buildCubeOptions(input);
  return JSON.stringify([
    o.width,
    o.mask ?? '',
    o.view ?? '',
    o.viewportRotations ?? '',
    o.case ?? '',
    o.algorithm ?? '',
    o.backgroundColor,
    o.cubeColor,
    o.maskColor,
    // Included so OLL's gray scheme and PLL's full scheme never share a key.
    o.colorScheme,
  ]);
}
