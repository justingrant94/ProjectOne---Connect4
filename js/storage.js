import { COUNTER_STYLES, DEFAULT_TIMER_SECONDS, DIFFICULTIES, MATCH_FORMATS, ONBOARDING_KEY, PROGRESSION_KEY, STORAGE_KEY, THEMES } from './constants.js';

export function loadPreferences() {
  try {
    if (!hasLocalStorage()) return null;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return null;

    return {
      gameMode: saved.gameMode === 'pvc' ? 'pvc' : 'pvp',
      playerOneName: safeText(saved.playerOneName, 'Player 1'),
      playerTwoName: safeText(saved.playerTwoName, 'Player 2'),
      playerOneAvatar: safeText(saved.playerOneAvatar, 'J').slice(0, 2),
      playerTwoAvatar: safeText(saved.playerTwoAvatar, 'S').slice(0, 2),
      playerOneCounter: hasCounter(saved.playerOneCounter) ? saved.playerOneCounter : COUNTER_STYLES[0].id,
      playerTwoCounter: hasCounter(saved.playerTwoCounter) ? saved.playerTwoCounter : COUNTER_STYLES[1].id,
      matchFormat: MATCH_FORMATS[saved.matchFormat] ? saved.matchFormat : 'single',
      timerSeconds: [0, 10, 20, 30, 45, 60].includes(Number(saved.timerSeconds)) ? Number(saved.timerSeconds) : DEFAULT_TIMER_SECONDS,
      timeoutBehavior: saved.timeoutBehavior === 'auto' ? 'auto' : 'skip',
      difficulty: DIFFICULTIES[saved.difficulty] ? saved.difficulty : 'medium',
      theme: THEMES[saved.theme] ? saved.theme : 'classic',
    };
  } catch {
    return null;
  }
}

export function savePreferences(settings) {
  if (!hasLocalStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearPreferences() {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasCompletedOnboarding() {
  if (!hasLocalStorage()) return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'complete';
}

export function saveOnboardingPreference(skipNextTime) {
  if (!hasLocalStorage()) return;
  if (skipNextTime) localStorage.setItem(ONBOARDING_KEY, 'complete');
}

export function loadProgression() {
  try {
    if (!hasLocalStorage()) return createProgression();
    const saved = JSON.parse(localStorage.getItem(PROGRESSION_KEY));
    if (!saved || typeof saved !== 'object') return createProgression();
    const next = createProgression();

    for (const difficulty of Object.keys(DIFFICULTIES)) {
      next.byDifficulty[difficulty] = {
        ...next.byDifficulty[difficulty],
        ...(saved.byDifficulty?.[difficulty] ?? {}),
      };
    }

    next.highestDifficultyDefeated = typeof saved.highestDifficultyDefeated === 'string' ? saved.highestDifficultyDefeated : null;
    next.firstExpertVictory = Boolean(saved.firstExpertVictory);
    next.achievements = Array.isArray(saved.achievements) ? saved.achievements : [];
    next.totalCountersDropped = Number.isFinite(saved.totalCountersDropped) ? saved.totalCountersDropped : 0;
    next.openingColumns = Array.isArray(saved.openingColumns) ? saved.openingColumns : [];
    next.moveTimes = Array.isArray(saved.moveTimes) ? saved.moveTimes : [];
    next.longestGameMoves = Number.isFinite(saved.longestGameMoves) ? saved.longestGameMoves : 0;
    next.shortestGameMoves = Number.isFinite(saved.shortestGameMoves) ? saved.shortestGameMoves : 0;
    next.themeUnlocks = Array.isArray(saved.themeUnlocks) ? saved.themeUnlocks : ['classic', 'ocean'];
    return next;
  } catch {
    return createProgression();
  }
}

export function saveProgression(progression) {
  if (!hasLocalStorage()) return;
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
}

export function createProgression() {
  return {
    highestDifficultyDefeated: null,
    firstExpertVictory: false,
    achievements: [],
    totalCountersDropped: 0,
    openingColumns: [],
    moveTimes: [],
    longestGameMoves: 0,
    shortestGameMoves: 0,
    themeUnlocks: ['classic', 'ocean'],
    byDifficulty: Object.fromEntries(
      Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
        wins: 0,
        losses: 0,
        draws: 0,
        gamesPlayed: 0,
        currentStreak: 0,
        bestStreak: 0,
        promptDismissedAt: 0,
      }]),
    ),
  };
}

function safeText(value, fallback) {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function hasCounter(id) {
  return COUNTER_STYLES.some((counter) => counter.id === id);
}

function hasLocalStorage() {
  return typeof localStorage !== 'undefined';
}