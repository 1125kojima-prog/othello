const assert = require('assert');
const { newBoard, legalMoves, play, cpuMove } = require('./game.js');

const b = newBoard();
assert.deepStrictEqual(legalMoves(b, 1), [19, 26, 37, 44]); // black's 4 opening moves
const n = play(b, 19, 1);
assert.strictEqual(n.filter(x => x === 1).length, 4);
assert.strictEqual(n.filter(x => x === 2).length, 1);
assert.strictEqual(play(b, 0, 1), null); // illegal move rejected
assert.strictEqual(play(n, 19, 2), null); // occupied cell rejected
assert.ok(legalMoves(b, 1).includes(cpuMove(b, 1))); // CPU picks a legal move
console.log('ok');
