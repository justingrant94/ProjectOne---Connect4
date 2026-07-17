import { BoardScene } from './BoardScene.js';

export function createPhaserBoard(parent) {
  if (!window.Phaser) throw new Error('Phaser failed to load. Check the CDN script in index.html.');
  const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-page-background').trim();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 720,
      height: 620,
    },
    transparent: true,
    scene: [BoardScene],
  });

  return {
    game,
    getBoardScene() {
      return game.scene.getScene('BoardScene');
    },
  };
}