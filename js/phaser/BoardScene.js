import { COLUMNS, EMPTY_CELL, ROWS } from '../constants.js';

export class BoardScene extends Phaser.Scene {
  constructor() {
    super('BoardScene');
    this.board = [];
    this.players = [];
    this.cells = [];
    this.preview = null;
    this.columnHighlight = null;
    this.locked = true;
    this.winningCells = [];
  }

  create() {
    this.syncPalette();
    this.boardLayer = this.add.container(0, 0);
    this.counterLayer = this.add.container(0, 0);
    this.effectLayer = this.add.container(0, 0);
    this.scale.on('resize', () => this.redraw());
    window.dispatchEvent(new CustomEvent('connect4:board-ready'));
  }

  setState({ board, players, locked, winningCells = [] }) {
    const nextSignature = JSON.stringify({ board, players: players.map((player) => [player.id, player.counter.id, player.avatar]), locked, winningCells });
    if (nextSignature === this.stateSignature) return;
    this.stateSignature = nextSignature;
    this.board = board;
    this.players = players;
    this.locked = locked;
    this.winningCells = winningCells;
    this.redraw();
  }

  redraw() {
    if (!this.boardLayer) return;
    this.syncPalette();

    const width = this.scale.width;
    const height = this.scale.height;
    const padding = Math.max(22, Math.min(width, height) * 0.055);
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const cellSize = Math.min(usableWidth / COLUMNS, usableHeight / ROWS);
    const boardWidth = cellSize * COLUMNS;
    const boardHeight = cellSize * ROWS;
    const originX = (width - boardWidth) / 2;
    const originY = (height - boardHeight) / 2;
    const radius = cellSize * 0.37;

    this.layout = { originX, originY, cellSize, radius };
    this.boardLayer.removeAll(true);
    this.counterLayer.removeAll(true);
    this.effectLayer.removeAll(true);
    this.columnHighlight = null;

    const boardBg = this.add.graphics();
    boardBg.fillStyle(this.palette.boardDark, 1);
    boardBg.fillRoundedRect(originX - padding * 0.5, originY - padding * 0.38 + padding * 0.24, boardWidth + padding, boardHeight + padding * 0.78, 24);
    boardBg.fillStyle(this.palette.board, 1);
    boardBg.fillRoundedRect(originX - padding * 0.5, originY - padding * 0.5, boardWidth + padding, boardHeight + padding, 24);
    boardBg.lineStyle(Math.max(5, cellSize * 0.075), this.palette.boardDark, 1);
    boardBg.strokeRoundedRect(originX - padding * 0.5, originY - padding * 0.5, boardWidth + padding, boardHeight + padding, 24);
    this.boardLayer.add(boardBg);

    for (let column = 0; column < COLUMNS; column += 1) {
      const zone = this.add.zone(originX + column * cellSize, originY, cellSize, boardHeight).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => this.showPreview(column));
      zone.on('pointerup', () => {
        if (this.locked) return;
        this.depressColumn(column);
        if (this.isColumnFull(column)) window.dispatchEvent(new CustomEvent('connect4:column-full', { detail: { column } }));
        else window.dispatchEvent(new CustomEvent('connect4:column-select', { detail: { column } }));
      });
      this.boardLayer.add(zone);
    }

    this.input.off('pointermove', this.handlePointerMove, this);
    this.input.off('gameout', this.hidePreview, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('gameout', this.hidePreview, this);

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const center = this.getCellCenter(row, column);
        const wellShadow = this.add.circle(center.x, center.y + Math.max(2, cellSize * 0.025), radius * 1.05, this.palette.boardDark, 1);
        const well = this.add.circle(center.x, center.y, radius, this.palette.slot, 1);
        well.setStrokeStyle(Math.max(3, cellSize * 0.055), this.palette.boardDark, 1);
        this.boardLayer.add(wellShadow);
        this.boardLayer.add(well);

        const playerId = this.board?.[row]?.[column] ?? EMPTY_CELL;
        if (playerId !== EMPTY_CELL) {
          const counter = this.createCounter(center.x, center.y, playerId, radius, this.isWinningCell(row, column) ? 1.12 : 1);
          if (this.winningCells.length && !this.isWinningCell(row, column)) counter.setAlpha(0.34);
          this.counterLayer.add(counter);
        }
      }
    }
  }

  animateMove(move, onComplete) {
    const { row, column, playerId } = move;
    const center = this.getCellCenter(row, column);
    const radius = this.layout.radius;
    const startY = this.layout.originY - this.layout.cellSize * 0.85;
    const counter = this.createCounter(center.x, startY, playerId, radius, 1);
    this.counterLayer.add(counter);

    this.tweens.add({
      targets: counter,
      y: center.y,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 360,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.vibrateBoard();
        this.tweens.add({ targets: counter, scaleX: 1.06, scaleY: 0.95, yoyo: true, duration: 80, onComplete });
      },
    });
  }

  pulseWin() {
    if (!this.layout) return;
    for (const [row, column] of this.winningCells) {
      const center = this.getCellCenter(row, column);
      const ring = this.add.circle(center.x, center.y, this.layout.radius * 1.16, this.palette.slot, 0);
      ring.setStrokeStyle(Math.max(5, this.layout.radius * 0.16), this.palette.text, 1);
      this.effectLayer.add(ring);
      this.tweens.add({ targets: ring, scale: 1.18, duration: 260, yoyo: true, repeat: 2 });
      const winningCounter = this.createCounter(center.x, center.y, this.board[row][column], this.layout.radius, 1.02);
      this.effectLayer.add(winningCounter);
      this.tweens.add({ targets: winningCounter, y: center.y - this.layout.radius * 0.2, duration: 150, yoyo: true, repeat: 1 });
    }
  }

  showPreview(column, fromKeyboard = false) {
    if (this.locked || !this.layout) return;
    this.hidePreview();
    this.highlightColumn(column, this.isColumnFull(column));
    const center = this.getCellCenter(0, column);
    if (this.isColumnFull(column)) {
      const message = this.add.text(center.x, this.layout.originY - this.layout.cellSize * 0.62, 'Full', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: `${Math.max(14, this.layout.radius * 0.52)}px`,
        fontStyle: '900',
        color: cssColor(this.palette.danger),
        backgroundColor: cssColor(this.palette.slot),
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5);
      this.preview = message;
      this.effectLayer.add(message);
      return;
    }

    this.preview = this.createCounter(center.x, this.layout.originY - this.layout.cellSize * 0.6, window.connect4ActivePlayerId ?? 1, this.layout.radius * 0.82, 0.78);
    this.preview.setAlpha(fromKeyboard ? 0.88 : 0.72);
    this.effectLayer.add(this.preview);
  }

  handlePointerMove(pointer) {
    if (!this.layout || this.locked) return;
    const insideX = pointer.x >= this.layout.originX && pointer.x <= this.layout.originX + this.layout.cellSize * COLUMNS;
    const insideY = pointer.y >= this.layout.originY - this.layout.cellSize && pointer.y <= this.layout.originY + this.layout.cellSize * ROWS;
    if (!insideX || !insideY) this.hidePreview();
  }

  hidePreview() {
    if (this.preview) this.preview.destroy();
    this.preview = null;
    if (this.columnHighlight) this.columnHighlight.destroy();
    this.columnHighlight = null;
  }

  highlightColumn(column, isFull) {
    if (this.columnHighlight) this.columnHighlight.destroy();
    const highlight = this.add.graphics();
    const x = this.layout.originX + column * this.layout.cellSize;
    highlight.fillStyle(isFull ? this.palette.danger : this.palette.boardHover, isFull ? 0.42 : 0.5);
    highlight.fillRoundedRect(x + this.layout.cellSize * 0.08, this.layout.originY, this.layout.cellSize * 0.84, this.layout.cellSize * ROWS, 12);
    this.columnHighlight = highlight;
    this.effectLayer.add(highlight);
  }

  depressColumn(column) {
    this.highlightColumn(column, this.isColumnFull(column));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !this.columnHighlight) return;
    this.tweens.add({ targets: this.columnHighlight, y: 4, duration: 60, yoyo: true });
  }

  vibrateBoard() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.tweens.add({ targets: [this.boardLayer, this.counterLayer], x: 2, duration: 35, yoyo: true, repeat: 2 });
  }

  shakeColumn(column) {
    if (!this.layout) return;
    this.highlightColumn(column, true);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.tweens.add({
      targets: this.columnHighlight,
      x: 6,
      duration: 45,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        if (this.columnHighlight) this.columnHighlight.x = 0;
      },
    });
  }

  createCounter(x, y, playerId, radius, scale) {
    const player = this.players.find((candidate) => candidate.id === playerId);
    const color = player?.counter?.color ?? 0xff5f45;
    const accent = player?.counter?.accent ?? 0xffffff;
    const container = this.add.container(x, y).setScale(scale);
    const shadow = this.add.circle(0, radius * 0.08, radius * 1.03, accent, 1);
    const disc = this.add.circle(0, 0, radius, color, 1);
    disc.setStrokeStyle(Math.max(3, radius * 0.12), accent, 1);
    const symbol = this.add.text(0, 1, player?.avatar ?? '', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: `${Math.max(12, radius * 0.6)}px`, fontStyle: '900', color: cssColor(this.palette.text) }).setOrigin(0.5);
    container.add([shadow, disc, symbol]);
    return container;
  }

  syncPalette() {
    const styles = getComputedStyle(document.documentElement);
    this.palette = {
      board: cssVarToNumber(styles, '--color-board'),
      boardDark: cssVarToNumber(styles, '--color-board-dark'),
      boardHover: cssVarToNumber(styles, '--color-board-hover'),
      slot: cssVarToNumber(styles, '--color-board-slot'),
      text: cssVarToNumber(styles, '--color-text-primary'),
      danger: cssVarToNumber(styles, '--color-danger'),
    };
  }

  isColumnFull(column) {
    return this.board?.[0]?.[column] !== EMPTY_CELL;
  }

  getCellCenter(row, column) {
    return {
      x: this.layout.originX + column * this.layout.cellSize + this.layout.cellSize / 2,
      y: this.layout.originY + row * this.layout.cellSize + this.layout.cellSize / 2,
    };
  }

  isWinningCell(row, column) {
    return this.winningCells.some(([winRow, winColumn]) => winRow === row && winColumn === column);
  }
}

function cssVarToNumber(styles, name) {
  return Number.parseInt(styles.getPropertyValue(name).trim().replace('#', ''), 16);
}

function cssColor(number) {
  return `#${number.toString(16).padStart(6, '0')}`;
}