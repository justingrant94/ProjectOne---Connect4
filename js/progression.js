import { DIFFICULTIES, THEMES } from './constants.js';
import { saveProgression } from './storage.js';

const difficultyRank = ['easy', 'medium', 'advanced', 'expert'];

export function recordComputerMatch(progression, difficulty, result) {
  const stats = progression.byDifficulty[difficulty];
  if (!stats) return [];

  const achievements = [];
  stats.gamesPlayed += 1;

  if (result === 'win') {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    progression.highestDifficultyDefeated = getHigherDifficulty(progression.highestDifficultyDefeated, difficulty);
    achievements.push(unlockAchievement(progression, 'First Win', 'Win your first Player vs Computer match.', difficulty));

    if (stats.currentStreak >= 3) {
      achievements.push(unlockAchievement(progression, 'Three-Win Streak', 'Win three matches in a row at one difficulty.', difficulty));
    }

    if (difficulty === 'expert') {
      if (!progression.firstExpertVictory) {
        progression.firstExpertVictory = true;
        achievements.push(unlockAchievement(progression, 'Expert Defeated', 'Beat the Grandmaster for the first time.', difficulty));
      }
      if (stats.wins >= 3) achievements.push(unlockAchievement(progression, 'Expert Mastery', 'Defeat Expert three times.', difficulty));
    }
  }

  if (result === 'loss') {
    stats.losses += 1;
    stats.currentStreak = 0;
  }

  if (result === 'draw') {
    stats.draws += 1;
    stats.currentStreak = 0;
  }

  saveProgression(progression);
  return achievements.filter(Boolean);
}

export function recordMoveStats(progression, { column, moveNumber, moveTimeMs }) {
  progression.totalCountersDropped += 1;
  if (moveNumber === 1) progression.openingColumns.push(column);
  if (Number.isFinite(moveTimeMs)) progression.moveTimes.push(moveTimeMs);
  saveProgression(progression);
}

export function recordGameLength(progression, moveCount) {
  progression.longestGameMoves = Math.max(progression.longestGameMoves, moveCount);
  progression.shortestGameMoves = progression.shortestGameMoves ? Math.min(progression.shortestGameMoves, moveCount) : moveCount;
  unlockThemes(progression);
  saveProgression(progression);
}

export function getPromotion(progression, difficulty) {
  const stats = progression.byDifficulty[difficulty];
  const nextDifficulty = difficultyRank[difficultyRank.indexOf(difficulty) + 1];
  if (!stats || !nextDifficulty) {
    if (difficulty === 'expert' && stats?.wins >= 3) {
      return { type: 'mastery', title: 'Expert mastered', copy: "You've defeated Expert three times. You've mastered the highest difficulty." };
    }
    return null;
  }

  const thresholds = [3, 5, 8];
  const nextThreshold = thresholds.find((threshold) => stats.wins >= threshold && stats.promptDismissedAt < threshold);
  if (!nextThreshold) return null;

  return {
    type: 'promotion',
    from: difficulty,
    to: nextDifficulty,
    title: `${DIFFICULTIES[nextDifficulty].label} unlocked`,
    copy: getPromotionCopy(difficulty, nextDifficulty),
    threshold: nextThreshold,
  };
}

export function dismissPromotion(progression, promotion) {
  if (!promotion?.from) return;
  progression.byDifficulty[promotion.from].promptDismissedAt = promotion.threshold;
  saveProgression(progression);
}

export function renderStats(progression) {
  const rows = Object.entries(DIFFICULTIES).map(([difficulty, config]) => {
    const stats = progression.byDifficulty[difficulty];
    return `<tr><th>${config.label}</th><td>${stats.wins}</td><td>${stats.losses}</td><td>${stats.draws}</td><td>${stats.bestStreak}</td></tr>`;
  }).join('');

  const totals = Object.values(progression.byDifficulty).reduce((summary, stats) => ({
    games: summary.games + stats.gamesPlayed,
    wins: summary.wins + stats.wins,
  }), { games: 0, wins: 0 });

  const winRate = totals.games ? Math.round((totals.wins / totals.games) * 100) : 0;
  const averageMoveTime = progression.moveTimes.length
    ? `${(progression.moveTimes.reduce((total, time) => total + time, 0) / progression.moveTimes.length / 1000).toFixed(1)}s`
    : 'Not enough data';
  const favouriteOpening = getFavouriteOpening(progression.openingColumns);
  const favouriteDifficulty = getFavouriteDifficulty(progression.byDifficulty);
  const unlockedThemes = progression.themeUnlocks.map((theme) => THEMES[theme]?.label).filter(Boolean).join(', ');

  return `
    <div class="stats-summary">
      <span>Total games <strong>${totals.games}</strong></span>
      <span>Total wins <strong>${totals.wins}</strong></span>
      <span>Win rate <strong>${winRate}%</strong></span>
      <span>Highest defeated <strong>${progression.highestDifficultyDefeated ?? 'None yet'}</strong></span>
      <span>Counters dropped <strong>${progression.totalCountersDropped}</strong></span>
      <span>Favourite opening <strong>${favouriteOpening}</strong></span>
      <span>Average move time <strong>${averageMoveTime}</strong></span>
      <span>Longest game <strong>${progression.longestGameMoves || 'None yet'} moves</strong></span>
      <span>Shortest game <strong>${progression.shortestGameMoves || 'None yet'} moves</strong></span>
      <span>Favourite difficulty <strong>${favouriteDifficulty}</strong></span>
      <span>Unlocked themes <strong>${unlockedThemes || 'Classic'}</strong></span>
    </div>
    <table class="stats-table">
      <thead><tr><th>Difficulty</th><th>Wins</th><th>Losses</th><th>Draws</th><th>Best streak</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function unlockThemes(progression) {
  const totalWins = Object.values(progression.byDifficulty).reduce((sum, stats) => sum + stats.wins, 0);
  const totalGames = Object.values(progression.byDifficulty).reduce((sum, stats) => sum + stats.gamesPlayed, 0);
  if (totalWins >= 10 && !progression.themeUnlocks.includes('forest')) progression.themeUnlocks.push('forest');
  if (progression.highestDifficultyDefeated === 'expert' && !progression.themeUnlocks.includes('night')) progression.themeUnlocks.push('night');
  if (totalGames >= 100 && !progression.themeUnlocks.includes('retro')) progression.themeUnlocks.push('retro');
}

function getFavouriteOpening(openingColumns) {
  if (!openingColumns.length) return 'None yet';
  const counts = openingColumns.reduce((summary, column) => ({ ...summary, [column]: (summary[column] ?? 0) + 1 }), {});
  const favourite = Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
  return `Column ${Number(favourite) + 1}`;
}

function getFavouriteDifficulty(statsByDifficulty) {
  const entries = Object.entries(statsByDifficulty).filter(([, stats]) => stats.gamesPlayed > 0);
  if (!entries.length) return 'None yet';
  const [difficulty] = entries.sort(([, a], [, b]) => b.gamesPlayed - a.gamesPlayed)[0];
  return DIFFICULTIES[difficulty].label;
}

function unlockAchievement(progression, title, description, difficulty) {
  if (progression.achievements.some((achievement) => achievement.title === title && achievement.difficulty === difficulty)) return null;
  const achievement = { title, description, difficulty, unlockedAt: new Date().toISOString() };
  progression.achievements.push(achievement);
  return achievement;
}

function getHigherDifficulty(current, candidate) {
  if (!current) return candidate;
  return difficultyRank.indexOf(candidate) > difficultyRank.indexOf(current) ? candidate : current;
}

function getPromotionCopy(from, to) {
  if (from === 'easy') return `You've beaten Easy three times. Ready to try ${DIFFICULTIES[to].label}?`;
  if (from === 'medium') return `You're handling Medium well. Ready for ${DIFFICULTIES[to].label}?`;
  return `You've proven yourself against Advanced. Ready to face ${DIFFICULTIES[to].label}?`;
}