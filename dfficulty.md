# Computer opponent and difficulty progression

Add a polished Player vs Computer mode with four clearly different difficulty levels:

* Easy.
* Medium.
* Advanced.
* Expert.

The difficulty levels must not simply change how quickly the computer moves. Each level should use stronger decision-making, deeper move analysis and better strategic awareness.

The computer opponent must always follow the same game rules as the human player.

Do not allow the computer to:

* Place counters in full columns.
* Make multiple moves.
* Move after the round has ended.
* Continue thinking after the game has been paused or reset.
* See or use information that is not part of the current game state.
* freeze the interface while calculating a move.

# Difficulty selection

Allow the player to choose the difficulty during the pre-game setup.

Clearly explain each option:

## Easy

“Perfect for learning the game.”

## Medium

“A balanced opponent that notices threats.”

## Advanced

“A strategic opponent that plans ahead.”

## Expert

“An elite opponent designed to punish mistakes.”

Display the selected difficulty during the match.

Give each difficulty its own optional computer name, avatar or personality.

Examples:

* Easy: Rookie.
* Medium: Challenger.
* Advanced: Strategist.
* Expert: Grandmaster.

The player should also be able to customise the computer opponent’s display name where appropriate.

# Easy difficulty

Easy mode should be approachable and allow new players to win regularly.

The computer should:

* Make mostly random valid moves.
* Prefer central columns occasionally.
* Recognise some immediate winning moves.
* Miss some opportunities to block the player.
* Make believable mistakes.
* Avoid always choosing obviously poor edge columns.
* Still feel like it is playing the game rather than placing counters without purpose.

Suggested behaviour:

* Approximately 65% to 80% random valid moves.
* Occasionally take an immediate winning move.
* Occasionally block an obvious player win.
* Use shallow board analysis only.

The exact percentages can be adjusted during testing to make the mode enjoyable.

Do not make Easy mode deliberately self-destructive or obviously fake.

# Medium difficulty

Medium mode should provide a fair challenge for casual players.

The computer should:

* Always take an immediate winning move when one exists.
* Usually block an immediate human winning move.
* Prefer central columns.
* Avoid obviously dangerous moves.
* Recognise basic horizontal, vertical and diagonal patterns.
* Consider the result of the next move.
* Make occasional strategic mistakes.

Suggested approach:

* Use a shallow minimax search.
* Search approximately two to three moves ahead where performance allows.
* Include a small amount of controlled randomness between similarly scored moves.
* Prioritise wins, blocks and centre control.

Medium mode should feel noticeably stronger than Easy without becoming frustrating.

# Advanced difficulty

Advanced mode should play strategically and require the player to think ahead.

The computer should:

* Always take available wins.
* Always block immediate human wins where possible.
* Recognise traps and double threats.
* Create future winning opportunities.
* Avoid moves that allow an immediate opponent victory.
* Use strong centre control.
* Analyse horizontal, vertical and diagonal opportunities.
* Consider multiple future turns.
* Set up forks where two winning moves may become available.
* Defend against common Connect Four strategies.

Suggested approach:

* Use minimax with alpha-beta pruning.
* Search approximately five to seven moves ahead depending on device performance.
* Use a strong board-scoring heuristic.
* Order likely strong moves first, especially centre columns.
* Cache repeated board positions where useful.
* Use deterministic strategic play with only minimal randomness between equally strong moves.

Advanced mode should punish careless moves but remain realistically beatable by a strong player.

# Expert difficulty

Expert mode must be extremely challenging.

It should feel like the computer is playing at a near-expert Connect Four level rather than simply being a slightly improved Advanced mode.

The computer should:

* Consistently identify immediate wins and threats.
* Recognise forced wins several turns in advance.
* Create and defend against double threats.
* Understand move parity and column control.
* Recognise dangerous spaces that enable future combinations.
* Avoid moves that lead to forced losses.
* Prefer moves that maximise long-term winning potential.
* Control the centre and strategically valuable columns.
* Analyse both offensive and defensive outcomes.
* punish tactical mistakes quickly.
* Continue defending accurately when under pressure.
* Avoid unnecessary randomness.

Use a significantly stronger search system for Expert mode.

Suggested implementation:

* Minimax with alpha-beta pruning.
* Iterative deepening.
* Transposition-table caching.
* Strong move ordering.
* Board hashing.
* Terminal-state prioritisation.
* Threat-space evaluation.
* Depth-sensitive scoring.
* Time-limited search.
* Opening-book strategies where practical.
* Endgame search where the remaining board allows deeper analysis.

Expert should search as deeply as practical without freezing the interface.

Use:

* A Web Worker where supported.
* Asynchronous move calculation.
* A visible but subtle “thinking” state.
* A safe time budget.
* A fallback move if the search exceeds its limit.

The Expert opponent should never intentionally make a weaker move just to let the player win.

Do not describe Expert as impossible or unbeatable. It should be exceptionally difficult but still technically fair and beatable.

# Expert performance requirements

The Expert computer must not damage the user experience.

Requirements:

* Keep the interface responsive while it calculates.
* Allow the thinking process to be cancelled if the game resets.
* Do not make a move from an outdated board state.
* Do not reuse a result after the player has restarted.
* Prevent the human player from moving during the computer turn.
* Show a clear computer-turn state.
* Use a short deliberate delay only for presentation, not as a substitute for actual analysis.
* Reduce search depth intelligently on lower-powered devices if necessary.
* Never silently fall back to Easy-style random moves unless an error occurs.

If a calculation fails, choose the strongest valid fallback move available and keep the game functional.

# Difficulty progression tracking

Track the player’s performance separately for each difficulty.

Store:

* Wins.
* Losses.
* Draws.
* Current win streak.
* Best win streak.
* Games played.
* Average move time where available.
* Fastest win where useful.
* Most recently played difficulty.
* Highest difficulty defeated.

Save progression data in local storage.

Do not mix results from different difficulty levels.

For example, Easy wins should not count towards the player’s Advanced statistics.

# Difficulty promotion prompts

After the player demonstrates consistent success at a difficulty level, offer them the chance to move up.

The prompt should never appear after only one lucky win.

Use three wins as the default progression threshold.

## Easy progression

When the player has won at least three games against Easy mode, show a progression prompt.

Example:

“You’ve beaten Easy three times. Ready to try Medium?”

Buttons:

* Move to Medium.
* Keep playing Easy.
* Not now.

## Medium progression

When the player has won at least three games against Medium mode, show:

“You’re handling Medium well. Ready for Advanced?”

Buttons:

* Move to Advanced.
* Keep playing Medium.
* Not now.

## Advanced progression

When the player has won at least three games against Advanced mode, show:

“You’ve proven yourself against Advanced. Ready to face Expert?”

Buttons:

* Challenge Expert.
* Keep playing Advanced.
* Not now.

## Expert progression

There is no higher difficulty after Expert.

After three Expert wins, show a special mastery message instead:

“You’ve defeated Expert three times. You’ve mastered the highest difficulty.”

Offer:

* Play Expert again.
* Start a new match.
* View achievements.
* Reset progression.

# Progression prompt rules

The progression system must be encouraging rather than repetitive or annoying.

Requirements:

* Do not force the player to change difficulty.
* Do not automatically change the difficulty without confirmation.
* Do not show the prompt after every win once the threshold has been reached.
* Record when the player dismissed the prompt.
* Wait for additional wins before showing it again.
* Allow progression prompts to be disabled in settings.
* Do not show the prompt during the championship animation.
* Show it after the match result has been acknowledged.
* Do not interrupt an Ultimate Game.
* Keep player names, counter styles and relevant settings when moving up.
* Reset only the active match score when changing difficulty.
* Preserve lifetime statistics.

Suggested repeat behaviour:

* Show the first prompt after three wins.
* If dismissed, show it again after five total wins.
* If dismissed again, wait until eight total wins.
* Stop repeating during the same session if the player chooses “Not now”.

# Win streak progression

In addition to total wins, consider the player’s recent performance.

A promotion prompt may appear when the player:

* Wins three matches in total at that difficulty.
* Achieves a three-match win streak.
* Wins three of their last five matches.
* Consistently wins without relying on computer timeouts.

Use one clear progression rule rather than making the requirements confusing.

Display progress subtly, for example:

“2 of 3 wins towards the next challenge.”

Do not make progression feel like a compulsory ranked system.

# Difficulty-change experience

When the player accepts a promotion, show a short transition screen.

Examples:

## Moving to Medium

“New challenge unlocked: Medium”

“The opponent now recognises threats and plans ahead.”

## Moving to Advanced

“Advanced unlocked”

“Expect stronger defence, traps and deeper strategy.”

## Moving to Expert

“Expert challenge unlocked”

“Every mistake matters.”

Show the new opponent avatar, difficulty badge and a brief explanation of what has changed.

Include a “Start Challenge” button.

Do not exaggerate the transition with a long unskippable animation.

# Expert victory experience

Winning against Expert mode should feel like a major achievement.

When the player defeats Expert:

* Stop the game immediately.
* Highlight the winning counters.
* Briefly pause the tension music.
* Trigger a unique Expert victory sound.
* Display a stronger champion animation.
* Show a special badge.
* Save the achievement.
* Update the highest-difficulty-defeated statistic.
* Clearly tell the player that the victory was significant.

Suggested winner messages:

“EXPERT DEFEATED”

“You beat the toughest opponent.”

“That was an elite-level win.”

“You defeated the Grandmaster.”

“Few players reach this level.”

“Expert conquered.”

Use confident but believable language.

Do not claim a global ranking or percentage unless real data exists.

# First Expert win

The first-ever Expert victory should receive a unique presentation.

Display:

“FIRST EXPERT VICTORY”

“You’ve beaten the game’s toughest AI opponent.”

Include:

* Player name.
* Final score.
* Number of moves.
* Match duration.
* Remaining board spaces.
* A special trophy or badge.
* A permanent achievement.
* A “Play Expert Again” button.
* A “View Match Summary” button.
* A “Share Victory” button where supported.

Make this experience visually stronger than a normal win.

Store that the first Expert victory has been achieved so the exact first-win sequence does not repeat every time.

# Repeat Expert victories

Repeat Expert wins should still feel rewarding.

Possible messages:

“Expert defeated again.”

“Another Grandmaster victory.”

“You’ve proven the first win was no accident.”

Show the player’s total number of Expert victories.

For example:

“Expert victories: 4”

Add milestone celebrations at:

* First Expert win.
* Three Expert wins.
* Five Expert wins.
* Ten Expert wins.

Do not show the full first-victory sequence for every Expert win.

# Difficulty badges and achievements

Add optional achievements such as:

* First Win.
* Three-Win Streak.
* Easy Graduate.
* Medium Master.
* Advanced Strategist.
* Expert Defeated.
* Expert Mastery.
* Ultimate Game Winner.
* Timed Victory.
* Comeback Win.
* Perfect Match.

Each achievement should have:

* A title.
* A short description.
* An icon or badge.
* An unlock date.
* A difficulty association where relevant.

Do not let achievement popups interrupt active gameplay.

Display them after the round or match result.

# Dynamic computer behaviour

The computer should use the selected difficulty consistently throughout the match.

Do not secretly increase or decrease the difficulty based on whether the player is winning.

Optional adaptive assistance may be added only as a separate clearly labelled mode.

If an adaptive mode is added:

* Make it opt-in.
* Explain that difficulty may adjust.
* Keep standard Easy, Medium, Advanced and Expert modes fixed.
* Do not apply adaptive behaviour to Expert.

# Computer thinking presentation

During the computer’s turn:

* Lock human input.
* Highlight the computer player card.
* Display a message such as “The Strategist is thinking”.
* Animate a subtle thinking indicator.
* Keep the countdown behaviour appropriate to the mode.
* Make the move after calculation completes.
* Use the normal counter-drop animation.

Vary the thinking message by difficulty.

Examples:

## Easy

“Rookie is choosing a move.”

## Medium

“Challenger is checking the board.”

## Advanced

“Strategist is planning ahead.”

## Expert

“Grandmaster is analysing the position.”

Do not reveal the exact move evaluation or future move sequence during competitive play.

# Computer timer behaviour

The computer should not lose through the same human countdown unless a special challenge mode enables it.

Instead:

* Give the AI an internal calculation time limit.
* Display a separate thinking indicator.
* Pause the human turn countdown during the AI turn.
* Begin the human timer only after the computer’s move animation completes.

For Expert mode, the AI may use a slightly longer calculation window, but it should remain reasonable.

# Difficulty and Ultimate Game mode

Ultimate Game mode must also work in Player vs Computer matches.

When the human and computer are tied one win away from the match target:

* Activate Ultimate Game styling.
* Display the human player against the selected AI opponent.
* Use the correct difficulty badge.
* Increase tension music where enabled.
* Preserve the correct AI difficulty.
* Do not weaken the computer during the deciding round.

For Expert Ultimate Games, use an enhanced introduction such as:

“THE ULTIMATE GAME”

“JUSTIN VS GRANDMASTER”

“ONE ROUND. ONE CHAMPION.”

If the player wins, combine the Expert victory and Ultimate Champion experiences without displaying two conflicting result screens.

# Difficulty statistics screen

Add a statistics or progression screen that shows results by difficulty.

Example:

| Difficulty | Wins | Losses | Draws | Best Streak |
| Easy | 5 | 1 | 0 | 4 |
| Medium | 3 | 3 | 1 | 2 |
| Advanced | 1 | 4 | 0 | 1 |
| Expert | 0 | 6 | 1 | 0 |

Also show:

* Highest difficulty defeated.
* Total games played.
* Total victories.
* Overall win rate.
* Expert victories.
* Ultimate Game victories.
* Most-played difficulty.

Handle zero-game percentages safely.

# Technical AI architecture

Keep the AI logic separate from the UI and core board rendering.

Create focused utilities or modules for:

* Retrieving valid columns.
* Simulating moves.
* Undoing simulated moves where required.
* Scoring board positions.
* Detecting terminal states.
* Detecting immediate wins.
* Detecting immediate threats.
* Ordering moves.
* Running minimax.
* Applying alpha-beta pruning.
* Managing search depth.
* Managing the search time budget.
* Caching evaluated states.
* Cancelling an outdated search.
* Selecting a safe fallback move.
* Mapping difficulty to strategy.

Use one central difficulty configuration.

Example structure:

* Easy: high randomness, shallow evaluation.
* Medium: shallow minimax, some randomness.
* Advanced: deeper minimax and strong heuristics.
* Expert: deepest practical search, caching, iterative deepening and minimal randomness.

Do not scatter difficulty checks throughout unrelated UI components.

# Testing AI difficulty

Test each difficulty across many board states.

Test:

* Immediate AI winning moves.
* Immediate human winning threats.
* Full columns.
* Multiple valid winning moves.
* Double threats.
* Diagonal traps.
* Centre-column strategy.
* Near-full boards.
* Forced wins.
* Forced losses.
* Draw positions.
* Reset during computer calculation.
* Pause during computer calculation.
* Difficulty change between matches.
* Mobile performance.
* Expert search cancellation.
* Worker failure fallback.
* Ultimate Game against each difficulty.
* Progression prompt after three wins.
* Dismissed progression prompts.
* Expert first-win celebration.
* Repeat Expert victories.

Confirm that:

* Easy is clearly the most forgiving.
* Medium is stronger than Easy.
* Advanced is significantly more strategic than Medium.
* Expert is the strongest and does not deliberately make weak moves.
* The UI remains responsive during Expert calculations.
* No AI move occurs after the board has been reset.
* Progression prompts appear at the correct time.
* Players are never forced to increase difficulty.
