import { COUNTER_STYLES, DEFAULT_TIMER_SECONDS, DIFFICULTIES, MATCH_FORMATS, PLAYER_ONE, PLAYER_TWO, THEMES } from './js/constants.js';
import { createBoard, findWinner, getOpponent, getValidColumns, isDraw, placeCounter } from './js/rules.js';
import { createPhaserBoard } from './js/phaser/game.js';
import { clearPreferences, hasCompletedOnboarding, loadPreferences, loadProgression, saveOnboardingPreference, savePreferences } from './js/storage.js';
import { dismissPromotion, getPromotion, recordComputerMatch, recordGameLength, recordMoveStats, renderStats } from './js/progression.js';
import { requestComputerMove } from './js/ai/search.js';

const elements = {};
let boardApi = null;
let progression = loadProgression();
let activeAiToken = null;
let timerFrame = null;
let currentPromotion = null;
let audioContext = null;
let musicInterval = null;
let pendingConfirmAction = null;
let confirmPausedTimer = false;
let confirmPreviousLock = false;

const state = {
  screen: 'setup',
  board: createBoard(),
  players: [],
  activePlayer: PLAYER_ONE,
  locked: true,
  scores: { [PLAYER_ONE]: 0, [PLAYER_TWO]: 0 },
  draws: 0,
  round: 1,
  targetWins: 1,
  gameMode: 'pvp',
  difficulty: 'medium',
  theme: 'classic',
  selectedColumn: 3,
  turnStartedAt: 0,
  soundEnabled: false,
  musicEnabled: false,
  timerSeconds: DEFAULT_TIMER_SECONDS,
  timeoutBehavior: 'skip',
  winner: null,
  matchWinner: null,
  winningCells: [],
  paused: false,
  aiThinking: false,
  moveCount: 0,
  matchStartedAt: 0,
  lastAchievements: [],
  timer: {
    remainingMs: DEFAULT_TIMER_SECONDS * 1000,
    endsAt: 0,
    timeoutFired: false,
  },
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheElements();
  populateSetupControls();
  applySavedPreferences();
  bindEvents();
  boardApi = createPhaserBoard('phaserBoard');
  renderSetupPreview();
  validateSetup();
  applyTheme(state.theme);
  if (hasCompletedOnboarding()) hide(elements.onboardingScreen);
}

function cacheElements() {
  for (const id of [
    'setupScreen', 'gameScreen', 'setupForm', 'playerOneName', 'playerTwoName', 'playerOneAvatar', 'playerTwoAvatar',
    'playerOneCounter', 'playerTwoCounter', 'matchFormat', 'timerSeconds', 'timeoutBehavior', 'difficulty', 'setupPreview',
    'setupError', 'startGameButton', 'clearSaveButton', 'matchModeLabel', 'matchTitle', 'scoreStrip', 'playerOneCard',
    'playerTwoCard', 'turnMessage', 'difficultyBadge', 'countdownWrap', 'timerProgress', 'timerNumber', 'finalCount',
    'pauseButton', 'resumeButton', 'pauseModal', 'roundModal', 'roundKicker', 'roundResultTitle', 'roundResultCopy',
    'nextRoundButton', 'rematchButton', 'newPlayersButton', 'resetMatchButton', 'returnSetupButton', 'liveRegion',
    'achievementRow', 'openStatsButton', 'statsModal', 'statsContent', 'closeStatsButton', 'restartRoundButton',
    'soundButton', 'musicButton', 'paletteButton', 'colourPanel', 'paletteOne', 'paletteTwo', 'colourError', 'phaserBoard',
    'onboardingScreen', 'skipOnboarding', 'themeSelect', 'themeButton', 'themePanel', 'confirmModal', 'confirmKicker',
    'confirmTitle', 'confirmCopy', 'confirmAcceptButton', 'confirmCancelButton',
  ]) {
    elements[id] = document.getElementById(id);
  }
}

function populateSetupControls() {
  elements.playerOneCounter.value = COUNTER_STYLES[0].id;
  elements.playerTwoCounter.value = COUNTER_STYLES[1].id;
  elements.difficulty.innerHTML = Object.entries(DIFFICULTIES).map(([id, difficulty]) => `<option value="${id}">${difficulty.label} - ${difficulty.description}</option>`).join('');
  elements.themeSelect.innerHTML = Object.entries(THEMES).map(([id, theme]) => `<option value="${id}">${theme.label}</option>`).join('');
  renderPaletteControls();
  renderThemeControls();
}

function applySavedPreferences() {
  const saved = loadPreferences();
  if (!saved) return;

  document.querySelector(`input[name="gameMode"][value="${saved.gameMode}"]`).checked = true;
  elements.playerOneName.value = saved.playerOneName;
  elements.playerTwoName.value = saved.playerTwoName;
  elements.playerOneAvatar.value = saved.playerOneAvatar;
  elements.playerTwoAvatar.value = saved.playerTwoAvatar;
  elements.playerOneCounter.value = saved.playerOneCounter;
  elements.playerTwoCounter.value = saved.playerTwoCounter;
  elements.matchFormat.value = saved.matchFormat;
  elements.timerSeconds.value = String(saved.timerSeconds);
  elements.timeoutBehavior.value = saved.timeoutBehavior;
  elements.difficulty.value = saved.difficulty;
  elements.themeSelect.value = saved.theme;
  state.theme = saved.theme;
  toggleDifficultyField();
}

function bindEvents() {
  elements.setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    startMatch();
  });

  elements.setupForm.addEventListener('input', () => {
    toggleDifficultyField();
    renderSetupPreview();
    validateSetup();
  });

  elements.clearSaveButton.addEventListener('click', () => {
    showConfirmModal({
      title: 'Clear saved setup?',
      copy: 'Your saved names, mode, timer, and theme choices will be removed.',
      confirmLabel: 'Clear',
      onConfirm: () => {
        clearPreferences();
        elements.setupError.textContent = 'Saved setup cleared.';
      },
    });
  });

  elements.pauseButton.addEventListener('click', pauseMatch);
  elements.resumeButton.addEventListener('click', resumeMatch);
  elements.restartRoundButton.addEventListener('click', confirmRestartRound);
  elements.resetMatchButton.addEventListener('click', confirmResetMatch);
  elements.returnSetupButton.addEventListener('click', confirmReturnToSetup);
  elements.paletteButton.addEventListener('click', toggleColourPanel);
  elements.themeButton.addEventListener('click', toggleThemePanel);
  elements.soundButton.addEventListener('click', () => toggleAudioButton('sound'));
  elements.musicButton.addEventListener('click', () => toggleAudioButton('music'));
  elements.onboardingScreen.addEventListener('click', () => dismissOnboarding());
  elements.nextRoundButton.addEventListener('click', handleNextRound);
  elements.rematchButton.addEventListener('click', () => resetMatch(true));
  elements.newPlayersButton.addEventListener('click', returnToSetup);
  elements.openStatsButton.addEventListener('click', showStats);
  elements.closeStatsButton.addEventListener('click', () => hide(elements.statsModal));
  elements.confirmAcceptButton.addEventListener('click', () => closeConfirmModal(true));
  elements.confirmCancelButton.addEventListener('click', () => closeConfirmModal(false));

  window.addEventListener('connect4:board-ready', renderPhaserBoard);
  window.addEventListener('connect4:column-select', (event) => handleColumnSelect(event.detail.column));
  window.addEventListener('connect4:column-full', (event) => showInvalidColumn(event.detail.column));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === 'game' && !state.paused && !state.matchWinner && !state.winner) pauseMatch();
  });
  document.addEventListener('keydown', handleKeyboardPlay);
}

function startMatch() {
  const settings = readSetup();
  const setupError = validateSetup(settings);
  if (setupError) return;

  state.gameMode = settings.gameMode;
  state.difficulty = settings.difficulty;
  state.timerSeconds = settings.timerSeconds;
  state.timeoutBehavior = settings.timeoutBehavior;
  state.theme = settings.theme;
  state.targetWins = MATCH_FORMATS[settings.matchFormat].targetWins;
  state.players = createPlayers(settings);
  state.matchStartedAt = Date.now();
  savePreferences(settings);
  applyTheme(state.theme);
  resetMatchState();
  show(elements.gameScreen);
  hide(elements.setupScreen);
  state.screen = 'game';
  announce('Match started.');
  startTurn();
}

function createPlayers(settings) {
  const computer = DIFFICULTIES[settings.difficulty];
  return [
    {
      id: PLAYER_ONE,
      name: cleanName(settings.playerOneName, 'Player 1'),
      avatar: cleanAvatar(settings.playerOneAvatar, 'J'),
      counter: getCounter(settings.playerOneCounter),
      type: 'human',
    },
    {
      id: PLAYER_TWO,
      name: settings.gameMode === 'pvc' ? computer.name : cleanName(settings.playerTwoName, 'Player 2'),
      avatar: settings.gameMode === 'pvc' ? computer.avatar : cleanAvatar(settings.playerTwoAvatar, 'S'),
      counter: getCounter(settings.playerTwoCounter),
      type: settings.gameMode === 'pvc' ? 'computer' : 'human',
    },
  ];
}

function resetMatchState() {
  state.board = createBoard();
  state.activePlayer = PLAYER_ONE;
  state.locked = false;
  state.scores = { [PLAYER_ONE]: 0, [PLAYER_TWO]: 0 };
  state.draws = 0;
  state.round = 1;
  state.winner = null;
  state.matchWinner = null;
  state.winningCells = [];
  state.paused = false;
  state.aiThinking = false;
  state.moveCount = 0;
  state.selectedColumn = 3;
  state.lastAchievements = [];
  state.timer.remainingMs = state.timerSeconds * 1000;
  state.timer.timeoutFired = false;
  hide(elements.roundModal);
  hide(elements.pauseModal);
  hide(elements.confirmModal);
}

function startTurn() {
  cancelTimer();
  if (state.winner || state.matchWinner || state.paused) return;

  window.connect4ActivePlayerId = state.activePlayer;
  const player = getActivePlayer();
  state.locked = player.type === 'computer';
  state.aiThinking = player.type === 'computer';
  state.turnStartedAt = performance.now();
  render();

  if (player.type === 'computer') runComputerTurn(player);
  else startTimer(true);
}

function handleColumnSelect(column) {
  if (state.screen !== 'game' || state.locked || state.paused || state.winner || state.matchWinner) return;
  if (getActivePlayer().type !== 'human') return;
  makeMove(column);
}

function makeMove(column) {
  const player = getActivePlayer();
  const move = placeCounter(state.board, column, player.id);
  if (!move) {
    showInvalidColumn(column);
    return;
  }

  cancelTimer();
  recordMoveStats(progression, { column, moveNumber: state.moveCount + 1, moveTimeMs: performance.now() - state.turnStartedAt });
  state.locked = true;
  state.aiThinking = false;
  state.moveCount += 1;
  render();
  announce(`${player.name} placed a counter in column ${column + 1}.`);

  const scene = boardApi.getBoardScene();
  scene.animateMove(move, () => {
    playTone(160 + Math.random() * 70, 0.05, 'triangle');
    state.board = move.board;
    finishMove(player);
  });
}

function finishMove(player) {
  const winner = findWinner(state.board);
  if (winner) {
    state.winner = winner.playerId;
    state.winningCells = winner.cells;
    state.scores[winner.playerId] += 1;
    state.matchWinner = state.scores[winner.playerId] >= state.targetWins ? winner.playerId : null;
    state.locked = true;
    recordGameLength(progression, state.moveCount);
    handleRoundComplete(`${player.name} wins the round.`);
    return;
  }

  if (isDraw(state.board)) {
    state.draws += 1;
    state.locked = true;
    recordGameLength(progression, state.moveCount);
    handleRoundComplete('The round ends in a draw.');
    return;
  }

  state.activePlayer = getOpponent(state.activePlayer);
  startTurn();
}

function handleRoundComplete(copy) {
  cancelTimer();
  render();
  boardApi.getBoardScene().pulseWin();

  let title = 'Round complete';
  let kicker = 'Round result';
  state.lastAchievements = [];

  if (state.matchWinner) {
    const winner = getPlayer(state.matchWinner);
    const expertWin = state.gameMode === 'pvc' && state.matchWinner === PLAYER_ONE && state.difficulty === 'expert';
    title = expertWin ? 'EXPERT DEFEATED' : `${winner.name} is champion`;
    kicker = expertWin ? 'First-class victory' : 'Match champion';
    if (state.gameMode === 'pvc') {
      const result = state.matchWinner === PLAYER_ONE ? 'win' : 'loss';
      state.lastAchievements = recordComputerMatch(progression, state.difficulty, result);
      currentPromotion = getPromotion(progression, state.difficulty);
    }
  }

  showRoundModal(kicker, title, copy);
}

function showRoundModal(kicker, title, copy) {
  elements.roundKicker.textContent = kicker;
  elements.roundResultTitle.textContent = title;
  elements.roundResultCopy.textContent = currentPromotion ? `${copy} ${currentPromotion.copy}` : copy;
  elements.nextRoundButton.textContent = state.matchWinner ? (currentPromotion?.type === 'promotion' ? `Move to ${DIFFICULTIES[currentPromotion.to].label}` : 'Play Again') : 'Next Round';
  elements.achievementRow.innerHTML = state.lastAchievements.map((achievement) => `<span class="achievement">${achievement.title}</span>`).join('');
  show(elements.roundModal);
}

function handleNextRound() {
  if (currentPromotion?.type === 'promotion') {
    elements.difficulty.value = currentPromotion.to;
    dismissPromotion(progression, currentPromotion);
    currentPromotion = null;
    startMatch();
    return;
  }

  if (state.matchWinner) resetMatch(true);
  else resetRound();
}

function resetRound(advanceRound = true) {
  if (advanceRound) state.round += 1;
  state.board = createBoard();
  state.activePlayer = advanceRound && state.round % 2 === 0 ? PLAYER_TWO : PLAYER_ONE;
  state.winner = null;
  state.matchWinner = null;
  state.winningCells = [];
  state.locked = false;
  state.moveCount = 0;
  hide(elements.roundModal);
  startTurn();
}

function resetMatch(keepPlayers) {
  currentPromotion = null;
  cancelAiTurn();
  resetMatchState();
  hide(elements.roundModal);
  if (!keepPlayers) announce('Match reset.');
  startTurn();
}

function returnToSetup() {
  cancelAiTurn();
  cancelTimer();
  stopMusic();
  hide(elements.gameScreen);
  hide(elements.roundModal);
  hide(elements.pauseModal);
  hide(elements.confirmModal);
  show(elements.setupScreen);
  state.screen = 'setup';
  state.locked = true;
}

function runComputerTurn(player) {
  cancelAiTurn();
  const token = { cancelled: false, id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()) };
  activeAiToken = token;
  const config = DIFFICULTIES[state.difficulty];
  announce(`${config.thinking}...`);

  requestComputerMove({
    board: state.board,
    computerId: player.id,
    humanId: PLAYER_ONE,
    difficulty: state.difficulty,
    config,
    token,
  }).then((column) => {
    if (token.cancelled || state.paused || state.winner || state.matchWinner || state.activePlayer !== player.id) return;
    const fallback = getValidColumns(state.board)[0];
    makeMove(column ?? fallback);
  });
}

function cancelAiTurn() {
  if (activeAiToken) activeAiToken.cancelled = true;
  activeAiToken = null;
  state.aiThinking = false;
}

function startTimer(reset) {
  cancelTimer();
  if (state.timerSeconds === 0) {
    state.timer.remainingMs = 0;
    renderCountdown();
    return;
  }

  if (reset) state.timer.remainingMs = state.timerSeconds * 1000;
  state.timer.timeoutFired = false;
  state.timer.endsAt = performance.now() + state.timer.remainingMs;

  const tick = () => {
    state.timer.remainingMs = Math.max(0, state.timer.endsAt - performance.now());
    renderCountdown();

    if (state.timer.remainingMs <= 0 && !state.timer.timeoutFired) {
      state.timer.timeoutFired = true;
      handleTimeout();
      return;
    }

    timerFrame = requestAnimationFrame(tick);
  };

  tick();
}

function cancelTimer() {
  if (timerFrame) cancelAnimationFrame(timerFrame);
  timerFrame = null;
}

function handleTimeout() {
  cancelTimer();
  if (state.locked || state.paused || state.winner || state.matchWinner) return;
  const player = getActivePlayer();
  state.locked = true;

  if (state.timeoutBehavior === 'auto') {
    const validColumns = getValidColumns(state.board);
    const column = validColumns[Math.floor(Math.random() * validColumns.length)];
    announce(`${player.name} ran out of time. Automatic move selected.`);
    makeMove(column);
    return;
  }

  state.activePlayer = getOpponent(state.activePlayer);
  announce(`${player.name} ran out of time. Turn skipped.`);
  setTimeout(startTurn, 650);
}

function pauseMatch() {
  if (state.screen !== 'game' || state.paused || state.winner || state.matchWinner) return;
  state.paused = true;
  state.locked = true;
  cancelTimer();
  cancelAiTurn();
  show(elements.pauseModal);
  render();
}

function resumeMatch() {
  state.paused = false;
  hide(elements.pauseModal);
  startTurn();
}

function render() {
  renderHud();
  renderPlayerCards();
  renderCountdown();
  updatePaletteControls();
  renderPhaserBoard();
}

function renderHud() {
  const active = getActivePlayer();
  const mode = state.gameMode === 'pvc' ? `Player vs Computer - ${DIFFICULTIES[state.difficulty].label}` : 'Player vs Player';
  const ultimate = state.targetWins > 1 && state.scores[PLAYER_ONE] === state.targetWins - 1 && state.scores[PLAYER_TWO] === state.targetWins - 1;
  const decidingMessage = ultimate ? 'Next winner wins' : `First to ${state.targetWins} wins`;
  elements.matchModeLabel.textContent = ultimate ? 'Ultimate Game - next winner wins' : mode;
  elements.matchTitle.textContent = ultimate ? `Final Round ${state.round}` : `Round ${state.round}`;
  elements.scoreStrip.innerHTML = `<strong>${escapeHtml(getPlayer(PLAYER_ONE).name)} ${state.scores[PLAYER_ONE]}</strong><span>${decidingMessage}${state.draws ? ` - Draws ${state.draws}` : ''}</span><strong>${state.scores[PLAYER_TWO]} ${escapeHtml(getPlayer(PLAYER_TWO).name)}</strong>`;
  const difficulty = DIFFICULTIES[state.difficulty];
  elements.turnMessage.textContent = state.aiThinking ? `${difficulty.thinking}...` : `${active.name}'s turn - choose a column.${ultimate ? ' Next winner wins.' : ''}`;
  elements.turnMessage.dataset.counter = active.counter.id;
  elements.difficultyBadge.textContent = state.gameMode === 'pvc' ? DIFFICULTIES[state.difficulty].label : '';
  elements.gameScreen.classList.toggle('ultimate-mode', ultimate);
}

function renderPlayerCards() {
  for (const player of state.players) {
    const element = player.id === PLAYER_ONE ? elements.playerOneCard : elements.playerTwoCard;
    const active = state.activePlayer === player.id && !state.winner && !state.matchWinner;
    const opponent = getPlayer(getOpponent(player.id));
    const isLeader = state.scores[player.id] > state.scores[opponent.id];
    const isTied = state.scores[player.id] === state.scores[opponent.id];
    element.className = `player-card ${active ? 'active' : ''} ${isLeader ? 'leading' : ''} ${isTied ? 'tied' : ''} ${player.counter.css}`;
    element.innerHTML = `
      <div class="avatar ${player.counter.css}">${escapeHtml(player.avatar)}</div>
      <div>
        <p class="eyebrow">${player.type === 'computer' ? DIFFICULTIES[state.difficulty].label : active ? 'On turn' : 'Player'}</p>
        <h3>${escapeHtml(player.name)}</h3>
        <p><strong>${state.scores[player.id]} wins</strong> <span class="score-status">${isLeader ? 'Leading' : isTied ? 'Tied' : 'Chasing'}</span> ${state.scores[player.id] === state.targetWins - 1 && state.targetWins > 1 ? '<span class="match-point">Match point</span>' : ''}</p>
      </div>
      <span class="mini-counter ${player.counter.css}" aria-hidden="true"></span>
    `;
  }
}

function renderCountdown() {
  const active = getActivePlayer();
  const hasTimer = state.timerSeconds > 0 && active?.type === 'human' && state.screen === 'game';
  elements.countdownWrap.classList.toggle('timer-off', !hasTimer);
  if (!hasTimer) {
    elements.timerNumber.textContent = '∞';
    elements.finalCount.textContent = '';
    elements.timerProgress.style.strokeDashoffset = 0;
    return;
  }

  const seconds = Math.ceil(state.timer.remainingMs / 1000);
  const progress = state.timer.remainingMs / (state.timerSeconds * 1000);
  const circumference = 2 * Math.PI * 52;
  elements.timerProgress.style.strokeDasharray = circumference;
  elements.timerProgress.style.strokeDashoffset = circumference * (1 - progress);
  elements.timerNumber.textContent = String(seconds);
  elements.countdownWrap.dataset.intensity = seconds <= 3 ? 'critical' : seconds <= 5 ? 'urgent' : seconds <= 10 ? 'warning' : 'calm';
  elements.finalCount.textContent = seconds <= 3 && seconds > 0 ? String(seconds) : '';
}

function renderPhaserBoard() {
  const scene = boardApi?.getBoardScene?.();
  if (!scene?.setState || !state.players.length) return;
  scene.setState({ board: state.board, players: state.players, locked: state.locked || state.paused || Boolean(state.winner), winningCells: state.winningCells });
}

function renderSetupPreview() {
  const settings = readSetup();
  const players = createPlayers(settings);
  elements.setupPreview.innerHTML = players.map((player) => `
    <article class="preview-card">
      <span class="avatar ${player.counter.css}">${escapeHtml(player.avatar)}</span>
      <div><strong>${escapeHtml(player.name)}</strong><small>${player.type === 'computer' ? DIFFICULTIES[settings.difficulty].description : 'Ready to play'}</small></div>
      <span class="mini-counter ${player.counter.css}"></span>
    </article>
  `).join('');
}

function validateSetup(settings = readSetup()) {
  const playerOneName = settings.playerOneName.trim();
  const playerTwoName = settings.playerTwoName.trim();
  let error = '';

  if (!playerOneName && settings.gameMode === 'pvc') error = 'Add your player name before starting.';
  if (!playerOneName && !playerTwoName && settings.gameMode === 'pvp') error = 'At least one player needs a name.';
  if (settings.playerOneCounter === settings.playerTwoCounter) error = 'Choose different counter styles so players are easy to tell apart.';

  elements.setupError.textContent = error;
  elements.startGameButton.disabled = Boolean(error);
  return error;
}

function readSetup() {
  return {
    gameMode: document.querySelector('input[name="gameMode"]:checked').value,
    playerOneName: elements.playerOneName.value,
    playerTwoName: elements.playerTwoName.value,
    playerOneAvatar: elements.playerOneAvatar.value,
    playerTwoAvatar: elements.playerTwoAvatar.value,
    playerOneCounter: elements.playerOneCounter.value,
    playerTwoCounter: elements.playerTwoCounter.value,
    matchFormat: elements.matchFormat.value,
    timerSeconds: Number(elements.timerSeconds.value),
    timeoutBehavior: elements.timeoutBehavior.value,
    difficulty: elements.difficulty.value,
    theme: elements.themeSelect.value,
  };
}

function toggleDifficultyField() {
  const isPvc = document.querySelector('input[name="gameMode"]:checked').value === 'pvc';
  document.body.classList.toggle('pvc-selected', isPvc);
  document.body.classList.toggle('pvp-selected', !isPvc);
}

function showStats() {
  elements.statsContent.innerHTML = renderStats(progression);
  show(elements.statsModal);
}

function confirmRestartRound() {
  showConfirmModal({
    title: 'Restart this round?',
    copy: 'The current board will be cleared and this round will start again.',
    confirmLabel: 'Restart',
    onConfirm: () => resetRound(false),
  });
}

function confirmResetMatch() {
  showConfirmModal({
    title: 'Reset the match?',
    copy: 'Scores and the current board will be reset.',
    confirmLabel: 'Reset',
    onConfirm: () => resetMatch(false),
  });
}

function confirmReturnToSetup() {
  showConfirmModal({
    title: 'Return to the menu?',
    copy: 'The current match will end and you will go back to setup.',
    confirmLabel: 'Menu',
    onConfirm: returnToSetup,
  });
}

function showConfirmModal({ kicker = 'Confirm', title, copy, confirmLabel = 'OK', cancelLabel = 'Cancel', onConfirm }) {
  pendingConfirmAction = onConfirm;
  confirmPreviousLock = state.locked;
  confirmPausedTimer = state.screen === 'game' && !state.paused && !state.winner && !state.matchWinner;

  if (confirmPausedTimer) {
    cancelTimer();
    state.locked = true;
    renderPhaserBoard();
  }

  elements.confirmKicker.textContent = kicker;
  elements.confirmTitle.textContent = title;
  elements.confirmCopy.textContent = copy;
  elements.confirmAcceptButton.textContent = confirmLabel;
  elements.confirmCancelButton.textContent = cancelLabel;
  show(elements.confirmModal);
  elements.confirmCancelButton.focus();
}

function closeConfirmModal(confirmed) {
  const action = pendingConfirmAction;
  const shouldResumeTimer = confirmPausedTimer;
  pendingConfirmAction = null;
  confirmPausedTimer = false;
  hide(elements.confirmModal);

  if (confirmed && action) {
    action();
    return;
  }

  if (shouldResumeTimer && state.screen === 'game' && !state.paused && !state.winner && !state.matchWinner) {
    state.locked = confirmPreviousLock;
    startTimer(false);
    renderPhaserBoard();
  }
}

function handleKeyboardPlay(event) {
  if (!elements.confirmModal.classList.contains('hidden')) {
    if (event.key === 'Escape') closeConfirmModal(false);
    return;
  }

  if (state.screen !== 'game') return;
  const column = Number(event.key) - 1;
  if (column >= 0 && column <= 6) handleColumnSelect(column);
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const current = Number(elements.phaserBoard.dataset.focusedColumn ?? state.selectedColumn);
    const next = Math.max(0, Math.min(6, current + (event.key === 'ArrowRight' ? 1 : -1)));
    state.selectedColumn = next;
    elements.phaserBoard.dataset.focusedColumn = String(next);
    boardApi?.getBoardScene?.().showPreview(next, true);
    announce(`Column ${next + 1} selected.`);
  }
  if (event.key === 'Enter' || event.key === ' ') {
    const selected = Number(elements.phaserBoard.dataset.focusedColumn ?? 3);
    handleColumnSelect(selected);
  }
  if (event.key === 'Escape') {
    if (!elements.pauseModal.classList.contains('hidden')) resumeMatch();
    else confirmReturnToSetup();
  }
  if (event.key.toLowerCase() === 'r') confirmRestartRound();
  if (event.key.toLowerCase() === 'p') (state.paused ? resumeMatch() : pauseMatch());
  if (event.key.toLowerCase() === 'm') toggleAudioButton('sound');
}

function renderPaletteControls() {
  const renderButtons = (playerId) => COUNTER_STYLES.map((counter) => `<button class="palette-swatch ${counter.css}" type="button" data-player="${playerId}" data-counter="${counter.id}" aria-label="Set ${playerId === PLAYER_ONE ? 'Player 1' : 'Player 2'} counter to ${counter.label}">${counter.label}</button>`).join('');
  elements.paletteOne.innerHTML = `<span>Player 1</span>${renderButtons(PLAYER_ONE)}`;
  elements.paletteTwo.innerHTML = `<span>Player 2</span>${renderButtons(PLAYER_TWO)}`;
  elements.colourPanel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-counter]');
    if (!button) return;
    changeCounterColour(Number(button.dataset.player), button.dataset.counter);
  });
  updatePaletteControls();
}

function updatePaletteControls() {
  if (!state.players.length || !elements.paletteOne || !elements.paletteTwo) return;

  for (const button of elements.colourPanel.querySelectorAll('[data-counter]')) {
    const playerId = Number(button.dataset.player);
    const player = getPlayer(playerId);
    const opponent = getPlayer(getOpponent(playerId));
    const isSelected = player.counter.id === button.dataset.counter;
    const isUnavailable = opponent.counter.id === button.dataset.counter;
    button.disabled = isUnavailable;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.title = isUnavailable ? 'Already selected by the other player' : `Use ${button.textContent}`;
  }
}

function toggleColourPanel() {
  const isHidden = elements.colourPanel.classList.toggle('hidden');
  elements.paletteButton.setAttribute('aria-expanded', String(!isHidden));
}

function renderThemeControls() {
  elements.themePanel.innerHTML = Object.entries(THEMES).map(([id, theme]) => {
    const unlocked = progression.themeUnlocks.includes(id);
    return `<button class="theme-choice" type="button" data-theme="${id}" ${unlocked ? '' : 'disabled'}>${theme.label}<small>${unlocked ? 'Unlocked' : theme.unlock}</small></button>`;
  }).join('');
  elements.themePanel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (!button || button.disabled) return;
    state.theme = button.dataset.theme;
    elements.themeSelect.value = state.theme;
    applyTheme(state.theme);
    renderPhaserBoard();
  });
}

function toggleThemePanel() {
  const isHidden = elements.themePanel.classList.toggle('hidden');
  elements.themeButton.setAttribute('aria-expanded', String(!isHidden));
}

function applyTheme(themeId) {
  for (const theme of Object.values(THEMES)) document.body.classList.remove(theme.className);
  document.body.classList.add(THEMES[themeId]?.className ?? THEMES.classic.className);
}

function changeCounterColour(playerId, counterId) {
  const otherPlayer = getPlayer(getOpponent(playerId));
  if (otherPlayer.counter.id === counterId) {
    elements.colourError.textContent = 'Players need different counter colours.';
    announce('Players need different counter colours.');
    return;
  }

  const player = getPlayer(playerId);
  player.counter = getCounter(counterId);
  elements.colourError.textContent = '';
  render();
  announce(`${player.name} counter changed to ${player.counter.label}.`);
}

function showInvalidColumn(column) {
  announce('Column full - choose another.');
  elements.turnMessage.textContent = 'Column full - choose another.';
  boardApi?.getBoardScene?.().shakeColumn(column);
}

function toggleAudioButton(type) {
  if (type === 'sound') state.soundEnabled = !state.soundEnabled;
  if (type === 'music') state.musicEnabled = !state.musicEnabled;
  elements.soundButton.setAttribute('aria-pressed', String(state.soundEnabled));
  elements.musicButton.setAttribute('aria-pressed', String(state.musicEnabled));
  elements.soundButton.textContent = `Sound ${state.soundEnabled ? 'On' : 'Off'}`;
  elements.musicButton.textContent = `Music ${state.musicEnabled ? 'On' : 'Off'}`;

  if (type === 'music') {
    if (state.musicEnabled) startMusic();
    else stopMusic();
    return;
  }

  playTone(440, 0.06, 'sine');
}

function playTone(frequency, duration, type) {
  if (!state.soundEnabled) return;
  const context = getAudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.045;
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
}

function getAudioContext() {
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function startMusic() {
  const context = getAudioContext();
  stopMusic();
  const notes = [196, 247, 294, 247, 220, 262, 330, 262];
  let step = 0;

  const playMusicNote = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.028, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.45);
    step += 1;
  };

  playMusicNote();
  musicInterval = setInterval(playMusicNote, 460);
}

function stopMusic() {
  if (musicInterval) clearInterval(musicInterval);
  musicInterval = null;
}

function dismissOnboarding() {
  saveOnboardingPreference(elements.skipOnboarding.checked);
  hide(elements.onboardingScreen);
}

function getActivePlayer() {
  return getPlayer(state.activePlayer);
}

function getPlayer(playerId) {
  return state.players.find((player) => player.id === playerId);
}

function getCounter(counterId) {
  return COUNTER_STYLES.find((counter) => counter.id === counterId) ?? COUNTER_STYLES[0];
}

function cleanName(value, fallback) {
  return String(value ?? '').trim().slice(0, 18) || fallback;
}

function cleanAvatar(value, fallback) {
  return String(value ?? '').trim().slice(0, 2) || fallback;
}

function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

function announce(message) {
  elements.liveRegion.textContent = message;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;',
  }[character]));
}