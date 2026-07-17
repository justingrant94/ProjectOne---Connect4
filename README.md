# Connect Four Arcade

Connect Four Arcade is a modern revamp of the original vanilla JavaScript Connect Four project. The original version proved the core game idea: generate a grid, drop counters into columns, alternate turns and detect four-in-a-row wins. This version keeps that foundation but restructures the project into a more scalable browser game with a Phaser-powered board and clean HTML controls.

## Why This Approach

The revamp uses a hybrid architecture:

- Phaser handles the game-feel layer: board rendering, hit zones, counter drops, hover previews, win pulses and responsive canvas sizing.
- HTML, CSS and JavaScript handle setup, settings, player cards, match controls, modals, statistics and accessibility-heavy UI.

This was chosen over a full Unity rebuild because the project is still a frontend portfolio piece. Unity WebGL would add a larger download, a C# rebuild, more deployment complexity and harder DOM accessibility. Phaser gives the project a real game-engine feel while still preserving the browser-first workflow and the reusable JavaScript game logic.

## Current Features

- Responsive Connect Four board using standard 7 columns by 6 rows.
- Phaser board scene with animated counter drops.
- Clean pre-game setup screen.
- Player names, avatars and counter styles.
- Player vs Player mode.
- Player vs Computer mode.
- Four AI difficulties: Easy, Medium, Advanced and Expert.
- Visible per-turn countdown with calm, warning, urgent and critical states.
- Final 3-second visual countdown.
- Configurable timer duration, including no time limit.
- Skip-turn and automatic-move timeout options.
- Score tracking, rounds, draws and match target formats.
- Match-point and Ultimate Game styling when both players are one win from the target.
- Pause/resume handling.
- Keyboard column selection with number keys 1-7.
- Local storage for setup preferences.
- Per-difficulty progression stats for Player vs Computer.
- Promotion prompt groundwork after consistent wins.
- Expert victory achievement tracking.
- Responsive layout for mobile, tablet and desktop.

## Game State Structure

The main controller in `index.js` owns the central state object. It tracks:

- Active screen.
- Board matrix.
- Players and player types.
- Active player.
- Scores, draws and round number.
- Match target.
- Winner and match winner.
- Winning cells.
- Lock state.
- Timer state.
- Pause state.
- AI thinking state.
- Difficulty and game mode.

The board rules are kept separate in `js/rules.js`. That file contains pure logic for creating the board, validating moves, finding available rows, placing counters, detecting wins, detecting draws and finding immediate winning columns.

## Phaser Layer

The Phaser layer lives in `js/phaser/`.

- `game.js` boots the Phaser game and registers scenes.
- `BoardScene.js` draws the board, creates interactive column zones, renders counters and animates drops.

The Phaser scene does not own match rules. It receives state from `index.js` and emits column-selection events back to the app. This separation keeps the visual game layer replaceable and prevents rendering code from becoming the source of truth.

## Countdown System

The countdown is timestamp-based rather than a simple “minus one every second” interval. The controller stores a deadline using `performance.now()`, recalculates the remaining time on each animation frame and triggers timeout behavior once per turn.

The countdown appears near the board and changes intensity:

- Above 10 seconds: calm.
- 10 to 6 seconds: warning.
- 5 to 4 seconds: urgent.
- Final 3 seconds: large animated number.

During computer turns, the human countdown pauses and the UI switches to an AI thinking state.

## Computer Opponent

The AI logic lives in `js/ai/search.js`. It uses legal board simulation and never bypasses the normal game rules.

Difficulty levels are configured in `js/constants.js`:

- Easy uses mostly random valid moves with occasional strategy.
- Medium takes immediate wins, usually blocks threats and searches shallowly.
- Advanced searches deeper with stronger heuristics.
- Expert uses the deepest current search settings with minimal randomness.

The AI runs asynchronously through a promise-based request with a cancellation token. This prevents stale AI moves after pause, reset or round completion.

## Progression and Stats

Progression utilities live in `js/progression.js` and persistence lives in `js/storage.js`.

Stats are tracked separately per difficulty:

- Wins.
- Losses.
- Draws.
- Games played.
- Current streak.
- Best streak.

The stats modal shows performance by difficulty and overall win rate. Expert victory and promotion-prompt groundwork are also tracked in local storage.

## Responsive Design

The CSS in `styles.css` uses:

- CSS custom properties for design tokens.
- Grid and flex layouts.
- `clamp()` for type and spacing.
- Aspect ratio for the Phaser board container.
- Mobile-first adaptations below tablet and phone widths.
- Reduced-motion support.

Desktop places the board between the two player cards. Tablet and mobile stack the layout so the board remains visible and touch targets stay large.

## Complexity Managed

The main complexity is keeping game logic, visual animation, timer behavior and AI turns synchronized. The project avoids that becoming fragile by separating responsibilities:

- Rules are pure functions.
- Phaser renders and animates.
- `index.js` coordinates state transitions.
- AI chooses a legal column but does not mutate the board directly.
- Storage validates saved preferences before restoring them.

This makes future game modes easier to add because new modes can reuse the same board, rules, timer and result flow.

## Run Locally

Because the app uses ES modules, run it from a local server instead of opening the HTML file directly.

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## External Packages

Phaser is loaded from the jsDelivr CDN in `index.html`:

```html
https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js
```

No build step is required.

## Future Improvements

- Add a dedicated Web Worker for Expert search.
- Add stronger opening-book and endgame AI logic.
- Add procedural Web Audio sound effects and music layers.
- Add a full Ultimate Game intro scene.
- Add more game modes through a formal game-mode registry.
- Add a small browser-based test harness for board logic and AI positions.
- Add shareable match summaries.