// board: 64-length array, 0 empty, 1 black, 2 white
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function newBoard() {
  const b = Array(64).fill(0);
  b[27] = b[36] = 2;
  b[28] = b[35] = 1;
  return b;
}

// cells that would be flipped if p plays at i (empty array = illegal)
function flips(b, i, p) {
  if (b[i]) return [];
  const r0 = i >> 3, c0 = i & 7, out = [];
  for (const [dr, dc] of DIRS) {
    const line = [];
    let r = r0 + dr, c = c0 + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r * 8 + c] === 3 - p) {
      line.push(r * 8 + c);
      r += dr; c += dc;
    }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && b[r * 8 + c] === p) out.push(...line);
  }
  return out;
}

function legalMoves(b, p) {
  return b.map((_, i) => i).filter(i => flips(b, i, p).length);
}

function play(b, i, p) {
  const f = flips(b, i, p);
  if (!f.length) return null;
  const n = b.slice();
  n[i] = p;
  f.forEach(j => (n[j] = p));
  return n;
}

// CPU: greedy (most flips), corners strongly preferred, random tie-break
function cpuMove(b, p) {
  const score = i => flips(b, i, p).length + ([0, 7, 56, 63].includes(i) ? 100 : 0) + Math.random();
  return legalMoves(b, p).sort((a, c) => score(c) - score(a))[0];
}

if (typeof module !== 'undefined') module.exports = { newBoard, flips, legalMoves, play, cpuMove };
