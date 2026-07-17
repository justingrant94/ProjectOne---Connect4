export const ROWS = 6;
export const COLUMNS = 7;
export const EMPTY_CELL = 0;
export const PLAYER_ONE = 1;
export const PLAYER_TWO = 2;

export const TIMER_OPTIONS = [0, 10, 20, 30, 45, 60];
export const DEFAULT_TIMER_SECONDS = 20;

export const MATCH_FORMATS = {
  single: { label: 'Single game', targetWins: 1 },
  bestOfThree: { label: 'Best of three', targetWins: 2 },
  firstToTwo: { label: 'First to two wins', targetWins: 2 },
  firstToThree: { label: 'First to three wins', targetWins: 3 },
  firstToFive: { label: 'First to five wins', targetWins: 5 },
};

export const COUNTER_STYLES = [
  { id: 'yellow', label: 'Yellow', color: 0xf6c945, accent: 0xd69d1f, css: 'counter-yellow', symbol: 'Y' },
  { id: 'red', label: 'Red', color: 0xef654f, accent: 0xc94335, css: 'counter-red', symbol: 'R' },
  { id: 'orange', label: 'Orange', color: 0xf28a35, accent: 0xb85f1f, css: 'counter-orange', symbol: 'O' },
  { id: 'blue', label: 'Blue', color: 0x4d8bd8, accent: 0x2e66a4, css: 'counter-blue', symbol: 'B' },
  { id: 'purple', label: 'Purple', color: 0x8b6bd6, accent: 0x6247aa, css: 'counter-purple', symbol: 'P' },
  { id: 'pink', label: 'Pink', color: 0xf07aa6, accent: 0xc4527e, css: 'counter-pink', symbol: 'P' },
  { id: 'turquoise', label: 'Turquoise', color: 0x42bfb2, accent: 0x287f77, css: 'counter-turquoise', symbol: 'T' },
  { id: 'white', label: 'White', color: 0xf8f3e7, accent: 0xc9c0aa, css: 'counter-white', symbol: 'W' },
];

export const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    name: 'Rookie',
    avatar: '🤖',
    description: 'Perfect for learning the game.',
    personality: 'Relaxed and forgiving.',
    thinking: 'Rookie is choosing a move',
    victory: 'Rookie takes the round.',
    depth: 1,
    randomness: 0.74,
    timeBudget: 180,
  },
  medium: {
    label: 'Medium',
    name: 'Challenger',
    avatar: '🎯',
    description: 'A balanced opponent that notices threats.',
    personality: 'Balanced challenge.',
    thinking: 'Challenger is looking ahead',
    victory: 'Challenger spotted the chance.',
    depth: 3,
    randomness: 0.18,
    timeBudget: 420,
  },
  advanced: {
    label: 'Advanced',
    name: 'Strategist',
    avatar: '♟',
    description: 'A strategic opponent that plans ahead.',
    personality: 'Plans ahead.',
    thinking: 'Strategist is planning ahead',
    victory: 'Strategist found the line.',
    depth: 5,
    randomness: 0.04,
    timeBudget: 850,
  },
  expert: {
    label: 'Expert',
    name: 'Grandmaster',
    avatar: '👑',
    description: 'An elite opponent designed to punish mistakes.',
    personality: 'Extremely difficult.',
    thinking: 'Grandmaster is analysing',
    victory: 'Grandmaster closes the board.',
    depth: 7,
    randomness: 0,
    timeBudget: 1400,
  },
};

export const THEMES = {
  classic: {
    label: 'Classic',
    className: 'theme-classic',
    unlock: 'Available now',
  },
  forest: {
    label: 'Forest',
    className: 'theme-forest',
    unlock: '10 wins',
  },
  ocean: {
    label: 'Ocean',
    className: 'theme-ocean',
    unlock: 'Available now',
  },
  night: {
    label: 'Night',
    className: 'theme-night',
    unlock: 'Expert defeated',
  },
  retro: {
    label: 'Retro Arcade',
    className: 'theme-retro',
    unlock: '100 games',
  },
};

export const STORAGE_KEY = 'connect4-arcade-state-v1';
export const PROGRESSION_KEY = 'connect4-arcade-progression-v1';
export const ONBOARDING_KEY = 'connect4-arcade-onboarding-v1';