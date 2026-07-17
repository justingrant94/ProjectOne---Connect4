import { COLUMNS, EMPTY_CELL, PLAYER_ONE, PLAYER_TWO, ROWS } from './constants.js';

export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLUMNS).fill(EMPTY_CELL));
}

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function getValidColumns(board) {
  return Array.from({ length: COLUMNS }, (_, column) => column).filter((column) => board[0][column] === EMPTY_CELL);
}

export function isValidMove(board, column) {
  return Number.isInteger(column) && column >= 0 && column < COLUMNS && board[0][column] === EMPTY_CELL;
}

export function getAvailableRow(board, column) {
  if (!isValidMove(board, column)) return -1;

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === EMPTY_CELL) return row;
  }

  return -1;
}

export function placeCounter(board, column, playerId) {
  const row = getAvailableRow(board, column);
  if (row === -1) return null;

  const nextBoard = cloneBoard(board);
  nextBoard[row][column] = playerId;

  return { board: nextBoard, row, column, playerId };
}

export function isDraw(board) {
  return getValidColumns(board).length === 0 && !findWinner(board);
}

export function getOpponent(playerId) {
  return playerId === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

export function findWinner(board) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const playerId = board[row][column];
      if (playerId === EMPTY_CELL) continue;

      for (const [rowStep, columnStep] of directions) {
        const cells = [[row, column]];

        for (let offset = 1; offset < 4; offset += 1) {
          const nextRow = row + rowStep * offset;
          const nextColumn = column + columnStep * offset;

          if (!isInsideBoard(nextRow, nextColumn) || board[nextRow][nextColumn] !== playerId) break;
          cells.push([nextRow, nextColumn]);
        }

        if (cells.length === 4) return { playerId, cells };
      }
    }
  }

  return null;
}

export function findImmediateWinningColumn(board, playerId) {
  for (const column of getOrderedColumns()) {
    const move = placeCounter(board, column, playerId);
    if (move && findWinner(move.board)?.playerId === playerId) return column;
  }

  return null;
}

export function createsImmediateThreat(board, column, playerId) {
  const move = placeCounter(board, column, playerId);
  if (!move) return false;

  return findImmediateWinningColumn(move.board, getOpponent(playerId)) !== null;
}

export function getOrderedColumns() {
  const center = Math.floor(COLUMNS / 2);
  return Array.from({ length: COLUMNS }, (_, column) => column).sort(
    (a, b) => Math.abs(a - center) - Math.abs(b - center),
  );
}

export function isInsideBoard(row, column) {
  return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS;
}