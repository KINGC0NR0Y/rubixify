type Face = 'U' | 'D' | 'R' | 'L' | 'F' | 'B';

const FACES: Face[] = ['U', 'D', 'R', 'L', 'F', 'B'];
const MODS = ["", "'", "2"] as const;
const AXIS: Record<Face, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };


export function generateScramble(length = 20): string {
  const moves: string[] = [];
  let prev: Face | null = null;
  let prevPrev: Face | null = null;

  while (moves.length < length) {
    const face = FACES[Math.floor(Math.random() * 6)];
    if (face === prev) continue;
    if (prev !== null && prevPrev !== null &&
        AXIS[face] === AXIS[prev] && AXIS[prev] === AXIS[prevPrev]) continue;
    moves.push(face + MODS[Math.floor(Math.random() * 3)]);
    prevPrev = prev;
    prev = face;
  }

  return moves.join(' ');
}

export function parseScramble(scramble: string): string[] {
  return scramble.split(' ').filter(Boolean);
}
