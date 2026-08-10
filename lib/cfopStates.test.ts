// ─────────────────────────────────────────────────────────────────────────────
// CFOP recognition-STATE validation.
//
// Unlike cfop.test.ts (which checks the data/utility layer), this suite renders
// every F2L/OLL/PLL case through sr-visualizer's OWN pure simulation — the exact
// engine that produces the images — and asserts the resulting cube state is a
// correct recognition state for its case:
//
//   • orientation consistency: all six centres return home (no net rotation),
//   • the solved parts really are solved (F2L intact / cross intact),
//   • OLL: last layer is mis-oriented (a real OLL, not already solved),
//   • PLL: last layer is fully oriented (only permutation differs),
//   • every OLL matches a validated 57-case orientation basis (catches
//     swapped / mislabelled / similar-looking cases),
//   • every PLL matches a validated 21-case permutation basis up to AUF
//     (catches mirror mislabels like Ua/Ub, Ja/Jb, Gc/Gd).
//
// Run with: npm test   (node --test, Node strips the TypeScript)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { ollAlgorithms, pllAlgorithms, f2lAlgorithms, getVizAlg } from './algorithms.ts';

// sr-visualizer ships as CommonJS; load its pure sticker engine directly.
const require = createRequire(import.meta.url);
const { makeStickerColors } = require('sr-visualizer/dist/lib/cube/stickers.js');

const LETTER = ['U', 'R', 'F', 'D', 'L', 'B'];

/** The 54 facelets sr-visualizer would render, labelled by originating face. */
function facelets(opts: { caseAlg?: string; algorithm?: string; stickerColors?: string[] }): string[] {
  return makeStickerColors({
    cubeSize: 3,
    colorScheme: { 0: 'U', 1: 'R', 2: 'F', 3: 'D', 4: 'L', 5: 'B' },
    case: opts.caseAlg,
    algorithm: opts.algorithm,
    stickerColors: opts.stickerColors,
  });
}

const faceSolid = (fl: string[], f: number) => {
  for (let i = 0; i < 9; i++) if (fl[f * 9 + i] !== LETTER[f]) return false;
  return true;
};
const sideLowerRowsSolid = (fl: string[], f: number) => {
  for (let i = 3; i < 9; i++) if (fl[f * 9 + i] !== LETTER[f]) return false;
  return true;
};
const centersHome = (fl: string[]) => [0, 1, 2, 3, 4, 5].every((f) => fl[f * 9 + 4] === LETTER[f]);
const isSolved = (fl: string[]) => [0, 1, 2, 3, 4, 5].every((f) => faceSolid(fl, f));
// Cross = the four D-face EDGE stickers (+ centre); the D corners belong to F2L.
const crossSolid = (fl: string[]) => [1, 3, 5, 7].every((i) => fl[27 + i] === 'D') && fl[31] === 'D';
const f2lIntact = (fl: string[]) =>
  faceSolid(fl, 3) && [1, 2, 4, 5].every((f) => sideLowerRowsSolid(fl, f));

const applyU = (fl: string[]) => facelets({ stickerColors: fl, algorithm: 'U' });
const eq = (a: string[], b: string[]) => a.every((v, i) => v === b[i]);
function equalUpToAUF(a: string[], b: string[]): boolean {
  let cur = a;
  for (let k = 0; k < 4; k++) {
    if (eq(cur, b)) return true;
    cur = applyU(cur);
  }
  return false;
}

// Permutation-independent OLL orientation signature over the 21 last-layer
// facelets (U face + the four side "tabs"), canonicalised over AUF. Verified
// empirically to be invariant under pure permutation and to distinguish all 57.
const LL_STICKERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 36, 37, 38, 45, 46, 47];
function orientationSig(caseAlg: string): string {
  let fl = facelets({ caseAlg });
  let best = '';
  for (let k = 0; k < 4; k++) {
    const s = LL_STICKERS.map((i) => (fl[i] === 'U' ? '1' : '0')).join('');
    if (best === '' || s < best) best = s;
    fl = applyU(fl);
  }
  return best;
}

// Validated canonical bases (each verified to be a valid, mutually-distinct,
// complete set — see the audit that produced them).
const REF_OLL: Record<number, string> = {
  1: "R U2 R2 F R F' U2 R' F R F'", 2: "F R U R' U' F' f R U R' U' f'",
  3: "f R U R' U' f' U' F R U R' U' F'", 4: "f R U R' U' f' U F R U R' U' F'",
  5: "r' U2 R U R' U r", 6: "r U2 R' U' R U' r'", 7: "r U R' U R U2 r'", 8: "r' U' R U' R' U2 r",
  9: "R U R' U' R' F R2 U R' U' F'", 10: "R U R' U R' F R F' R U2 R'",
  11: "r U R' U R' F R F' R U2 r'", 12: "M' R' U' R U' R' U2 R U' M", 13: "r U' r' U' r U r' F' U F",
  14: "R' F R U R' F' R F U' F'", 15: "r' U' r R' U' R U r' U r", 16: "r U r' R U R' U' r U' r'",
  17: "R U R' U R' F R F' U2 R' F R F'", 18: "r U R' U R U2 r2 U' R U' R' U2 r",
  19: "S' R U R' S U' R' F R F'", 20: "r U R' U' M2 U R U' R' U' M'",
  21: "R U2 R' U' R U R' U' R U' R'", 22: "R U2 R2 U' R2 U' R2 U2 R", 23: "R2 D' R U2 R' D R U2 R",
  24: "r U R' U' r' F R F'", 25: "F' r U R' U' r' F R", 26: "R U2 R' U' R U' R'", 27: "R U R' U R U2 R'",
  28: "r U R' U' M U R U' R'", 29: "R U R' U' R U' R' F' U' F R U R'", 30: "F U R U2 R' U' R U2 R' U' F'",
  31: "R' U' F U R U' R' F' R", 32: "R U B' U' R' U R B R'", 33: "R U R' U' R' F R F'",
  34: "R U R2 U' R' F R U R U' F'", 35: "R U2 R2 F R F' R U2 R'", 36: "L' U' L U' L' U L U L F' L' F",
  37: "F R' F' R U R U' R'", 38: "R U R' U R U' R' U' R' F R F'", 39: "L F' L' U' L U F U' L'",
  40: "R' F R U R' U' F' U R", 41: "R U R' U R U2 R' F R U R' U' F'",
  42: "R' U' R U' R' U2 R F R U R' U' F'", 43: "F' U' L' U L F", 44: "F U R U' R' F'", 45: "F R U R' U' F'",
  46: "R' U' R' F R F' U R", 47: "R' U' R' F R F' R' F R F' U R", 48: "F R U R' U' R U R' U' F'",
  49: "r U' r2 U r2 U r2 U' r", 50: "r' U r2 U' r2 U' r2 U r'", 51: "F U R U' R' U R U' R' F'",
  52: "R U R' U R U' B U' B' R'", 53: "r' U' R U' R' U R U' R' U2 r", 54: "r U R' U R U' R' U R U2 r'",
  55: "R U2 R2 U' R U' R' U2 F R F'", 56: "r U r' U R U' R' U R U' R' r U' r'", 57: "R U R' U' M' U R U' r'",
};
const REF_PLL: Record<string, string> = {
  'pll-ua': "M2 U M U2 M' U M2", 'pll-ub': "M2 U' M U2 M' U' M2", 'pll-h': "M2 U M2 U2 M2 U M2",
  'pll-z': "M' U M2 U M2 U M' U2 M2", 'pll-aa': "R' F R' B2 R F' R' B2 R2",
  'pll-ab': "x R2 D2 R U R' D2 R U' R x'", 'pll-e': "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
  'pll-t': "R U R' U' R' F R2 U' R' U' R U R' F'",
  'pll-f': "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", 'pll-ja': "R' U L' U2 R U' R' U2 R L",
  'pll-jb': "R U R' F' R U R' U' R' F R2 U' R'", 'pll-ra': "R U' R' U' R U R D R' U' R D' R' U2 R'",
  'pll-rb': "R' U2 R U2 R' F R U R' U' R' F' R2", 'pll-y': "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  'pll-na': "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", 'pll-nb': "R' U R U' R' F' U' F R U R' F R' F' R U' R",
  'pll-v': "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2", 'pll-ga': "R2 U R' U R' U' R U' R2 U' D R' U R D'",
  'pll-gb': "R' U' R U D' R2 U R' U R U' R U' R2 D", 'pll-gc': "R2 U' R U' R U R' U R2 U D' R U' R' D",
  'pll-gd': "R U R' U' D R2 U' R U' R' U R' U R2 D'",
};

// ── Sanity: the reference bases are themselves correct ───────────────────────

test('OLL reference basis is 57 valid, mutually-distinct orientations', () => {
  const sigs = new Map<string, number>();
  for (let n = 1; n <= 57; n++) {
    const fl = facelets({ caseAlg: REF_OLL[n] });
    assert.ok(centersHome(fl) && f2lIntact(fl) && !faceSolid(fl, 0), `ref OLL ${n} not a valid OLL`);
    const s = orientationSig(REF_OLL[n]);
    assert.ok(!sigs.has(s), `ref OLL ${n} collides with ${sigs.get(s)}`);
    sigs.set(s, n);
  }
});

test('PLL reference basis is 21 valid, mutually-distinct permutations', () => {
  const states = pllAlgorithms.map(() => null) as (string[] | null)[];
  const refs = Object.values(REF_PLL).map((a) => facelets({ caseAlg: a }));
  for (const fl of refs) {
    assert.ok(centersHome(fl) && faceSolid(fl, 0) && f2lIntact(fl) && !isSolved(fl), 'ref PLL invalid');
  }
  for (let i = 0; i < refs.length; i++)
    for (let j = i + 1; j < refs.length; j++)
      assert.ok(!equalUpToAUF(refs[i], refs[j]), `PLL refs ${i} and ${j} collide`);
  void states;
});

// ── F2L ──────────────────────────────────────────────────────────────────────

test('every F2L recognition keeps the cross intact and the cube unrotated', () => {
  for (const a of f2lAlgorithms) {
    const viz = getVizAlg(a);
    const fl = facelets({ caseAlg: viz });
    assert.ok(centersHome(fl), `${a.id} has a net rotation (viz="${viz}")`);
    assert.ok(crossSolid(fl), `${a.id} breaks the bottom cross (viz="${viz}")`);
    assert.ok(!isSolved(fl), `${a.id} renders a solved cube (viz="${viz}")`);
  }
});

// ── OLL ──────────────────────────────────────────────────────────────────────

test('every OLL renders a valid, unrotated, mis-oriented last layer', () => {
  for (const a of ollAlgorithms) {
    const viz = getVizAlg(a);
    const fl = facelets({ caseAlg: viz });
    assert.ok(centersHome(fl), `${a.id} has a net rotation (viz="${viz}")`);
    assert.ok(f2lIntact(fl), `${a.id} breaks F2L (viz="${viz}")`);
    assert.ok(!faceSolid(fl, 0), `${a.id} last layer already oriented — not a real OLL (viz="${viz}")`);
  }
});

test('every OLL matches its canonical case (no swaps / mislabels)', () => {
  const sigs = new Map<string, string>();
  for (const a of ollAlgorithms) {
    const n = Number(a.id.split('-')[1]);
    const got = orientationSig(getVizAlg(a));
    assert.equal(got, orientationSig(REF_OLL[n]), `${a.id} renders the wrong OLL case`);
    assert.ok(!sigs.has(got), `${a.id} duplicates ${sigs.get(got)}`);
    sigs.set(got, a.id);
  }
  assert.equal(sigs.size, 57, 'expected 57 distinct OLL orientations');
});

// ── PLL ──────────────────────────────────────────────────────────────────────

test('every PLL renders a valid, oriented, unrotated last layer', () => {
  for (const a of pllAlgorithms) {
    const viz = getVizAlg(a);
    const fl = facelets({ caseAlg: viz });
    assert.ok(centersHome(fl), `${a.id} has a net rotation (viz="${viz}")`);
    assert.ok(faceSolid(fl, 0), `${a.id} last layer not fully oriented (viz="${viz}")`);
    assert.ok(f2lIntact(fl), `${a.id} breaks F2L (viz="${viz}")`);
    assert.ok(!isSolved(fl), `${a.id} renders a solved cube (viz="${viz}")`);
  }
});

test('every PLL matches its canonical permutation up to AUF (no mirror mislabels)', () => {
  for (const a of pllAlgorithms) {
    const ref = REF_PLL[a.id];
    assert.ok(ref, `no reference for ${a.id}`);
    const got = facelets({ caseAlg: getVizAlg(a) });
    assert.ok(equalUpToAUF(got, facelets({ caseAlg: ref })), `${a.id} renders the wrong PLL case`);
  }
});
