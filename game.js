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

// positional weights: corners are strong, squares next to corners are weak
const W = [
  100,-20,10,5,5,10,-20,100,
  -20,-50,-2,-2,-2,-2,-50,-20,
  10,-2,-1,-1,-1,-1,-2,10,
  5,-2,-1,-1,-1,-1,-2,5,
  5,-2,-1,-1,-1,-1,-2,5,
  10,-2,-1,-1,-1,-1,-2,10,
  -20,-50,-2,-2,-2,-2,-50,-20,
  100,-20,10,5,5,10,-20,100,
];
const count = (b, p) => b.filter(x => x === p).length;

// position value from p's view: weighted discs plus mobility difference
function evaluate(b, p) {
  let s = 0;
  for (let i = 0; i < 64; i++) if (b[i]) s += b[i] === p ? W[i] : -W[i];
  return s + 5 * (legalMoves(b, p).length - legalMoves(b, 3 - p).length);
}

// negamax with alpha-beta; scores are from p's view, game over = 1000 per disc of margin
function search(b, p, depth, alpha, beta) {
  const ms = legalMoves(b, p);
  if (!ms.length) {
    if (!legalMoves(b, 3 - p).length) return 1000 * (count(b, p) - count(b, 3 - p));
    return -search(b, 3 - p, depth, -beta, -alpha);
  }
  if (depth === 0) return evaluate(b, p);
  ms.sort((x, y) => W[y] - W[x]);
  for (const m of ms) {
    const v = -search(play(b, m, p), 3 - p, depth - 1, -beta, -alpha);
    if (v >= beta) return v;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

// level 0 random, 1 greedy (most flips, corners first), 2 look-ahead 2, 3 look-ahead 5 + exact endgame
function cpuMove(b, p, level = 1) {
  const ms = legalMoves(b, p);
  if (level === 0) return ms[Math.random() * ms.length | 0];
  if (level === 1) {
    const score = i => flips(b, i, p).length + ([0, 7, 56, 63].includes(i) ? 100 : 0) + Math.random();
    return ms.sort((a, c) => score(c) - score(a))[0];
  }
  const empties = 64 - count(b, 1) - count(b, 2);
  const depth = level === 2 ? 2 : empties <= 8 ? empties : 5;
  let best, bv = -Infinity;
  for (const m of ms.sort((x, y) => W[y] - W[x])) {
    const v = -search(play(b, m, p), 3 - p, depth - 1, -Infinity, -bv);
    if (v > bv) { bv = v; best = m; }
  }
  return best;
}

if (typeof module !== 'undefined') module.exports = { newBoard, flips, legalMoves, play, cpuMove };
