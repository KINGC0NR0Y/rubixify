// ─────────────────────────────────────────────────────────────────────────────
// Automatic 3×3 solver.
//
// The route is deliberately the one a human follows, so the output is something
// a beginner can execute on a physical cube rather than an opaque optimal
// sequence:
//
//   1. Cross — the four white edges, solved optimally from a pruning table
//   2. F2L   — each white corner paired with its middle-layer edge, slot by slot
//   3. OLL   — one algorithm from this site's own 57-case database
//   4. PLL   — one algorithm from this site's own 21-case database
//
// F2L picks its algorithm by *trying* candidates against the live cube and
// keeping the shortest one that reaches the goal without disturbing anything
// already solved, falling back to a short search and then to placing the corner
// and the edge separately. Nothing depends on hand-derived case analysis, so
// there is no silent-wrong-alg failure mode: a candidate either provably
// achieves the sub-goal or it is not used.
// ─────────────────────────────────────────────────────────────────────────────

import {
  SOLVED, applyAlg, applyMove, toCubiesStrict, tokenize, isParsable, parseMove,
  toBytes, permFor, applyPermBytes,
  CORNER_FACELETS, EDGE_FACELETS, type Facelets,
} from './cube.ts';
import { f2lAlgorithms, ollAlgorithms, pllAlgorithms, type Algorithm } from './algorithms.ts';

export type StageKey = 'cross' | 'f2l' | 'oll' | 'pll';

export interface SolutionStage {
  key: StageKey;
  title: string;
  /** One line of "what you are doing and why" for the step list. */
  blurb: string;
  color: string;
  moves: string[];
  /** Index of this stage's first move within `Solution.moves`. */
  start: number;
  /** For OLL/PLL: the matched case, so the UI can link to its page. */
  algId?: string;
  algName?: string;
}

export interface Solution {
  moves: string[];
  stages: SolutionStage[];
  /** `states[i]` is the cube *before* move `i`; the last entry is solved. */
  states: Facelets[];
  /** Move total excluding whole-cube rotations, which turn no layer. */
  turnCount: number;
}

const STAGE_META: Record<StageKey, { title: string; blurb: string; color: string }> = {
  cross: {
    title: 'White Cross',
    blurb: 'Build the white cross on the bottom, with every side colour matching its centre.',
    color: '#0045AD',
  },
  f2l: {
    title: 'First Two Layers',
    blurb: 'Pair each white corner with its middle-layer edge and drop them in together.',
    color: '#B90000',
  },
  oll: {
    title: 'Orient Last Layer',
    blurb: 'One algorithm turns the whole top face yellow.',
    color: '#FFD500',
  },
  pll: {
    title: 'Permute Last Layer',
    blurb: 'One last algorithm sends every remaining piece home.',
    color: '#009B48',
  },
};

// ── Small helpers ───────────────────────────────────────────────────────────

const FACE_TURNS = ['U', 'D', 'L', 'R', 'F', 'B'];
const ALL_FACE_MOVES = FACE_TURNS.flatMap((f) => [f, `${f}'`, `${f}2`]);
const AUFS = ['', 'U', 'U2', "U'"];

const CROSS_PIECES = [4, 5, 6, 7]; // DR, DF, DL, DB
const CROSS_FACELETS = CROSS_PIECES.flatMap((i) => [...EDGE_FACELETS[i]]);
const D_CORNERS = [4, 5, 6, 7]; // DFR, DLF, DBL, DRB
const MIDDLE_EDGES = [8, 9, 10, 11]; // FR, FL, BL, BR

/** True when every listed facelet already holds its solved colour. */
const matches = (f: Facelets, idx: readonly number[]) => idx.every((i) => f[i] === SOLVED[i]);

const countTurns = (moves: readonly string[]) =>
  moves.filter((m) => !/^[xyz]/.test(m)).length;

/**
 * Conjugate an algorithm by `k` whole-cube y rotations, as pure letter
 * substitution so the result stays free of rotation moves. Only face turns are
 * remapped, which is all the candidate algorithms below use.
 */
const Y_CONJUGATE: Record<string, string> = { R: 'B', B: 'L', L: 'F', F: 'R', U: 'U', D: 'D' };

function remapY(alg: string, k: number): string {
  if (k === 0) return alg;
  return alg
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      let face = tok[0];
      for (let i = 0; i < k; i++) face = Y_CONJUGATE[face] ?? face;
      return face + tok.slice(1);
    })
    .join(' ');
}

// ── Cross: exact solutions from a pruning table ─────────────────────────────
//
// The cross depends only on where the four white edges are and how they are
// flipped — 11880 × 16 reachable states. A single breadth-first sweep from the
// solved cross therefore yields the exact distance for every state, and the
// cross is then solved by walking downhill with no search at all.

const CROSS_MOVE_NAMES = ALL_FACE_MOVES;
const COORD_SIZE = 24 * 24 * 24 * 24;

/** Per move: `(slot × 2 + flip)` before → after. */
function buildSlotTables(): Int8Array[] {
  return CROSS_MOVE_NAMES.map((m) => {
    const after = toCubiesStrict(applyAlg(SOLVED, m));
    const tab = new Int8Array(24);
    for (let slot = 0; slot < 12; slot++) {
      const from = after.ep[slot];
      const flip = after.eo[slot];
      for (let o = 0; o < 2; o++) tab[from * 2 + o] = slot * 2 + ((o + flip) % 2);
    }
    return tab;
  });
}

let slotTables: Int8Array[] | null = null;
let crossDist: Int8Array | null = null;

function crossCoordOf(f: Facelets): number {
  const { ep, eo } = toCubiesStrict(f);
  let coord = 0;
  for (let k = 3; k >= 0; k--) {
    const slot = ep.indexOf(CROSS_PIECES[k]);
    coord = coord * 24 + slot * 2 + eo[slot];
  }
  return coord;
}

function coordAfter(coord: number, moveIndex: number): number {
  const tab = slotTables![moveIndex];
  let rest = coord;
  let out = 0;
  let mul = 1;
  for (let k = 0; k < 4; k++) {
    out += tab[rest % 24] * mul;
    rest = (rest / 24) | 0;
    mul *= 24;
  }
  return out;
}

/** Build (once) the exact cross distance table. Roughly 190k reachable states. */
export function crossTable(): Int8Array {
  if (crossDist) return crossDist;
  slotTables = buildSlotTables();
  const dist = new Int8Array(COORD_SIZE).fill(-1);
  const start = crossCoordOf(SOLVED);
  dist[start] = 0;
  const queue = new Int32Array(200000);
  queue[0] = start;
  let head = 0;
  let tail = 1;
  while (head < tail) {
    const coord = queue[head++];
    const next = dist[coord] + 1;
    for (let m = 0; m < CROSS_MOVE_NAMES.length; m++) {
      const nc = coordAfter(coord, m);
      if (dist[nc] === -1) {
        dist[nc] = next;
        queue[tail++] = nc;
      }
    }
  }
  crossDist = dist;
  return dist;
}

function solveCross(f: Facelets): string[] {
  const dist = crossTable();
  let coord = crossCoordOf(f);
  const moves: string[] = [];
  let d = dist[coord];
  while (d > 0) {
    let advanced = false;
    for (let m = 0; m < CROSS_MOVE_NAMES.length; m++) {
      const nc = coordAfter(coord, m);
      if (dist[nc] === d - 1) {
        moves.push(CROSS_MOVE_NAMES[m]);
        coord = nc;
        d--;
        advanced = true;
        break;
      }
    }
    /* c8 ignore next */
    if (!advanced) throw new Error('Cross table walk stalled');
  }
  return moves;
}

// ── Candidate-driven sub-goals ──────────────────────────────────────────────

/**
 * Try every `AUF + algorithm` pairing and return the shortest one that reaches
 * `goal`. Returning `null` simply means "fall through to the search", so a
 * missing case degrades in length rather than in correctness.
 */
function bestCandidate(
  f: Facelets,
  candidates: readonly string[],
  goal: (state: Facelets) => boolean,
): string[] | null {
  let best: string[] | null = null;
  for (const auf of AUFS) {
    for (const cand of candidates) {
      const moves = (auf ? `${auf} ${cand}` : cand).split(/\s+/).filter(Boolean);
      if (best && moves.length >= best.length) continue;
      if (goal(applyAlg(f, moves))) best = moves;
    }
  }
  return best;
}

/**
 * Iterative-deepening fallback over the faces that touch `slot` plus U. Only
 * runs if no listed algorithm fits, which the test suite says never happens for
 * random cubes — it exists so an unforeseen case still gets solved.
 */
function searchSubgoal(
  f: Facelets,
  faces: readonly string[],
  goal: (state: Facelets) => boolean,
  maxDepth: number,
): string[] | null {
  const moveSet = faces.flatMap((face) => [face, `${face}'`, `${face}2`]);
  const path: string[] = [];

  const dfs = (state: Facelets, depth: number, lastFace: string): boolean => {
    if (depth === 0) return goal(state);
    for (const m of moveSet) {
      if (m[0] === lastFace) continue;
      const next = applyMove(state, m);
      path.push(m);
      if (depth === 1 ? goal(next) : dfs(next, depth - 1, m[0])) return true;
      path.pop();
    }
    return false;
  };

  for (let depth = 1; depth <= maxDepth; depth++) {
    path.length = 0;
    if (dfs(f, depth, '')) return [...path];
  }
  return null;
}

const SOLVED_BYTES = toBytes(SOLVED);

/**
 * The same iterative deepening, specialised to the goal that actually matters
 * here — "these facelets all show their solved colour". Running on byte arrays
 * with precomputed permutations makes a depth-7 sweep cheap enough to sit in a
 * click handler, which is what lets F2L reach for a search at all.
 */
function searchPlacement(
  f: Facelets,
  faces: readonly string[],
  required: readonly number[],
  maxDepth: number,
): string[] | null {
  const moveSet = faces.flatMap((face) => [face, `${face}'`, `${face}2`]);
  const perms = moveSet.map(permFor);
  const buffers = Array.from({ length: maxDepth + 1 }, () => new Uint8Array(54));
  buffers[0].set(toBytes(f));
  const req = Int32Array.from(required);
  const path: number[] = [];

  const reached = (b: Uint8Array) => {
    for (let i = 0; i < req.length; i++) if (b[req[i]] !== SOLVED_BYTES[req[i]]) return false;
    return true;
  };

  const dfs = (remaining: number, level: number, lastFace: string): boolean => {
    for (let m = 0; m < perms.length; m++) {
      if (moveSet[m][0] === lastFace) continue;
      applyPermBytes(buffers[level], perms[m], buffers[level + 1]);
      path.push(m);
      if (remaining === 1 ? reached(buffers[level + 1]) : dfs(remaining - 1, level + 1, moveSet[m][0])) return true;
      path.pop();
    }
    return false;
  };

  for (let depth = 1; depth <= maxDepth; depth++) {
    path.length = 0;
    if (dfs(depth, 0, '')) return path.map((i) => moveSet[i]);
  }
  return null;
}

/** Faces (other than U) that a first-layer or middle-layer slot sits between. */
function slotFaces(kind: 'corner' | 'edge', slot: number): string[] {
  const names = kind === 'corner'
    ? ['DFR', 'DLF', 'DBL', 'DRB'][slot - 4]
    : ['FR', 'FL', 'BL', 'BR'][slot - 8];
  return ['U', ...names.split('').filter((c) => c !== 'D')];
}

// Corner insertions, written for the front-right slot; the four y-rotations of
// each are tried too, so the same list serves every slot.
const CORNER_INSERTS = [
  "R U R'", "R U' R'", "R U2 R'",
  "F' U' F", "F' U F", "F' U2 F",
  "R U' R' U R U' R'", "F' U F U' F' U F",
  "R U2 R' U' R U R'", "F' U2 F U F' U' F",
  "R U R' U' R U R' U' R U R'",
];

// Lifting a piece out of a slot it does not belong in. The short sequences work
// whenever the slot's own corner is not yet locked; the long ones are the
// standard middle-layer insertions, run "backwards" to eject an edge.
const EXTRACTS = [
  "R U R'", "R U' R'", "R U2 R'", "F' U' F", "F' U F", "F' U2 F",
];
const EDGE_INSERTS = ["U R U' R' U' F' U F", "U' F' U F U R U' R'"];

const allRotations = (algs: readonly string[]): string[] =>
  algs.flatMap((a) => [0, 1, 2, 3].map((k) => remapY(a, k)));

const CORNER_INSERT_CANDIDATES = allRotations(CORNER_INSERTS);
const CORNER_EXTRACT_CANDIDATES = allRotations(EXTRACTS);
const EDGE_INSERT_CANDIDATES = allRotations(EDGE_INSERTS);
const EDGE_EXTRACT_CANDIDATES = allRotations([...EXTRACTS, ...EDGE_INSERTS]);

// Real F2L: join the corner and its edge in one go. Only face-turn algorithms
// survive the filter, because `remapY` rotates faces by letter and would
// silently mistranslate a rotation or wide move.
const isFaceTurnAlg = (alg: string) =>
  alg.trim().split(/\s+/).every((t) => /^[UDLRFB](2|')?$/.test(t));

let pairCandidates: string[] | null = null;
function f2lPairCandidates(): string[] {
  pairCandidates ??= allRotations([
    ...new Set(f2lAlgorithms.flatMap((e) => [e.alg, ...e.alts]).filter(isFaceTurnAlg)),
  ]);
  return pairCandidates;
}

/** Where a given corner/edge piece currently sits. */
const cornerSlotOf = (f: Facelets, piece: number) => toCubiesStrict(f).cp.indexOf(piece);
const edgeSlotOf = (f: Facelets, piece: number) => toCubiesStrict(f).ep.indexOf(piece);

/**
 * F2L: solve each corner together with its middle-layer edge.
 *
 * Both pieces are first lifted into the top layer, then a single pair algorithm
 * seats them at once. Where no pair algorithm fits, the corner and the edge are
 * placed one after the other — the same guaranteed route the layer-by-layer
 * solver uses — so a gap in the pair list costs turns, never a solve.
 */
function solveF2L(start: Facelets): { moves: string[]; state: Facelets } {
  let f = start;
  const moves: string[] = [];
  const locked = [...CROSS_FACELETS];
  const apply = (seq: string[]) => {
    moves.push(...seq);
    f = applyAlg(f, seq);
  };

  for (let i = 0; i < 4; i++) {
    const corner = D_CORNERS[i];
    const edge = MIDDLE_EDGES[i];
    const cornerTarget = [...CORNER_FACELETS[corner]];
    const edgeTarget = [...EDGE_FACELETS[edge]];
    const keep = [...locked];

    const cornerPlaced = (s: Facelets) => matches(s, keep) && matches(s, cornerTarget);
    const pairPlaced = (s: Facelets) => cornerPlaced(s) && matches(s, edgeTarget);

    // Best case: one pair algorithm seats both pieces from where they stand.
    if (!pairPlaced(f)) {
      const direct = bestCandidate(f, f2lPairCandidates(), pairPlaced);
      if (direct) apply(direct);
    }

    // Otherwise lift both pieces clear of the bottom two layers and try again.
    for (let pass = 0; pass < 3; pass++) {
      if (pairPlaced(f)) break;
      const cornerAt = cornerSlotOf(f, corner);
      if (cornerAt >= 4) {
        const up = (s: Facelets) => matches(s, keep) && cornerSlotOf(s, corner) < 4;
        const lift =
          bestCandidate(f, CORNER_EXTRACT_CANDIDATES, up) ??
          searchSubgoal(f, slotFaces('corner', cornerAt), up, 6);
        if (lift) apply(lift);
      }
      const edgeAt = edgeSlotOf(f, edge);
      if (edgeAt >= 8) {
        const up = (s: Facelets) => matches(s, keep) && edgeSlotOf(s, edge) < 4;
        const lift =
          bestCandidate(f, EDGE_EXTRACT_CANDIDATES, up) ??
          searchSubgoal(f, slotFaces('edge', edgeAt), up, 8);
        if (lift) apply(lift);
      }
      if (cornerSlotOf(f, corner) < 4 && edgeSlotOf(f, edge) < 4) break;
    }

    // One algorithm for the whole pair, when one fits. With both pieces in the
    // top layer the pair is always within a few turns of its slot, so a short
    // search covers the cases the database doesn't list.
    if (!pairPlaced(f) && cornerSlotOf(f, corner) < 4 && edgeSlotOf(f, edge) < 4) {
      const pair =
        bestCandidate(f, f2lPairCandidates(), pairPlaced) ??
        searchPlacement(f, slotFaces('corner', corner), [...keep, ...cornerTarget, ...edgeTarget], 7);
      if (pair) apply(pair);
    }

    // Otherwise: corner first, then its edge.
    if (!pairPlaced(f)) {
      for (let pass = 0; pass < 3 && !cornerPlaced(f); pass++) {
        const at = cornerSlotOf(f, corner);
        if (at >= 4) {
          const up = (s: Facelets) => matches(s, keep) && cornerSlotOf(s, corner) < 4;
          const lift =
            bestCandidate(f, CORNER_EXTRACT_CANDIDATES, up) ??
            searchSubgoal(f, slotFaces('corner', at), up, 6);
          if (!lift) break;
          apply(lift);
        }
        const insert =
          bestCandidate(f, CORNER_INSERT_CANDIDATES, cornerPlaced) ??
          searchPlacement(f, slotFaces('corner', corner), [...keep, ...cornerTarget], 8);
        if (!insert) break;
        apply(insert);
      }

      for (let pass = 0; pass < 3 && !pairPlaced(f); pass++) {
        const at = edgeSlotOf(f, edge);
        if (at >= 8) {
          const up = (s: Facelets) => cornerPlaced(s) && edgeSlotOf(s, edge) < 4;
          const lift =
            bestCandidate(f, EDGE_EXTRACT_CANDIDATES, up) ??
            searchSubgoal(f, slotFaces('edge', at), up, 8);
          if (!lift) break;
          apply(lift);
        }
        const insert =
          bestCandidate(f, EDGE_INSERT_CANDIDATES, pairPlaced) ??
          searchPlacement(f, slotFaces('edge', edge), [...keep, ...cornerTarget, ...edgeTarget], 9);
        if (!insert) break;
        apply(insert);
      }
    }

    if (!pairPlaced(f)) throw new Error(`Could not solve the ${['front-right', 'front-left', 'back-left', 'back-right'][i]} slot`);
    locked.push(...cornerTarget, ...edgeTarget);
  }

  return { moves, state: f };
}

function solveFirstLayerCorners(start: Facelets): { moves: string[]; state: Facelets } {
  let f = start;
  const moves: string[] = [];
  const locked = [...CROSS_FACELETS];

  for (const piece of D_CORNERS) {
    const target = [...CORNER_FACELETS[piece]];
    const keep = [...locked];
    const placed = (s: Facelets) => matches(s, keep) && matches(s, target);

    // Guarded: each pass either finishes the corner or lifts it into the top
    // layer, so two passes always suffice — the third is pure insurance.
    for (let pass = 0; pass < 3 && !placed(f); pass++) {
      const at = cornerSlotOf(f, piece);
      if (at >= 4) {
        const inTopLayer = (s: Facelets) => matches(s, keep) && cornerSlotOf(s, piece) < 4;
        const lift =
          bestCandidate(f, CORNER_EXTRACT_CANDIDATES, inTopLayer) ??
          searchSubgoal(f, slotFaces('corner', at), inTopLayer, 6);
        if (!lift) break;
        moves.push(...lift);
        f = applyAlg(f, lift);
      }
      const insert =
        bestCandidate(f, CORNER_INSERT_CANDIDATES, placed) ??
        searchSubgoal(f, slotFaces('corner', piece), placed, 8);
      if (!insert) break;
      moves.push(...insert);
      f = applyAlg(f, insert);
    }

    if (!placed(f)) throw new Error(`Could not place the ${['DFR', 'DLF', 'DBL', 'DRB'][piece - 4]} corner`);
    locked.push(...target);
  }

  return { moves, state: f };
}

function solveMiddleLayer(start: Facelets): { moves: string[]; state: Facelets } {
  let f = start;
  const moves: string[] = [];
  const locked = [...CROSS_FACELETS, ...D_CORNERS.flatMap((c) => [...CORNER_FACELETS[c]])];

  for (const piece of MIDDLE_EDGES) {
    const target = [...EDGE_FACELETS[piece]];
    const keep = [...locked];
    const placed = (s: Facelets) => matches(s, keep) && matches(s, target);

    for (let pass = 0; pass < 3 && !placed(f); pass++) {
      const at = edgeSlotOf(f, piece);
      if (at >= 8) {
        const inTopLayer = (s: Facelets) => matches(s, keep) && edgeSlotOf(s, piece) < 4;
        const lift =
          bestCandidate(f, EDGE_EXTRACT_CANDIDATES, inTopLayer) ??
          searchSubgoal(f, slotFaces('edge', at), inTopLayer, 8);
        if (!lift) break;
        moves.push(...lift);
        f = applyAlg(f, lift);
      }
      const insert =
        bestCandidate(f, EDGE_INSERT_CANDIDATES, placed) ??
        searchSubgoal(f, slotFaces('edge', piece), placed, 9);
      if (!insert) break;
      moves.push(...insert);
      f = applyAlg(f, insert);
    }

    if (!placed(f)) throw new Error(`Could not place the ${['FR', 'FL', 'BL', 'BR'][piece - 8]} edge`);
    locked.push(...target);
  }

  return { moves, state: f };
}

/**
 * Solve the bottom two layers, preferring paired F2L insertions and dropping to
 * the strict layer-by-layer route (all four corners, then all four edges) if the
 * pairing route can't finish a slot.
 */
function solveTwoLayers(start: Facelets): { moves: string[]; state: Facelets } {
  try {
    return solveF2L(start);
  } catch {
    const corners = solveFirstLayerCorners(start);
    const middle = solveMiddleLayer(corners.state);
    return { moves: [...corners.moves, ...middle.moves], state: middle.state };
  }
}

// ── Last layer, from this site's own algorithm database ─────────────────────

interface LastLayerCandidate {
  id: string;
  name: string;
  tokens: string[];
  /** Lower is friendlier: short, face-turn-only algorithms win. */
  score: number;
}

/** Extra face-turn-only routes for the cases whose database entry is M-slice. */
const FACE_TURN_ALTERNATIVES: Record<string, string[]> = {
  'pll-ua': ["R U' R U R U R U' R' U' R2"],
  'pll-ub': ["R2 U R U R' U' R' U' R' U R'"],
  'pll-h': ["R2 U2 R U2 R2 U2 R2 U2 R U2 R2"],
  'pll-z': ["R U R' U R' U' R2 U' R' U R' U R U' R U'"],
};

function buildCandidates(list: Algorithm[]): LastLayerCandidate[] {
  const out: LastLayerCandidate[] = [];
  for (const entry of list) {
    const variants = [entry.alg, ...entry.alts, ...(FACE_TURN_ALTERNATIVES[entry.id] ?? [])];
    for (const variant of variants) {
      if (!variant || !isParsable(variant)) continue;
      const tokens = tokenize(variant);
      const hasRotation = tokens.some((t) => /^[xyz]/.test(t));
      const hasWideOrSlice = tokens.some((t) => /^[MESudlrfb]/.test(t));
      out.push({
        id: entry.id,
        name: entry.name,
        tokens,
        score: tokens.length + (hasWideOrSlice ? 3 : 0) + (hasRotation ? 12 : 0),
      });
    }
  }
  return out.sort((a, b) => a.score - b.score);
}

let ollCandidates: LastLayerCandidate[] | null = null;
let pllCandidates: LastLayerCandidate[] | null = null;

const f2lIntact = (f: Facelets) => {
  for (let i = 27; i < 36; i++) if (f[i] !== 'D') return false;
  for (const face of [1, 2, 4, 5]) {
    for (let i = 3; i < 9; i++) if (f[face * 9 + i] !== SOLVED[face * 9 + i]) return false;
  }
  return true;
};

const topFaceOriented = (f: Facelets) => {
  for (let i = 0; i < 9; i++) if (f[i] !== 'U') return false;
  return true;
};

interface LastLayerResult {
  moves: string[];
  state: Facelets;
  algId?: string;
  algName?: string;
}

/**
 * Find the single database algorithm (plus the alignment turns around it) that
 * takes the last layer to `goal`. A complete case set guarantees a hit; the
 * two-algorithm pass below it only exists so an unexpected state still solves.
 */
function solveLastLayerStep(
  f: Facelets,
  candidates: LastLayerCandidate[],
  goal: (s: Facelets) => boolean,
  postAlign: boolean,
): LastLayerResult {
  for (const post of postAlign ? AUFS : ['']) {
    if (goal(applyAlg(f, post))) {
      const moves = post ? [post] : [];
      return { moves, state: applyAlg(f, moves) };
    }
  }

  for (const cand of candidates) {
    for (const pre of AUFS) {
      const head = pre ? [pre, ...cand.tokens] : [...cand.tokens];
      const mid = applyAlg(f, head);
      for (const post of postAlign ? AUFS : ['']) {
        const moves = post ? [...head, post] : head;
        const state = post ? applyMove(mid, post) : mid;
        if (goal(state)) return { moves, state, algId: cand.id, algName: cand.name };
      }
    }
  }

  // Insurance: two algorithms back to back.
  for (const first of candidates) {
    for (const pre of AUFS) {
      const head = pre ? [pre, ...first.tokens] : [...first.tokens];
      const mid = applyAlg(f, head);
      for (const second of candidates) {
        for (const pre2 of AUFS) {
          const tail = pre2 ? [pre2, ...second.tokens] : [...second.tokens];
          const after = applyAlg(mid, tail);
          for (const post of postAlign ? AUFS : ['']) {
            const moves = post ? [...head, ...tail, post] : [...head, ...tail];
            const state = post ? applyMove(after, post) : after;
            if (goal(state)) return { moves, state, algId: second.id, algName: second.name };
          }
        }
      }
    }
  }

  throw new Error('No last-layer algorithm matched this state');
}

// ── Cancellation ────────────────────────────────────────────────────────────

interface Step {
  move: string;
  stage: number;
}

const OPPOSITE: Record<string, string> = { U: 'D', D: 'U', L: 'R', R: 'L', F: 'B', B: 'F' };

const quartersOf = (token: string) => parseMove(token)!.quarters;
const baseOf = (token: string) => parseMove(token)!.base;
const printMove = (base: string, quarters: number) =>
  base + (quarters === 1 ? '' : quarters === 2 ? '2' : "'");

/**
 * Collapse the redundancy that appears where two algorithms meet — `U U'`,
 * `R R2`, and the same face either side of its opposite.
 *
 * Cancelling across a stage boundary is restricted to U turns. Every stage
 * milestone here (a finished cross, a finished bottom two layers, a yellow top)
 * is unchanged by turning the top layer, so a U absorbed from the next stage
 * cannot invalidate the claim the step list makes about the previous one —
 * whereas letting an `R'` disappear into the next stage's `R` genuinely would.
 */
function cancel(steps: Step[]): Step[] {
  const out = steps.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i];
      const base = baseOf(a.move);
      if (!FACE_TURNS.includes(base)) continue;

      // Same face, adjacent — or separated only by the opposite face, which
      // commutes with it.
      let j = -1;
      if (baseOf(out[i + 1].move) === base) j = i + 1;
      else if (
        i + 2 < out.length &&
        baseOf(out[i + 1].move) === OPPOSITE[base] &&
        baseOf(out[i + 2].move) === base
      ) j = i + 2;
      if (j < 0) continue;
      if (out[j].stage !== a.stage && base !== 'U') continue;

      const total = (quartersOf(a.move) + quartersOf(out[j].move)) % 4;
      out.splice(j, 1);
      if (total === 0) out.splice(i, 1);
      else out[i] = { move: printMove(base, total), stage: a.stage };
      changed = true;
      break;
    }
  }
  return out;
}

// ── Entry point ─────────────────────────────────────────────────────────────

/**
 * Solve a validated cube state. The caller is expected to have run
 * `validateFacelets` first; an unsolvable state throws.
 */
export function solveCube(facelets: Facelets): Solution {
  ollCandidates ??= buildCandidates(ollAlgorithms);
  pllCandidates ??= buildCandidates(pllAlgorithms);

  const steps: Step[] = [];
  const push = (moves: string[], stage: number) => {
    for (const move of moves) steps.push({ move, stage });
  };

  let f = facelets;
  const stageKeys: StageKey[] = ['cross', 'f2l', 'oll', 'pll'];
  const stageAlgs: { id?: string; name?: string }[] = stageKeys.map(() => ({}));

  const cross = solveCross(f);
  push(cross, 0);
  f = applyAlg(f, cross);

  const f2l = solveTwoLayers(f);
  push(f2l.moves, 1);
  f = f2l.state;

  const oll = solveLastLayerStep(f, ollCandidates, (s) => topFaceOriented(s) && f2lIntact(s), false);
  push(oll.moves, 2);
  f = oll.state;
  stageAlgs[2] = { id: oll.algId, name: oll.algName };

  const pll = solveLastLayerStep(f, pllCandidates, (s) => s === SOLVED, true);
  push(pll.moves, 3);
  f = pll.state;
  stageAlgs[3] = { id: pll.algId, name: pll.algName };

  /* c8 ignore next */
  if (f !== SOLVED) throw new Error('Solver finished on an unsolved cube');

  const finalSteps = cancel(steps);
  const moves = finalSteps.map((s) => s.move);

  // Stages stay contiguous and in order through cancellation, so their offsets
  // are just a running total — and a skipped stage points at the moment it was
  // skipped rather than at the end of the solution.
  let cursor = 0;
  const stages: SolutionStage[] = stageKeys.map((key, index) => {
    const stageMoves = finalSteps.filter((s) => s.stage === index).map((s) => s.move);
    const start = cursor;
    cursor += stageMoves.length;
    return {
      key,
      ...STAGE_META[key],
      moves: stageMoves,
      start,
      algId: stageAlgs[index].id,
      algName: stageAlgs[index].name,
    };
  });

  const states: Facelets[] = [facelets];
  let running = facelets;
  for (const move of moves) {
    running = applyMove(running, move);
    states.push(running);
  }

  return {
    moves,
    stages,
    states,
    turnCount: countTurns(moves),
  };
}
