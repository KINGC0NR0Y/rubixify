// ─────────────────────────────────────────────────────────────────────────────
// 3×3 cube model — facelet state, move engine, cubie extraction and validation.
//
// Everything here is derived from geometry rather than hand-typed permutation
// tables: each of the 54 facelets knows its 3-D position and outward normal, and
// a move is "rotate every facelet whose position lies in these layers". That
// makes face turns, slice moves, wide moves and whole-cube rotations fall out of
// one definition, and removes the usual transcription-error surface.
//
// Facelet order is the standard Kociemba layout — the same one the existing
// `cfopStates.test.ts` suite reads out of sr-visualizer:
//   U 0–8, R 9–17, F 18–26, D 27–35, L 36–44, B 45–53
// each face row-major as seen in the unfolded net.
//
// DOM-free and dependency-free so the Node test runner can import it directly.
// ─────────────────────────────────────────────────────────────────────────────

export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export const FACES: readonly FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B'] as const;

/** A cube state: 54 characters, one per facelet, naming the face it belongs to. */
export type Facelets = string;

export const SOLVED: Facelets = FACES.map((f) => f.repeat(9)).join('');

/** Index of the centre facelet of each face, in `FACES` order. */
export const CENTER_INDEX: readonly number[] = [4, 13, 22, 31, 40, 49];

// ── Geometry ────────────────────────────────────────────────────────────────

type Vec = readonly [number, number, number];

/**
 * Position + outward normal of every facelet. Row/column conventions follow the
 * unfolded net: U's rows run back→front, D's rows run front→back, and each side
 * face reads top→bottom / left→right as seen from outside that face.
 */
function buildGeometry(): { pos: Vec; normal: Vec }[] {
  const g: { pos: Vec; normal: Vec }[] = [];
  const push = (pos: Vec, normal: Vec) => g.push({ pos, normal });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([c - 1, 1, r - 1], [0, 1, 0]);   // U
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([1, 1 - r, 1 - c], [1, 0, 0]);   // R
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([c - 1, 1 - r, 1], [0, 0, 1]);   // F
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([c - 1, -1, 1 - r], [0, -1, 0]); // D
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([-1, 1 - r, c - 1], [-1, 0, 0]); // L
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push([1 - c, 1 - r, -1], [0, 0, -1]); // B
  return g;
}

export const GEOMETRY = buildGeometry();

// Positive-sense quarter turns about each axis. "Positive" is the direction a
// clockwise turn of the face on that axis's + side sends stickers, i.e. rotX is
// the R direction, rotY the U direction and rotZ the F direction.
const rotX = (v: Vec): Vec => [v[0], v[2], -v[1]];
const rotY = (v: Vec): Vec => [-v[2], v[1], v[0]];
const rotZ = (v: Vec): Vec => [v[1], -v[0], v[2]];
const ROT = { x: rotX, y: rotY, z: rotZ } as const;

export type Axis = 'x' | 'y' | 'z';

export interface MoveSpec {
  axis: Axis;
  /** Which slices along `axis` the move turns (coordinate values −1, 0, 1). */
  layers: number[];
  /** How many positive-sense quarter turns one "clockwise" turn of this move is. */
  times: 1 | 3;
}

/**
 * Every base move token the notation supports. Lowercase letters are the usual
 * wide-move shorthand (`r` = `Rw`), and slice directions follow convention:
 * M follows L, E follows D, S follows F.
 */
export const MOVE_SPECS: Record<string, MoveSpec> = {
  R: { axis: 'x', layers: [1], times: 1 },
  L: { axis: 'x', layers: [-1], times: 3 },
  M: { axis: 'x', layers: [0], times: 3 },
  U: { axis: 'y', layers: [1], times: 1 },
  D: { axis: 'y', layers: [-1], times: 3 },
  E: { axis: 'y', layers: [0], times: 3 },
  F: { axis: 'z', layers: [1], times: 1 },
  B: { axis: 'z', layers: [-1], times: 3 },
  S: { axis: 'z', layers: [0], times: 1 },
  x: { axis: 'x', layers: [-1, 0, 1], times: 1 },
  y: { axis: 'y', layers: [-1, 0, 1], times: 1 },
  z: { axis: 'z', layers: [-1, 0, 1], times: 1 },
  r: { axis: 'x', layers: [0, 1], times: 1 },
  l: { axis: 'x', layers: [-1, 0], times: 3 },
  u: { axis: 'y', layers: [0, 1], times: 1 },
  d: { axis: 'y', layers: [-1, 0], times: 3 },
  f: { axis: 'z', layers: [0, 1], times: 1 },
  b: { axis: 'z', layers: [-1, 0], times: 3 },
};

const keyOf = (pos: Vec, normal: Vec) =>
  `${pos[0]},${pos[1]},${pos[2]}|${normal[0]},${normal[1]},${normal[2]}`;

const INDEX_BY_KEY = new Map<string, number>(GEOMETRY.map((g, i) => [keyOf(g.pos, g.normal), i]));

/** `perm[i] = j` — the sticker at facelet `i` ends up at facelet `j`. */
function buildPerm(spec: MoveSpec, quarters: number): number[] {
  const rot = ROT[spec.axis];
  const axisIdx = spec.axis === 'x' ? 0 : spec.axis === 'y' ? 1 : 2;
  const turns = (spec.times * quarters) % 4;
  const perm = new Array<number>(54);
  for (let i = 0; i < 54; i++) {
    let pos = GEOMETRY[i].pos;
    let normal = GEOMETRY[i].normal;
    if (spec.layers.includes(pos[axisIdx])) {
      for (let t = 0; t < turns; t++) {
        pos = rot(pos);
        normal = rot(normal);
      }
    }
    perm[i] = INDEX_BY_KEY.get(keyOf(pos, normal))!;
  }
  return perm;
}

// Every (base move, 1–3 quarter turns) permutation, precomputed once.
const PERMS = new Map<string, number[]>();
for (const [name, spec] of Object.entries(MOVE_SPECS)) {
  for (let q = 1; q <= 3; q++) PERMS.set(`${name}${q}`, buildPerm(spec, q));
}

// ── Notation ────────────────────────────────────────────────────────────────

/** A parsed move: base token plus a quarter-turn count of 1, 2 or 3. */
export interface ParsedMove {
  base: string;
  quarters: 1 | 2 | 3;
  /** The token re-printed in canonical form, e.g. `R`, `R2`, `R'`. */
  token: string;
}

const MOVE_TOKEN = /^([UDLRFBMESxyzudlrfb])(w?)(2'|'2|2|')?$/;

export function parseMove(token: string): ParsedMove | null {
  const m = MOVE_TOKEN.exec(token);
  if (!m) return null;
  let base = m[1];
  // `Rw` and `r` mean the same thing; normalise to the lowercase form.
  if (m[2] === 'w') {
    if (!/^[UDLRFB]$/.test(base)) return null;
    base = base.toLowerCase();
  }
  const suffix = m[3];
  const quarters: 1 | 2 | 3 = !suffix ? 1 : suffix === "'" ? 3 : 2;
  return { base, quarters, token: base + (quarters === 1 ? '' : quarters === 2 ? '2' : "'") };
}

export function parseAlg(alg: string): ParsedMove[] {
  const out: ParsedMove[] = [];
  for (const tok of alg.trim().split(/\s+/).filter(Boolean)) {
    const move = parseMove(tok);
    if (!move) throw new Error(`Unrecognised move: "${tok}"`);
    out.push(move);
  }
  return out;
}

/** True when every token of `alg` is notation this engine can execute. */
export function isParsable(alg: string): boolean {
  return alg.trim().split(/\s+/).filter(Boolean).every((t) => parseMove(t) !== null);
}

export function invertMove(token: string): string {
  const m = parseMove(token);
  if (!m) return token;
  const q = m.quarters === 2 ? 2 : m.quarters === 1 ? 3 : 1;
  return m.base + (q === 1 ? '' : q === 2 ? '2' : "'");
}

export function invertAlg(alg: string | string[]): string[] {
  const tokens = Array.isArray(alg) ? alg : alg.trim().split(/\s+/).filter(Boolean);
  return tokens.slice().reverse().map(invertMove);
}

/** Split an algorithm string into canonical move tokens. */
export function tokenize(alg: string): string[] {
  return parseAlg(alg).map((m) => m.token);
}

// ── Applying moves ──────────────────────────────────────────────────────────

export function permFor(token: string): number[] {
  const m = parseMove(token);
  if (!m) throw new Error(`Unrecognised move: "${token}"`);
  return PERMS.get(`${m.base}${m.quarters}`)!;
}

export function applyMove(state: Facelets, token: string): Facelets {
  const perm = permFor(token);
  const out = new Array<string>(54);
  for (let i = 0; i < 54; i++) out[perm[i]] = state[i];
  return out.join('');
}

export function applyAlg(state: Facelets, alg: string | string[]): Facelets {
  const tokens = Array.isArray(alg) ? alg : alg.trim().split(/\s+/).filter(Boolean);
  let s = state;
  for (const t of tokens) s = applyMove(s, t);
  return s;
}

/**
 * How a move should be *drawn*: which layers swing, about which axis, and by how
 * many quarter turns.
 *
 * `quarters` is signed in the right-handed sense about the positive axis, so a
 * renderer rotates by `-(π/2) × quarters` — the sign convention three.js uses.
 * A prime move comes back as −1 rather than +3 so it flicks the short way round.
 * Keeping this here (rather than in the renderer) is what lets the test suite
 * check the animation against the facelet permutation it is meant to depict.
 */
export function moveTurn(token: string): { axis: Axis; layers: number[]; quarters: number } | null {
  const move = parseMove(token);
  const spec = move && MOVE_SPECS[move.base];
  if (!move || !spec) return null;
  const quarters = move.quarters === 3 ? -1 : move.quarters;
  return { axis: spec.axis, layers: spec.layers, quarters: spec.times === 1 ? quarters : -quarters };
}

/** Byte-array state, for solver hot loops that can't afford string churn. */
export const toBytes = (s: Facelets): Uint8Array =>
  Uint8Array.from(s, (ch) => FACES.indexOf(ch as FaceLetter));

export const fromBytes = (b: Uint8Array): Facelets =>
  Array.from(b, (v) => FACES[v]).join('');

export function applyPermBytes(state: Uint8Array, perm: number[], out: Uint8Array): Uint8Array {
  for (let i = 0; i < 54; i++) out[perm[i]] = state[i];
  return out;
}

// ── Pieces ──────────────────────────────────────────────────────────────────

/**
 * Facelet indices of each corner, listed clockwise as seen from outside the
 * corner and starting at its U/D facelet, and of each edge starting at its
 * "primary" facelet (U/D where the piece has one, otherwise F/B).
 */
export const CORNER_FACELETS: readonly (readonly [number, number, number])[] = [
  [8, 9, 20],   // URF
  [6, 18, 38],  // UFL
  [0, 36, 47],  // ULB
  [2, 45, 11],  // UBR
  [29, 26, 15], // DFR
  [27, 44, 24], // DLF
  [33, 53, 42], // DBL
  [35, 17, 51], // DRB
] as const;

export const CORNER_COLORS: readonly (readonly [FaceLetter, FaceLetter, FaceLetter])[] = [
  ['U', 'R', 'F'], ['U', 'F', 'L'], ['U', 'L', 'B'], ['U', 'B', 'R'],
  ['D', 'F', 'R'], ['D', 'L', 'F'], ['D', 'B', 'L'], ['D', 'R', 'B'],
] as const;

export const CORNER_NAMES = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'] as const;

export const EDGE_FACELETS: readonly (readonly [number, number])[] = [
  [5, 10],  // UR
  [7, 19],  // UF
  [3, 37],  // UL
  [1, 46],  // UB
  [32, 16], // DR
  [28, 25], // DF
  [30, 43], // DL
  [34, 52], // DB
  [23, 12], // FR
  [21, 41], // FL
  [50, 39], // BL
  [48, 14], // BR
] as const;

export const EDGE_COLORS: readonly (readonly [FaceLetter, FaceLetter])[] = [
  ['U', 'R'], ['U', 'F'], ['U', 'L'], ['U', 'B'],
  ['D', 'R'], ['D', 'F'], ['D', 'L'], ['D', 'B'],
  ['F', 'R'], ['F', 'L'], ['B', 'L'], ['B', 'R'],
] as const;

export const EDGE_NAMES = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'] as const;

export interface CubieState {
  /** `cp[i]` — which corner piece currently sits in corner slot `i`. */
  cp: number[];
  /** `co[i]` — its twist: 0 solved, 1 clockwise, 2 anticlockwise. */
  co: number[];
  ep: number[];
  eo: number[];
}

/**
 * Read the piece-level state out of a facelet string. Slots holding colours that
 * form no real cubie come back as `null` — `validateFacelets` turns those into
 * user-facing messages, so this stays a pure reader.
 */
export function toCubies(f: Facelets): {
  cp: (number | null)[]; co: (number | null)[]; ep: (number | null)[]; eo: (number | null)[];
} {
  const cp: (number | null)[] = [], co: (number | null)[] = [];
  const ep: (number | null)[] = [], eo: (number | null)[] = [];

  // A corner always carries exactly one U or D sticker; which of the slot's
  // three facelets holds it *is* the twist.
  for (let i = 0; i < 8; i++) {
    const slot = CORNER_FACELETS[i];
    let ori = -1;
    for (let o = 0; o < 3; o++) if (f[slot[o]] === 'U' || f[slot[o]] === 'D') { ori = o; break; }
    if (ori < 0) { cp.push(null); co.push(null); continue; }
    const triple = [f[slot[ori]], f[slot[(ori + 1) % 3]], f[slot[(ori + 2) % 3]]];
    const piece = CORNER_COLORS.findIndex(
      (ref) => ref[0] === triple[0] && ref[1] === triple[1] && ref[2] === triple[2],
    );
    cp.push(piece < 0 ? null : piece);
    co.push(piece < 0 ? null : ori);
  }

  // An edge is flipped (eo = 1) exactly when its primary colour — U/D, or F/B
  // for the four middle-slice edges — sits on the slot's secondary facelet.
  for (let i = 0; i < 12; i++) {
    const [a, b] = EDGE_FACELETS[i].map((idx) => f[idx]);
    const straight = EDGE_COLORS.findIndex((ref) => ref[0] === a && ref[1] === b);
    const flipped = straight >= 0 ? -1 : EDGE_COLORS.findIndex((ref) => ref[0] === b && ref[1] === a);
    const piece = straight >= 0 ? straight : flipped;
    ep.push(piece < 0 ? null : piece);
    eo.push(piece < 0 ? null : straight >= 0 ? 0 : 1);
  }

  return { cp, co, ep, eo };
}

/** Piece state of a cube already known to be valid. */
export function toCubiesStrict(f: Facelets): CubieState {
  const c = toCubies(f);
  if (c.cp.some((v) => v === null) || c.ep.some((v) => v === null)) {
    throw new Error('Cube state is not physically valid');
  }
  return { cp: c.cp as number[], co: c.co as number[], ep: c.ep as number[], eo: c.eo as number[] };
}

export function permutationParity(p: number[]): number {
  let swaps = 0;
  const a = p.slice();
  for (let i = 0; i < a.length; i++) {
    while (a[i] !== i) {
      const j = a[i];
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
      swaps++;
    }
  }
  return swaps % 2;
}

// ── Validation ──────────────────────────────────────────────────────────────

export type ValidationCode =
  | 'incomplete' | 'counts' | 'centres' | 'corner-piece' | 'edge-piece'
  | 'corner-duplicate' | 'edge-duplicate' | 'corner-twist' | 'edge-flip' | 'parity';

export interface ValidationIssue {
  code: ValidationCode;
  /** Plain-language explanation of what to change on the physical cube. */
  message: string;
  /** Facelet indices worth highlighting in the net, when the issue is local. */
  facelets?: number[];
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  /** How many stickers of each face colour are currently entered. */
  counts: Record<FaceLetter, number>;
}

const SIDE_WORD: Record<FaceLetter, string> = {
  U: 'Up', D: 'Down', F: 'Front', B: 'Back', L: 'Left', R: 'Right',
};

/** Human-readable name of a slot, e.g. `URF` → "Up-Right-Front". */
const slotWords = (name: string) => name.split('').map((c) => SIDE_WORD[c as FaceLetter]).join('-');

const DEFAULT_COLOR_NAMES: Record<FaceLetter, string> = {
  U: 'Up', R: 'Right', F: 'Front', D: 'Down', L: 'Left', B: 'Back',
};

/**
 * Check that 54 entered stickers describe a cube that can actually exist, and
 * explain any problem in terms of what to re-check on the physical puzzle.
 *
 * Checks run cheapest-first and return at the first class of problem, so a
 * half-finished cube reports "keep going" rather than a wall of consequences.
 */
export function validateFacelets(
  f: string,
  /** How each face colour is named in the UI, for readable messages. */
  colorNames: Record<FaceLetter, string> = DEFAULT_COLOR_NAMES,
): ValidationResult {
  const counts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 } as Record<FaceLetter, number>;
  const issues: ValidationIssue[] = [];
  const name = (c: FaceLetter) => colorNames[c];

  const missing: number[] = [];
  for (let i = 0; i < 54; i++) {
    const ch = f[i] as FaceLetter;
    if (FACES.includes(ch)) counts[ch]++;
    else missing.push(i);
  }

  if (f.length !== 54 || missing.length > 0) {
    issues.push({
      code: 'incomplete',
      message:
        missing.length === 1
          ? 'One sticker is still blank — pick a colour and click it to finish the cube.'
          : `${missing.length} stickers are still blank. Pick a colour, then click each empty square.`,
      facelets: missing,
    });
    return { ok: false, issues, counts };
  }

  const wrongCounts = FACES.filter((c) => counts[c] !== 9);
  if (wrongCounts.length > 0) {
    for (const c of wrongCounts) {
      const n = counts[c];
      issues.push({
        code: 'counts',
        message: `${name(c)} appears ${n} time${n === 1 ? '' : 's'} — every colour needs exactly 9. ${
          n > 9
            ? `Change ${n - 9} of them to another colour.`
            : `${9 - n} more sticker${9 - n === 1 ? '' : 's'} should be ${name(c).toLowerCase()}.`
        }`,
      });
    }
    return { ok: false, issues, counts };
  }

  const badCentres = CENTER_INDEX.filter((idx, i) => f[idx] !== FACES[i]);
  if (badCentres.length > 0) {
    issues.push({
      code: 'centres',
      message:
        'The centre stickers define the six faces and can never move on a real cube. Reset the cube and re-enter it leaving the centres alone.',
      facelets: [...badCentres],
    });
    return { ok: false, issues, counts };
  }

  const { cp, co, ep, eo } = toCubies(f);

  for (let i = 0; i < 8; i++) {
    if (cp[i] !== null) continue;
    const colors = CORNER_FACELETS[i].map((idx) => name(f[idx] as FaceLetter));
    issues.push({
      code: 'corner-piece',
      message: `The ${slotWords(CORNER_NAMES[i])} corner reads ${colors.join(' / ')}, which is not a real corner. Re-check those three stickers — no corner repeats a colour or pairs two opposite colours.`,
      facelets: [...CORNER_FACELETS[i]],
    });
  }
  for (let i = 0; i < 12; i++) {
    if (ep[i] !== null) continue;
    const colors = EDGE_FACELETS[i].map((idx) => name(f[idx] as FaceLetter));
    issues.push({
      code: 'edge-piece',
      message: `The ${slotWords(EDGE_NAMES[i])} edge reads ${colors.join(' / ')}, which is not a real edge. Re-check those two stickers — no edge repeats a colour or pairs two opposite colours.`,
      facelets: [...EDGE_FACELETS[i]],
    });
  }
  if (issues.length > 0) return { ok: false, issues, counts };

  const cpv = cp as number[], cov = co as number[], epv = ep as number[], eov = eo as number[];

  const cornerSlots = new Map<number, number[]>();
  cpv.forEach((piece, slot) => cornerSlots.set(piece, [...(cornerSlots.get(piece) ?? []), slot]));
  for (const [piece, slots] of cornerSlots) {
    if (slots.length < 2) continue;
    issues.push({
      code: 'corner-duplicate',
      message: `The ${CORNER_COLORS[piece].map(name).join('/')} corner appears twice — at ${slots
        .map((s) => slotWords(CORNER_NAMES[s]))
        .join(' and ')}. A cube has each of its 8 corners exactly once, so one of those is misread.`,
      facelets: slots.flatMap((s) => [...CORNER_FACELETS[s]]),
    });
  }
  const edgeSlots = new Map<number, number[]>();
  epv.forEach((piece, slot) => edgeSlots.set(piece, [...(edgeSlots.get(piece) ?? []), slot]));
  for (const [piece, slots] of edgeSlots) {
    if (slots.length < 2) continue;
    issues.push({
      code: 'edge-duplicate',
      message: `The ${EDGE_COLORS[piece].map(name).join('/')} edge appears twice — at ${slots
        .map((s) => slotWords(EDGE_NAMES[s]))
        .join(' and ')}. A cube has each of its 12 edges exactly once, so one of those is misread.`,
      facelets: slots.flatMap((s) => [...EDGE_FACELETS[s]]),
    });
  }
  if (issues.length > 0) return { ok: false, issues, counts };

  const twist = cov.reduce((a, b) => a + b, 0) % 3;
  if (twist !== 0) {
    issues.push({
      code: 'corner-twist',
      message: `The corner twists don't add up: taken together your corners are rotated ${
        twist === 1 ? 'a third' : 'two thirds'
      } of a turn out. Look for a corner whose three colours are right but read round in the wrong order, and step its colours ${
        twist === 1 ? 'anticlockwise' : 'clockwise'
      } by one.`,
    });
  }

  const flip = eov.reduce((a, b) => a + b, 0) % 2;
  if (flip !== 0) {
    issues.push({
      code: 'edge-flip',
      message:
        'One edge is flipped the wrong way round. Find an edge whose two colours are correct but swapped over, and swap those two stickers back.',
    });
  }

  if (permutationParity(cpv) !== permutationParity(epv)) {
    issues.push({
      code: 'parity',
      message:
        'Exactly two pieces are swapped with each other, which no sequence of turns can produce. Two of your edges (or two corners) most likely have their colours entered in the wrong squares.',
    });
  }

  return { ok: issues.length === 0, issues, counts };
}
