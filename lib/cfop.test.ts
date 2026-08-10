// CFOP data-integrity and cube-image utility tests.
//
// Run with the built-in Node test runner (Node 22+ strips the TypeScript):
//   npm test
//
// Excluded from the Next.js/tsc build via tsconfig, so the `.ts` import
// specifiers below (required by Node's runtime resolver) don't trip the
// bundler's `allowImportingTsExtensions` check.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  allAlgorithms,
  f2lAlgorithms,
  ollAlgorithms,
  pllAlgorithms,
  getVizAlg,
  type Algorithm,
  type Category,
} from './algorithms.ts';

import {
  buildCubeOptions,
  cubeCacheKey,
  isValidNotation,
  tokenizeMoves,
  isRotationNeutral,
  moveCount,
  WCA_COLOR_SCHEME,
  OLL_COLOR_SCHEME,
} from './cubeImage.ts';

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL', 'Advanced'];

// ── Dataset integrity ───────────────────────────────────────────────────────

test('every algorithm id is unique', () => {
  const ids = allAlgorithms.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id found');
});

test('every algorithm has a non-empty name and a known category', () => {
  for (const a of allAlgorithms) {
    assert.ok(a.name.trim().length > 0, `${a.id} missing name`);
    assert.ok(CATEGORIES.includes(a.category), `${a.id} has bad category ${a.category}`);
  }
});

// Commutator / conjugate shorthand (e.g. "[R, U]", "[R: U]") is valid
// speedcubing notation but not directly renderable move notation. It is only
// ever used for display in alternatives, never for the recognition image.
const isCommutatorNotation = (s: string) => /^\[.+[,:].+\]$/.test(s.trim());

test('main algorithms are renderable WCA notation', () => {
  for (const a of allAlgorithms) {
    assert.ok(isValidNotation(a.alg), `${a.id} main alg invalid: "${a.alg}"`);
  }
});

test('every alternative is valid WCA or commutator notation', () => {
  for (const a of allAlgorithms) {
    for (const alt of a.alts) {
      assert.ok(
        isValidNotation(alt) || isCommutatorNotation(alt),
        `${a.id} alt invalid: "${alt}"`,
      );
    }
  }
});

test('move counts are non-negative and consistent with notation', () => {
  for (const a of allAlgorithms) {
    assert.ok(a.moves >= 0, `${a.id} negative move count`);
    // The `moves` field should be within one of the counted outer turns
    // (allows for notation/finger-trick bookkeeping differences).
    if (a.alg.trim()) {
      const counted = moveCount(a.alg);
      assert.ok(
        Math.abs(counted - a.moves) <= 2,
        `${a.id} move count ${a.moves} far from notation count ${counted} ("${a.alg}")`,
      );
    }
  }
});

test('popularity is within 0–10 for every case', () => {
  for (const a of allAlgorithms) {
    assert.ok(a.popularity >= 0 && a.popularity <= 10, `${a.id} popularity out of range`);
  }
});

test('CFOP category counts are complete', () => {
  assert.equal(ollAlgorithms.length, 57, 'expected 57 OLL cases');
  assert.equal(pllAlgorithms.length, 21, 'expected 21 PLL cases');
  assert.equal(f2lAlgorithms.length, 41, 'expected 41 F2L cases');
});

test('every OLL/PLL/F2L case belongs to its declared category', () => {
  const byCat = (cat: Category, list: Algorithm[]) =>
    list.every((a) => a.category === cat);
  assert.ok(byCat('OLL', ollAlgorithms));
  assert.ok(byCat('PLL', pllAlgorithms));
  assert.ok(byCat('F2L', f2lAlgorithms));
});

// ── Notation helpers ────────────────────────────────────────────────────────

test('tokenizeMoves splits on whitespace and drops blanks', () => {
  assert.deepEqual(tokenizeMoves("R U R'  U'"), ['R', 'U', "R'", "U'"]);
  assert.deepEqual(tokenizeMoves('   '), []);
});

test('isValidNotation accepts wide moves, slices, rotations and 2/prime', () => {
  assert.ok(isValidNotation("R U R' U'"));
  assert.ok(isValidNotation("r U R' U' r' F R F'"));
  assert.ok(isValidNotation("M2 U M U2 M' U M2"));
  assert.ok(isValidNotation("x R' U R' D2 R U' R' D2 R2 x'"));
  assert.ok(isValidNotation(''), 'empty alg (skip) is valid');
});

test('isValidNotation rejects garbage', () => {
  assert.ok(!isValidNotation('R U Q'));
  assert.ok(!isValidNotation('hello'));
  assert.ok(!isValidNotation('R3'));
});

test('moveCount ignores whole-cube rotations', () => {
  assert.equal(moveCount("x R U R' x'"), 3);
  assert.equal(moveCount("R U R' U'"), 4);
});

test('getVizAlg returns a rotation-neutral alg for every case', () => {
  // A balanced rotation (e.g. Aa's "x … x'") is allowed; a NET rotation is not.
  for (const a of allAlgorithms) {
    assert.ok(
      isRotationNeutral(getVizAlg(a)),
      `${a.id} viz alg has a net whole-cube rotation: "${getVizAlg(a)}"`,
    );
  }
});

test('isRotationNeutral accepts balanced rotations, rejects net ones', () => {
  assert.ok(isRotationNeutral("x R U R' x'"));
  assert.ok(isRotationNeutral("R U R' U'"));
  assert.ok(isRotationNeutral("y2 R U R' y2"));
  assert.ok(!isRotationNeutral("y R U R'"));
  assert.ok(!isRotationNeutral("x R U R'"));
});

// ── Cube image builder ──────────────────────────────────────────────────────

test('buildCubeOptions is deterministic for identical input', () => {
  const input = { alg: "R U R' U'", category: 'OLL' as Category };
  assert.deepEqual(buildCubeOptions(input), buildCubeOptions(input));
});

test('recognition state renders the inverse via `case`; execution via `algorithm`', () => {
  const rec = buildCubeOptions({ alg: "R U R'", category: 'OLL', state: 'recognition' });
  assert.equal(rec.case, "R U R'");
  assert.equal(rec.algorithm, undefined);

  const exec = buildCubeOptions({ alg: "R U R'", category: 'OLL', state: 'execution' });
  assert.equal(exec.algorithm, "R U R'");
  assert.equal(exec.case, undefined);

  const solved = buildCubeOptions({ alg: "R U R'", category: 'OLL', state: 'solved' });
  assert.equal(solved.case, undefined);
  assert.equal(solved.algorithm, undefined);
});

test('each category maps to the correct mask and view', () => {
  // F2L shows the whole cube (no mask) so the U-layer pair is visible.
  assert.equal(buildCubeOptions({ alg: "R U R'", category: 'F2L' }).mask, undefined);

  // OLL uses the last-layer mask (not the narrower `oll` mask) so the side tabs
  // that encode corner-twist direction are visible.
  const oll = buildCubeOptions({ alg: "R U R'", category: 'OLL' });
  assert.equal(oll.mask, 'll');
  assert.equal(oll.view, 'plan');

  const pll = buildCubeOptions({ alg: "R U R'", category: 'PLL' });
  assert.equal(pll.mask, 'll');
  assert.equal(pll.view, 'plan');

  // Advanced has no mask and defaults to showing the executed algorithm.
  const adv = buildCubeOptions({ alg: "R U R' U'", category: 'Advanced' });
  assert.equal(adv.mask, undefined);
  assert.equal(adv.algorithm, "R U R' U'");
});

test('non-plan categories always carry explicit rotations (no blank render)', () => {
  // The renderer reads viewportRotations unconditionally off plan view, so a
  // missing value throws and renders a blank cube. F2L and Advanced must set it.
  for (const category of ['F2L', 'Advanced'] as const) {
    const o = buildCubeOptions({ alg: "R U R'", category });
    assert.equal(o.view, undefined, `${category} should not use plan view`);
    assert.ok(
      Array.isArray(o.viewportRotations) && o.viewportRotations.length > 0,
      `${category} must define viewportRotations`,
    );
  }
});

test('images use the pinned colour scheme (OLL greyed, others WCA)', () => {
  for (const a of allAlgorithms) {
    const o = buildCubeOptions({ alg: getVizAlg(a), category: a.category });
    const expected = a.category === 'OLL' ? OLL_COLOR_SCHEME : WCA_COLOR_SCHEME;
    assert.deepEqual(o.colorScheme, expected, `${a.id} colour scheme drifted`);
  }
});

test('OLL greys every non-U face so only oriented stickers stay yellow', () => {
  assert.equal(OLL_COLOR_SCHEME[0], '#FFD500'); // U stays yellow
  for (const f of [1, 2, 3, 4, 5]) assert.equal(OLL_COLOR_SCHEME[f], '#555566');
});

test('style size flows into width/height', () => {
  const o = buildCubeOptions({ alg: '', category: 'OLL', style: { size: 240 } });
  assert.equal(o.width, 240);
  assert.equal(o.height, 240);
});

test('cubeCacheKey is stable per input and differs by state', () => {
  const a = cubeCacheKey({ alg: "R U R'", category: 'OLL', state: 'recognition' });
  const b = cubeCacheKey({ alg: "R U R'", category: 'OLL', state: 'recognition' });
  const c = cubeCacheKey({ alg: "R U R'", category: 'OLL', state: 'execution' });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('every case in the dataset produces renderable options without throwing', () => {
  for (const a of allAlgorithms) {
    assert.doesNotThrow(() => buildCubeOptions({ alg: getVizAlg(a), category: a.category }));
  }
});
