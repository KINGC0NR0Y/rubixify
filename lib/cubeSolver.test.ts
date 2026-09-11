// ─────────────────────────────────────────────────────────────────────────────
// Cube engine, validation and solver.
//
// The move engine is checked against sr-visualizer's own pure sticker
// simulation — the same engine that draws every case image on the site — so the
// two never drift apart. Everything above it is then checked against random
// cubes: a solver either finishes on a solved cube or it doesn't, and there is
// no partial credit.
//
// Run with: npm test   (node --test, Node strips the TypeScript)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  SOLVED, GEOMETRY, applyAlg, applyMove, invertAlg, parseMove, isParsable,
  toCubiesStrict, permutationParity, validateFacelets, moveTurn,
  CORNER_FACELETS, EDGE_FACELETS, CENTER_INDEX,
} from './cube.ts';
import { solveCube } from './cubeSolver.ts';
import { ollAlgorithms, pllAlgorithms } from './algorithms.ts';

const require = createRequire(import.meta.url);
const { makeStickerColors } = require('sr-visualizer/dist/lib/cube/stickers.js');

/** The same state, computed by the renderer's engine instead of ours. */
function reference(alg: string): string {
  return (
    makeStickerColors({
      cubeSize: 3,
      colorScheme: { 0: 'U', 1: 'R', 2: 'F', 3: 'D', 4: 'L', 5: 'B' },
      algorithm: alg,
    }) as string[]
  ).join('');
}

const BASES = ['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S', 'x', 'y', 'z', 'r', 'l', 'u', 'd', 'f', 'b'];
const SUFFIXES = ['', "'", '2'];
const ALL_MOVES = BASES.flatMap((b) => SUFFIXES.map((s) => b + s));
const FACE_MOVES = ['U', 'D', 'L', 'R', 'F', 'B'].flatMap((f) => SUFFIXES.map((s) => f + s));

// A fixed generator keeps failures reproducible run to run.
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomScramble(rnd: () => number, length = 25): string {
  return Array.from({ length }, () => FACE_MOVES[Math.floor(rnd() * FACE_MOVES.length)]).join(' ');
}

// ── Move engine ─────────────────────────────────────────────────────────────

test('every move matches sr-visualizer, including slices, wides and rotations', () => {
  for (const move of ALL_MOVES) {
    assert.equal(applyAlg(SOLVED, move), reference(move), `move ${move}`);
  }
});

test('random algorithms match sr-visualizer', () => {
  const rnd = seededRandom(20260910);
  for (let i = 0; i < 200; i++) {
    const alg = Array.from({ length: 15 }, () => ALL_MOVES[Math.floor(rnd() * ALL_MOVES.length)]).join(' ');
    assert.equal(applyAlg(SOLVED, alg), reference(alg), alg);
  }
});

test('an algorithm followed by its inverse is a no-op', () => {
  const rnd = seededRandom(7);
  for (let i = 0; i < 50; i++) {
    const alg = randomScramble(rnd, 12);
    assert.equal(applyAlg(applyAlg(SOLVED, alg), invertAlg(alg)), SOLVED, alg);
  }
});

test('quarter turns have order four and centres never move', () => {
  for (const face of ['U', 'D', 'L', 'R', 'F', 'B']) {
    let state = SOLVED;
    for (let i = 0; i < 4; i++) state = applyMove(state, face);
    assert.equal(state, SOLVED, `${face}4`);
    for (const centre of CENTER_INDEX) {
      assert.equal(applyMove(SOLVED, face)[centre], SOLVED[centre]);
    }
  }
});

test('notation parsing accepts WCA tokens and rejects nonsense', () => {
  for (const token of ["R", "R'", 'R2', "R2'", 'Rw', "Rw'", 'r2', 'M', "y'", 'x2']) {
    assert.ok(parseMove(token), token);
  }
  for (const token of ['Q', 'R3', 'RR', 'Uw2w', '2R', '']) {
    assert.equal(parseMove(token), null, token);
  }
  assert.ok(isParsable("R U R' U'"));
  assert.ok(!isParsable('R U Q'));
});

test('the drawn turn lands stickers exactly where the engine puts them', () => {
  // `moveTurn` describes the animation the 3-D view plays. Replaying that
  // rotation by hand and asking where each sticker ends up must reproduce the
  // engine's own permutation, or the cube would animate one way and repaint
  // another.
  const key = (v: readonly number[]) => v.map((n) => Math.round(n)).join(',');
  const indexOf = new Map(GEOMETRY.map((g, i) => [`${key(g.pos)}|${key(g.normal)}`, i]));

  const rotate = (v: readonly number[], axis: string, angle: number) => {
    const [x, y, z] = v;
    const c = Math.round(Math.cos(angle));
    const s = Math.round(Math.sin(angle));
    if (axis === 'x') return [x, y * c - z * s, y * s + z * c];
    if (axis === 'y') return [x * c + z * s, y, -x * s + z * c];
    return [x * c - y * s, x * s + y * c, z];
  };

  for (const token of ALL_MOVES) {
    const turn = moveTurn(token);
    assert.ok(turn, token);
    const angle = (-Math.PI / 2) * turn.quarters;
    const axisIndex = turn.axis === 'x' ? 0 : turn.axis === 'y' ? 1 : 2;
    const after = applyAlg(SOLVED, token);

    for (let i = 0; i < 54; i++) {
      const { pos, normal } = GEOMETRY[i];
      const moves = turn.layers.includes(pos[axisIndex]);
      const landing = moves
        ? indexOf.get(`${key(rotate(pos, turn.axis, angle))}|${key(rotate(normal, turn.axis, angle))}`)!
        : i;
      assert.equal(after[landing], SOLVED[i], `${token}: sticker ${i} should land on ${landing}`);
    }
  }
});

// ── Piece model ─────────────────────────────────────────────────────────────

test('piece tables agree with the facelet geometry', () => {
  const at = (i: number) => GEOMETRY[i].pos.join(',');
  for (const corner of CORNER_FACELETS) {
    assert.equal(new Set(corner.map(at)).size, 1, `corner ${corner}`);
  }
  for (const edge of EDGE_FACELETS) {
    assert.equal(new Set(edge.map(at)).size, 1, `edge ${edge}`);
  }
});

test('every reachable state satisfies the three cube invariants', () => {
  const rnd = seededRandom(99);
  for (let i = 0; i < 400; i++) {
    const state = applyAlg(SOLVED, randomScramble(rnd));
    const { cp, co, ep, eo } = toCubiesStrict(state);
    assert.equal(co.reduce((a, b) => a + b, 0) % 3, 0, 'corner twist sums to zero');
    assert.equal(eo.reduce((a, b) => a + b, 0) % 2, 0, 'edge flips sum to zero');
    assert.equal(permutationParity(cp), permutationParity(ep), 'permutation parities agree');
  }
});

// ── Validation ──────────────────────────────────────────────────────────────

test('a scrambled cube always validates', () => {
  const rnd = seededRandom(1234);
  for (let i = 0; i < 200; i++) {
    const state = applyAlg(SOLVED, randomScramble(rnd));
    const result = validateFacelets(state);
    assert.ok(result.ok, `rejected a real cube: ${result.issues.map((x) => x.code)}`);
    assert.ok(Object.values(result.counts).every((n) => n === 9));
  }
});

test('a blank net asks for the missing stickers rather than erroring', () => {
  const blank = CENTER_INDEX.reduce(
    (acc, idx, face) => acc.slice(0, idx) + ['U', 'R', 'F', 'D', 'L', 'B'][face] + acc.slice(idx + 1),
    '.'.repeat(54),
  );
  const result = validateFacelets(blank);
  assert.equal(result.ok, false);
  assert.equal(result.issues[0].code, 'incomplete');
  assert.equal(result.issues[0].facelets?.length, 48);
  assert.match(result.issues[0].message, /48 stickers are still blank/);
});

test('each impossible cube is reported as its own specific problem', () => {
  const swap = (s: string, a: number, b: number) => {
    const c = s.split('');
    [c[a], c[b]] = [c[b], c[a]];
    return c.join('');
  };

  // Wrong colour counts.
  const miscount = SOLVED.slice(0, 8) + 'R' + SOLVED.slice(9);
  const counts = validateFacelets(miscount);
  assert.equal(counts.ok, false);
  assert.ok(counts.issues.every((i) => i.code === 'counts'));
  assert.match(counts.issues.map((i) => i.message).join(' '), /exactly 9/);

  // A single flipped edge.
  const flip = validateFacelets(swap(SOLVED, 7, 19));
  assert.deepEqual(flip.issues.map((i) => i.code), ['edge-flip']);

  // A single twisted corner: rotate its three stickers by one.
  const twisted = SOLVED.split('');
  const [a, b, c] = CORNER_FACELETS[0];
  const held = twisted[a];
  twisted[a] = twisted[b];
  twisted[b] = twisted[c];
  twisted[c] = held;
  assert.deepEqual(validateFacelets(twisted.join('')).issues.map((i) => i.code), ['corner-twist']);

  // Two edges swapped with each other — the classic parity error.
  const parity = swap(swap(SOLVED, 5, 7), 10, 19);
  assert.deepEqual(validateFacelets(parity).issues.map((i) => i.code), ['parity']);

  // Colours that form no real piece at all.
  const impossible = SOLVED.slice(0, 8) + 'D' + SOLVED.slice(9);
  const pieceIssues = validateFacelets(impossible).issues.map((i) => i.code);
  assert.ok(pieceIssues.includes('counts') || pieceIssues.includes('corner-piece'));

  // A moved centre is called out as impossible rather than silently accepted.
  const centres = validateFacelets(swap(SOLVED, 4, 13));
  assert.ok(centres.issues.some((i) => i.code === 'counts' || i.code === 'centres'));
});

test('validation messages name the colours the user actually sees', () => {
  const names = { U: 'Yellow', R: 'Red', F: 'Blue', D: 'White', L: 'Orange', B: 'Green' } as const;
  const miscount = SOLVED.slice(0, 8) + 'R' + SOLVED.slice(9);
  const message = validateFacelets(miscount, names).issues.map((i) => i.message).join(' ');
  assert.match(message, /Yellow/);
  assert.match(message, /Red/);
});

// ── Solver ──────────────────────────────────────────────────────────────────

test('an already-solved cube needs no moves', () => {
  const solution = solveCube(SOLVED);
  assert.equal(solution.moves.length, 0);
  assert.equal(solution.turnCount, 0);
  assert.deepEqual(solution.states, [SOLVED]);
});

test('random cubes are solved, and the reported moves are what solve them', () => {
  const rnd = seededRandom(424242);
  let longest = 0;
  for (let i = 0; i < 60; i++) {
    const scramble = randomScramble(rnd);
    const start = applyAlg(SOLVED, scramble);
    const solution = solveCube(start);

    assert.equal(applyAlg(start, solution.moves), SOLVED, `not solved: ${scramble}`);
    assert.ok(solution.moves.every((m) => parseMove(m) !== null), 'every move is real notation');
    longest = Math.max(longest, solution.turnCount);
  }
  // Comfortably inside the layer-by-layer worst case; a regression that broke
  // the pair matching or the cancellation pass would blow straight past this.
  assert.ok(longest < 130, `worst solution was ${longest} turns`);
});

test('the state trail matches the move list at every step', () => {
  const rnd = seededRandom(31337);
  for (let i = 0; i < 10; i++) {
    const start = applyAlg(SOLVED, randomScramble(rnd));
    const solution = solveCube(start);
    assert.equal(solution.states.length, solution.moves.length + 1);
    assert.equal(solution.states[0], start);
    for (let n = 0; n < solution.moves.length; n++) {
      assert.equal(applyMove(solution.states[n], solution.moves[n]), solution.states[n + 1], `step ${n}`);
    }
    assert.equal(solution.states.at(-1), SOLVED);
  }
});

test('stages partition the solution in order and reach their own milestones', () => {
  const rnd = seededRandom(5150);
  const crossFacelets = [4, 5, 6, 7].flatMap((i) => [...EDGE_FACELETS[i]]);

  for (let i = 0; i < 10; i++) {
    const start = applyAlg(SOLVED, randomScramble(rnd));
    const solution = solveCube(start);

    assert.deepEqual(solution.stages.map((s) => s.key), ['cross', 'f2l', 'oll', 'pll']);
    assert.deepEqual(solution.stages.flatMap((s) => s.moves), solution.moves);

    let cursor = 0;
    for (const stage of solution.stages) {
      if (stage.moves.length === 0) continue;
      assert.equal(stage.start, cursor, `${stage.key} starts where the previous stage ended`);
      cursor += stage.moves.length;
    }

    const afterCross = solution.states[solution.stages[1].start];
    for (const idx of crossFacelets) {
      assert.equal(afterCross[idx], SOLVED[idx], 'cross is built by the end of the cross stage');
    }

    const afterF2L = solution.states[solution.stages[2].start];
    for (let idx = 27; idx < 36; idx++) {
      assert.equal(afterF2L[idx], 'D', 'the bottom face is complete after F2L');
    }

    const afterOLL = solution.states[solution.stages[3].start];
    for (let idx = 0; idx < 9; idx++) {
      assert.equal(afterOLL[idx], 'U', 'the top face is yellow after OLL');
    }
  }
});

test('the last layer is solved with cases from this site, and links to them', () => {
  const rnd = seededRandom(2718);
  const known = new Set([...ollAlgorithms, ...pllAlgorithms].map((a) => a.id));

  for (let i = 0; i < 15; i++) {
    const start = applyAlg(SOLVED, randomScramble(rnd));
    const solution = solveCube(start);
    for (const stage of solution.stages) {
      if (stage.key !== 'oll' && stage.key !== 'pll') {
        assert.equal(stage.algId, undefined, `${stage.key} should not claim a case`);
        continue;
      }
      // A skipped OLL/PLL legitimately has no case to name.
      if (!stage.algId) continue;
      assert.ok(known.has(stage.algId), `unknown case id ${stage.algId}`);
      assert.ok(stage.algName, 'a named case for the link');
    }
  }
});

test('no stage leaves two turns of the same face sitting next to each other', () => {
  // Across a stage boundary a repeated face is real — the step genuinely ends on
  // that face and the next genuinely opens on it — but inside a stage it is
  // redundancy the cancellation pass should have collapsed.
  const rnd = seededRandom(8080);
  for (let i = 0; i < 25; i++) {
    const solution = solveCube(applyAlg(SOLVED, randomScramble(rnd)));
    for (const stage of solution.stages) {
      for (let n = 0; n + 1 < stage.moves.length; n++) {
        assert.notEqual(
          parseMove(stage.moves[n])!.base,
          parseMove(stage.moves[n + 1])!.base,
          `${stage.key}: ${stage.moves[n]} ${stage.moves[n + 1]} should have cancelled`,
        );
      }
    }
  }
});

test('cubes needing only a last layer still solve', () => {
  // Every OLL and PLL case in the database, fed back in as a cube to solve.
  for (const entry of [...ollAlgorithms, ...pllAlgorithms]) {
    if (!isParsable(entry.alg)) continue;
    const start = applyAlg(SOLVED, invertAlg(entry.alg));
    if (!validateFacelets(start).ok) continue;
    assert.equal(applyAlg(start, solveCube(start).moves), SOLVED, `failed on ${entry.id}`);
  }
});
