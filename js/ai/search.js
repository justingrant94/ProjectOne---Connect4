import { COLUMNS, EMPTY_CELL, PLAYER_ONE, PLAYER_TWO, ROWS } from '../constants.js';
import { createsImmediateThreat, findImmediateWinningColumn, findWinner, getOpponent, getOrderedColumns, getValidColumns, placeCounter } from '../rules.js';

export function requestComputerMove({ board, computerId, humanId, difficulty, config, token }) {
  return new Promise((resolve) => {
    const startedAt = performance.now();

    setTimeout(() => {
      if (token.cancelled) return resolve(null);
      const column = chooseMove(board, computerId, humanId, difficulty, config, startedAt);
      resolve(token.cancelled ? null : column);
    }, difficulty === 'easy' ? 420 : 680);
  });
}

export function chooseMove(board, computerId, humanId, difficulty, config, startedAt = performance.now()) {
  const validColumns = getValidColumns(board);
  if (!validColumns.length) return null;

  const winningColumn = findImmediateWinningColumn(board, computerId);
  if (winningColumn !== null && (difficulty !== 'easy' || Math.random() > 0.45)) return winningColumn;

  const blockingColumn = findImmediateWinningColumn(board, humanId);
  if (blockingColumn !== null && shouldBlock(difficulty)) return blockingColumn;

  if (difficulty === 'easy' && Math.random() < config.randomness) return weightedRandomColumn(validColumns);

  const depth = config.depth;
  const candidates = getOrderedColumns().filter((column) => validColumns.includes(column));
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestColumns = [];

  for (const column of candidates) {
    const move = placeCounter(board, column, computerId);
    if (!move) continue;

    if (createsImmediateThreat(board, column, computerId) && difficulty !== 'expert') {
      bestColumns.push(column);
      continue;
    }

    const score = minimax(move.board, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false, computerId, humanId, startedAt, config.timeBudget);

    if (score > bestScore) {
      bestScore = score;
      bestColumns = [column];
    } else if (score === bestScore) {
      bestColumns.push(column);
    }
  }

  return pickBestColumn(bestColumns.length ? bestColumns : candidates, config.randomness);
}

function minimax(board, depth, alpha, beta, maximizing, computerId, humanId, startedAt, timeBudget) {
  const winner = findWinner(board);
  if (winner?.playerId === computerId) return 100000 + depth;
  if (winner?.playerId === humanId) return -100000 - depth;
  if (depth === 0 || !getValidColumns(board).length || performance.now() - startedAt > timeBudget) {
    return scoreBoard(board, computerId, humanId);
  }

  const playerId = maximizing ? computerId : humanId;
  const columns = getOrderedColumns().filter((column) => getValidColumns(board).includes(column));

  if (maximizing) {
    let value = Number.NEGATIVE_INFINITY;
    for (const column of columns) {
      const move = placeCounter(board, column, playerId);
      value = Math.max(value, minimax(move.board, depth - 1, alpha, beta, false, computerId, humanId, startedAt, timeBudget));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  let value = Number.POSITIVE_INFINITY;
  for (const column of columns) {
    const move = placeCounter(board, column, playerId);
    value = Math.min(value, minimax(move.board, depth - 1, alpha, beta, true, computerId, humanId, startedAt, timeBudget));
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return value;
}

function scoreBoard(board, computerId, humanId) {
  let score = 0;
  const center = Math.floor(COLUMNS / 2);

  for (let row = 0; row < ROWS; row += 1) {
    if (board[row][center] === computerId) score += 6;
    if (board[row][center] === humanId) score -= 6;
  }

  for (const windowCells of getWindows(board)) {
    score += scoreWindow(windowCells, computerId, humanId);
  }

  return score;
}

function getWindows(board) {
  const windows = [];
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      for (const [rowStep, columnStep] of directions) {
        const cells = [];
        for (let offset = 0; offset < 4; offset += 1) {
          const nextRow = row + rowStep * offset;
          const nextColumn = column + columnStep * offset;
          if (nextRow < 0 || nextRow >= ROWS || nextColumn < 0 || nextColumn >= COLUMNS) break;
          cells.push(board[nextRow][nextColumn]);
        }
        if (cells.length === 4) windows.push(cells);
      }
    }
  }
  return windows;
}

function scoreWindow(cells, computerId, humanId) {
  const computerCount = cells.filter((cell) => cell === computerId).length;
  const humanCount = cells.filter((cell) => cell === humanId).length;
  const emptyCount = cells.filter((cell) => cell === EMPTY_CELL).length;

  if (computerCount === 4) return 1000;
  if (computerCount === 3 && emptyCount === 1) return 48;
  if (computerCount === 2 && emptyCount === 2) return 9;
  if (humanCount === 3 && emptyCount === 1) return -62;
  if (humanCount === 2 && emptyCount === 2) return -11;
  return 0;
}

function shouldBlock(difficulty) {
  if (difficulty === 'easy') return Math.random() > 0.55;
  if (difficulty === 'medium') return Math.random() > 0.12;
  return true;
}

function weightedRandomColumn(validColumns) {
  const centerOrdered = getOrderedColumns().filter((column) => validColumns.includes(column));
  return Math.random() > 0.35 ? centerOrdered[Math.floor(Math.random() * Math.min(3, centerOrdered.length))] : validColumns[Math.floor(Math.random() * validColumns.length)];
}

function pickBestColumn(columns, randomness) {
  if (!columns.length) return null;
  if (randomness && Math.random() < randomness) return columns[Math.floor(Math.random() * columns.length)];
  return columns.sort((a, b) => Math.abs(a - Math.floor(COLUMNS / 2)) - Math.abs(b - Math.floor(COLUMNS / 2)))[0];
}