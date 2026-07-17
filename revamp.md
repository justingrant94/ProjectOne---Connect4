can you see this

I have an existing Connect Four game that is already functioning. The core game logic works, but the current design and user experience are basic.

I now want a complete professional revamp of the project.

Do not rebuild everything blindly or remove working functionality. First inspect the existing codebase, understand how the current game works, identify what can be reused, and then cleanly upgrade the entire experience.

The final result should feel like a polished, responsive, modern multiplayer game that is strong enough to include in a frontend development portfolio.

# Main objective
Fully clean, restructure, redesign and enhance the existing Connect Four game across all devices.

The finished game should include:

- A polished pre-game setup experience.
- Custom player names.
- Custom player counters.
- Multiple match formats.
- A dynamic turn system.
- A configurable countdown timer.
- Responsive layouts across mobile, tablet, laptop and desktop.
- Animated counter drops.
- Score tracking.
- A dramatic deciding-round mode.
- Music and sound effects.
- Improved accessibility.
- Clean reusable code.
- Reliable game-state management.
- Strong visual feedback.
- A professional overall presentation.

# Important development approach
Before changing anything:

1. Inspect the complete existing project.
2. Identify the current technology, structure and game logic.
3. Confirm which parts already work correctly.
4. Preserve all useful working functionality.
5. Identify duplicated, fragile or overly complex code.
6. Refactor where necessary rather than layering new code on top of poor structure.
7. Do not replace the entire project unless the current architecture genuinely makes that necessary.
8. Do not leave unused components, styles, variables or duplicated logic behind.
9. Ensure the application still runs after every major change.
Implement the changes directly. Do not only explain what should be changed.

# 1. Full visual redesign
Redesign the entire interface so it feels like a polished modern arcade game rather than a basic coding exercise.

The design should feel:

- Modern.
- Competitive.
- Energetic.
- Sleek.
- Playful without feeling childish.
- Clear and easy to understand.
- Suitable for a professional portfolio.
- Visually consistent across every screen.
Use:

- Strong typography.
- Clear visual hierarchy.
- Consistent spacing.
- Rounded panels where appropriate.
- Modern shadows and depth.
- Subtle gradients.
- Smooth transitions.
- Clear active and disabled states.
- Carefully controlled animation.
- A consistent design system.
Create reusable styling variables or design tokens for:

- Colours.
- Spacing.
- Border radius.
- Shadows.
- Typography.
- Animation timing.
- Breakpoints.
- Player themes.
- Board dimensions.
Avoid random one-off values throughout the styles.

# 2. Responsive design across all devices
The entire game must be fully responsive.

It must work properly on:

- Small mobile phones.
- Large mobile phones.
- Tablets.
- Small laptops.
- Desktop screens.
- Large desktop screens.
- Landscape mobile orientation.
- Portrait mobile orientation.
Do not only make the board smaller. Adapt the full layout intelligently.

## Desktop layout
On larger screens:

- Place the board in the centre.
- Display Player 1 on one side.
- Display Player 2 on the other side.
- Keep the scoreboard and match information clearly visible.
- Use the extra space without making the game feel stretched.
- Keep the main board as the visual focus.

## Tablet layout
On tablets:

- Keep the board central.
- Move player cards above or below the board where necessary.
- Maintain comfortable touch targets.
- Avoid compressed player information.
- Ensure modals and setup screens fit without horizontal scrolling.

## Mobile layout
On mobile:

- Stack the interface vertically.
- Display player cards in a compact but readable format.
- Keep the board fully visible within the viewport where practical.
- Ensure counters remain circular and correctly aligned.
- Make every column easy to tap.
- Use large touch targets.
- Avoid tiny text.
- Avoid horizontal overflow.
- Keep important controls within reach.
- Ensure the scoreboard remains clear.
- Simplify decorative effects where needed for performance.
The board must never overflow its container.

Use responsive units, CSS Grid, Flexbox, `clamp()`, aspect ratios and appropriate media queries rather than relying on fixed pixel dimensions everywhere.

Test the layout at multiple viewport widths rather than only using a few standard device presets.

# 3. Responsive Connect Four board
The game board must resize cleanly while maintaining the correct number of rows and columns.

Requirements:

- Counters must remain perfectly aligned.
- Each cell must retain an equal width and height.
- Counters must remain circular.
- The board must keep the correct aspect ratio.
- Hover previews must stay aligned.
- Counter-drop animations must calculate the correct distance at every screen size.
- Winning-line effects must stay correctly positioned.
- The board must not break when the browser is resized during a match.
- Column click and touch areas must align exactly with visible columns.
- No counter should overlap the board border or neighbouring cells.
Avoid hardcoding animation distances that only work at one screen size.

Measure the actual board and cell dimensions where necessary.

# 4. Pre-game setup screen
Create a polished setup screen before the match begins.

The setup should allow users to configure:

- Player 1 name.
- Player 2 name.
- Player 1 counter.
- Player 2 counter.
- Player avatar or emoji.
- Match format.
- Turn timer.
- Timeout behaviour.
- Music settings.
- Sound-effect settings.
- Optional game theme.
Use “Player 1” and “Player 2” as default names.

Names should:

- Be editable.
- Have a reasonable maximum length.
- Be trimmed before saving.
- Not allow both names to be empty.
- Display correctly when long.
- Use safe fallback names where required.
The setup screen should include a live preview of each player card and counter.

Add a clear primary “Start Game” button.

Only enable the button when the setup is valid.

# 5. Counter customisation
Allow each player to customise their counter before starting.

Offer a selection such as:

- Solid colours.
- Gradients.
- Neon counters.
- Glass-effect counters.
- Striped counters.
- Dotted counters.
- Patterned counters.
- Icon counters.
- Emoji counters.
Each selected counter style should appear consistently in:

- The setup preview.
- Player cards.
- The turn indicator.
- The game board.
- The scoreboard.
- Win announcements.
- The champion screen.
Prevent players from selecting counters that are too visually similar.

Do not rely only on colour to distinguish the two players.

Where appropriate, combine colour with:

- Patterns.
- Borders.
- Symbols.
- Text labels.
- Avatars.

# 6. Player cards
Create a reusable player-card component.

Each card should show:

- Player name.
- Avatar or emoji.
- Selected counter.
- Current score.
- Turn status.
- Remaining time.
- Match-point status where relevant.
The active player card should clearly stand out.

Use:

- A glow.
- An animated border.
- A subtle scale change.
- A turn badge.
- A timer ring.
The inactive player card should remain readable without competing visually with the active player.

On mobile, switch to a compact version of the player card.

# 7. Dynamic turn system
Display the current player clearly.

Examples:

- “Justin’s turn”
- “Sarah’s turn”
- “Justin, make your move”
- “Sarah has 10 seconds remaining”
After every valid move:

1. Lock the board.
2. Play the counter-drop animation.
3. Check for a win.
4. Check for a draw.
5. Update the score where necessary.
6. Switch the active player only when the round remains active.
7. Reset the timer after the animation completes.
8. Unlock the board.
Do not switch turns when:

- A full column is selected.
- The user clicks outside the board.
- A counter animation is already running.
- The round has finished.
- The match has finished.
- The timer has expired and the timeout action is processing.

# 8. Dynamic 20-second countdown
Add a configurable turn timer.

Timer options:

- No time limit.
- 10 seconds.
- 20 seconds.
- 30 seconds.
- 45 seconds.
- 60 seconds.
Use 20 seconds as the default.

Show the countdown using:

- A numerical timer.
- A circular progress ring.
- A progress bar or shrinking indicator.
- A visual state on the active player card.
The timer should update smoothly.

## Timer intensity stages

### More than 10 seconds remaining
Keep the interface calm.

- Normal timer styling.
- Slow progress movement.
- Subtle active-player glow.
- No urgent audio.

### 10 to 6 seconds remaining
Increase tension slightly.

- Stronger timer pulse.
- Soft ticking if enabled.
- More noticeable active-player styling.
- Optional message such as “Choose your move”.

### 5 to 4 seconds remaining
Increase urgency.

- Enlarge the timer.
- Increase pulse speed.
- Add a subtle board glow.
- Use stronger ticking.
- Add a small player-card reaction.

### Final three seconds
Display a dramatic animated countdown:

3
2
1

Each number should briefly animate using a scale, pulse or fade effect.

Do not block the board while displaying the countdown.

# 9. Timeout behaviour
Allow the setup screen to choose what happens when time reaches zero.

Options:

## Skip turn
The player loses their turn.

Display:

“Justin ran out of time — Sarah’s turn”

Then safely switch players and restart the timer.

## Automatic move
Automatically select a valid non-full column.

The automatic move should:

- Be random or neutral.
- Never select a full column.
- Use the correct player counter.
- Use the standard drop animation.
- Display that the move was automatic.
- Trigger only once per expired turn.
Use “Skip turn” as the default.

# 10. Accurate timer implementation
Do not rely only on subtracting one from a number every second.

Use timestamp-based timing.

Track:

- Turn start time.
- Configured turn duration.
- Paused duration.
- Remaining time.
- Whether a timeout action has already fired.
- Whether the board is currently locked.
The timer should:

- Start only when the active player can move.
- Stop immediately when a valid column is selected.
- Remain stopped during the drop animation.
- Reset when the next turn begins.
- Stop when the round ends.
- Stop when the match ends.
- Pause when the game pauses.
- Clean up intervals or animation frames properly.
- Never continue into the next player’s turn.
- Never trigger two timeout actions.
- Ignore late clicks after expiry.

# 11. Hover and touch preview
On desktop:

- Show a preview counter above the selected column.
- Show where the counter will land.
- Change the cursor for full columns.
- Clearly communicate disabled columns.
On touch devices:

- Do not depend on hover.
- Make each full column tappable as one large target.
- Provide immediate tap feedback.
- Ensure the counter lands in the intended column.
- Prevent accidental double moves.

# 12. Counter-drop animation
Add a smooth counter-drop animation.

The animation should:

- Start above the selected column.
- Drop into the correct available row.
- Use the actual measured cell size.
- Work correctly at every screen size.
- Include subtle easing.
- Include a small landing reaction.
- Prevent other moves while running.
- Respect reduced-motion preferences.
Avoid long animations that slow down gameplay.

# 13. Win detection
Ensure the game reliably detects:

- Horizontal wins.
- Vertical wins.
- Diagonal wins from left to right.
- Diagonal wins from right to left.
- Draws.
- Wins on the final available cell.
When a win occurs:

- Stop the round immediately.
- Lock the board.
- Highlight the four winning counters.
- Dim unrelated counters slightly.
- Animate the winning sequence.
- Show the winner’s name.
- Update the score.
- Stop the countdown.
- Stop or transition the music.
- Prevent extra moves.

# 14. Match formats
Allow players to choose:

- Single game.
- Best of three.
- First to two wins.
- First to three wins.
- First to five wins.
- Custom target score where practical.
Display:

- Current score.
- Round number.
- Target wins.
- Match point.
- Draw count where appropriate.
Use clear language so players understand whether they are playing rounds or a full match.

# 15. Ultimate Game mode
Create a special deciding-round experience.

Ultimate Game mode should activate when both players are one win away from winning the match.

Examples:

- A first-to-two match tied 1–1.
- A first-to-three match tied 2–2.
- A first-to-five match tied 4–4.
Set an `isUltimateGame` state based on the actual score and target score.

Do not hardcode it only for a specific match format.

Before the deciding round begins, show a dramatic introduction.

Display:

“THE ULTIMATE GAME”

“WINNER TAKES THE MATCH”

“JUSTIN VS SARAH”

“FINAL ROUND”

Show:

- Both player names.
- Both avatars.
- Both counters.
- The tied score.
- The target score.
Include a countdown:

3
2
1
CONNECT!

Allow the introduction to be skipped after the first moment so it does not become frustrating.

# 16. Ultimate Game styling
When Ultimate Game mode activates:

- Change the background atmosphere.
- Add a glowing board border.
- Add subtle particles or sparks.
- Add a final-round badge.
- Increase player-card intensity.
- Add a spotlight behind the board.
- Add stronger score animations.
- Add controlled screen pulses when counters land.
- Add a subtle vignette.
- Add an “Ultimate Game” label that remains visible.
Do not make the board difficult to read.

Do not use excessive flashing.

Support reduced-motion and accessibility preferences.

# 17. Music and sound effects
Add optional background music and game sounds.

Include sounds for:

- Button interactions.
- Counter preview.
- Counter drop.
- Counter landing.
- Turn change.
- Timer warning.
- Final three-second countdown.
- Timeout.
- Winning.
- Draw.
- Match victory.
- Ultimate Game introduction.
Include:

- Music on or off.
- Sound effects on or off.
- Music volume.
- Sound-effect volume.
- Mute button.
- Ticking-sound toggle.
- Tension-music toggle.
Save audio preferences in local storage.

Respect browser autoplay restrictions.

Music should only begin after the user has interacted with the page.

Use royalty-free, original or properly licensed audio.

Do not include copyrighted commercial music.

# 18. Dynamic tension music
During ordinary rounds, use subtle background music where enabled.

During Ultimate Game mode, use a more suspenseful track or audio layer.

The music should respond to the game state:

- Normal intensity at the beginning.
- Increased intensity below 10 seconds.
- Stronger rhythm below 5 seconds.
- A brief build during the final three seconds.
- A subtle reaction when a player creates a serious winning threat.
- A defensive sound when a winning move is blocked.
- Immediate release when a move is made.
- A dramatic stop or impact when the final winning counter lands.
Do not restart the full track after every turn.

Use smooth transitions, volume adjustments or layered audio.

# 19. Near-win detection
Detect when a player has a strong immediate winning possibility.

Do not unfairly reveal exactly where a player should move.

Instead, use neutral shared tension effects such as:

- A subtle board pulse.
- Slightly increased music intensity.
- A brief message such as “The pressure is building”.
- A stronger Ultimate Game atmosphere.
Both players must receive the same visible information.

# 20. Championship result screen
When a player wins the overall match, show a full championship result screen.

Include:

- “Ultimate Champion” or “Match Champion”.
- Winner’s name.
- Winner’s avatar.
- Winner’s counter.
- Final score.
- Number of rounds played.
- Draw count.
- Trophy animation.
- Confetti or particles.
- Match duration where available.
Include buttons for:

- Rematch.
- Play Again.
- New Players.
- Return to Setup.
- Share Result where supported.
A rematch should retain:

- Player names.
- Counter choices.
- Audio preferences.
- Timer settings.
A rematch should reset:

- Scores.
- Round number.
- Board state.
- Winner state.
- Ultimate Game state.

# 21. Pause functionality
Add a pause control for timed matches.

When paused:

- Freeze the timer.
- Disable the board.
- Pause or lower the music.
- Display a clear paused overlay.
- Prevent moves.
- Preserve the current remaining time.
When resumed:

- Continue from the correct remaining time.
- Restore the audio state.
- Re-enable the board only when safe.
Automatically pause when the browser tab becomes hidden unless strict mode is enabled.

# 22. Local storage
Use local storage to preserve useful preferences and active match information.

Store:

- Player names.
- Counter selections.
- Avatars.
- Match format.
- Target score.
- Timer duration.
- Timeout behaviour.
- Audio preferences.
- Theme preferences.
- Scores where appropriate.
- Current round where appropriate.
Do not restore corrupted or invalid data blindly.

Validate saved values and use safe defaults.

Provide a clear “Reset Match” and “Clear Saved Game” action.

Use a confirmation dialog before destructive resets.

# 23. Navigation and screen transitions
Structure the application into clear states or screens:

1. Landing screen.
2. Player setup.
3. Game settings.
4. Active match.
5. Round result.
6. Ultimate Game introduction.
7. Match result.
Transitions should feel smooth.

Do not allow conflicting screens or overlays to appear at the same time.

The browser back action should not unexpectedly destroy a match where possible.

# 24. Accessibility
The game must be usable beyond pointer-only interaction.

Include:

- Semantic buttons.
- Keyboard navigation.
- Clear focus indicators.
- Screen-reader labels.
- Accessible player and timer announcements.
- Sufficient colour contrast.
- Text alternatives for visual states.
- Reduced-motion support.
- No information communicated by colour alone.
- Large enough touch targets.
- Clear disabled states.
- Logical tab order.
- Escape-key support for appropriate modals.
Allow keyboard column selection using number keys or arrow keys where practical.

Announce important game changes using an appropriate live region, such as:

- “Justin placed a counter in column four.”
- “Sarah’s turn.”
- “Five seconds remaining.”
- “Justin wins the round.”
Avoid excessively frequent announcements.

# 25. Performance
Keep the application responsive and smooth.

Avoid:

- Unnecessary rerenders.
- Large animation libraries where simple CSS is enough.
- Multiple overlapping timers.
- Large unoptimised audio files.
- Excessive particles on mobile.
- Expensive resize calculations on every frame.
- Memory leaks.
- Recreating audio instances unnecessarily.
Reduce visual effects on lower-powered and smaller devices where appropriate.

# 26. Code architecture
Restructure the project into clear reusable modules or components.

Possible areas include:

- Game setup.
- Game board.
- Board cell.
- Player card.
- Scoreboard.
- Turn indicator.
- Timer.
- Pause overlay.
- Round result.
- Match result.
- Ultimate Game introduction.
- Audio controls.
- Settings panel.
- Game-state utilities.
- Win-detection utilities.
- Local-storage utilities.
Keep game logic separate from visual components.

Create focused functions for:

- Creating the board.
- Validating a move.
- Finding the available row.
- Placing a counter.
- Detecting horizontal wins.
- Detecting vertical wins.
- Detecting diagonal wins.
- Detecting draws.
- Switching players.
- Starting a turn.
- Ending a turn.
- Handling a timeout.
- Resetting a round.
- Resetting a match.
- Saving state.
- Restoring state.
- Determining Ultimate Game mode.
Avoid one extremely large component or file.

# 27. State management
Use a clear central game state.

The state should account for:

- Current screen.
- Players.
- Player names.
- Player counters.
- Avatars.
- Board.
- Active player.
- Scores.
- Round number.
- Match target.
- Winner.
- Winning cells.
- Draw state.
- Board lock state.
- Animation state.
- Timer configuration.
- Remaining time.
- Pause state.
- Timeout behaviour.
- Ultimate Game state.
- Audio settings.
- Reduced-motion preferences.
Prevent impossible combinations of state.

For example:

- The board should not accept input when the match result screen is open.
- The timer should not run when the game is paused.
- The active player should not change after a winning move.
- Ultimate Game mode should not remain active after the match ends.

# 28. Error handling
Handle unexpected conditions gracefully.

Examples:

- Invalid local-storage data.
- Missing audio files.
- Unsupported browser features.
- Full-column selection.
- Rapid repeated input.
- Touch and click firing together.
- Resize during animation.
- Timer expiry during animation.
- Resetting during a move.
- Missing player names.
- Counter-style conflicts.
The application should never become stuck because of one failed sound or animation.

# 29. Testing requirements
Thoroughly test:

## Game logic

- Horizontal wins.
- Vertical wins.
- Both diagonal directions.
- Draws.
- Full columns.
- Final-cell wins.
- Rapid repeated clicks.
- Invalid moves.
- Resetting during a round.
- Resetting after a win.

## Timer

- Moving with one second remaining.
- Timeout at zero.
- Clicking exactly as time expires.
- Pausing and resuming.
- Switching tabs.
- Skip-turn behaviour.
- Automatic-move behaviour.
- Restarting the round.
- Starting a rematch.
- Changing timer length.
- Ultimate Game timer behaviour.

## Responsive layouts

- 320px mobile width.
- 375px mobile width.
- 390px mobile width.
- 430px mobile width.
- Tablet portrait.
- Tablet landscape.
- Small laptop.
- Standard desktop.
- Large desktop.
- Browser resize during play.
- Mobile landscape mode.

## Customisation

- Long player names.
- Empty names.
- Similar counter selections.
- Emoji counters.
- Pattern counters.
- Audio disabled.
- Music disabled.
- Reduced-motion enabled.
- Saved-game restoration.

## Match flow

- Single game.
- First to two.
- First to three.
- Deciding round.
- Ultimate Game activation.
- Match winner.
- Rematch.
- New players.
- Reset match.
- Draw during a deciding match.

# 30. Final quality review
After implementation, perform a complete final review.

Check:

- Every button works.
- Every screen is responsive.
- No content overflows.
- No counter becomes misaligned.
- No timer continues incorrectly.
- No duplicate move can be made.
- No modal traps the user.
- No audio starts without interaction.
- No console errors remain.
- No unused styles or components remain.
- No mobile layout feels like a reduced desktop layout.
- No text is unreadably small.
- No animation makes the game difficult to play.
- The interface feels consistent from setup through to the champion screen.

# Final delivery
After completing the upgrade, provide:

1. A summary of the existing structure you found.
2. A summary of what was preserved.
3. A summary of what was refactored.
4. A complete list of features implemented.
5. A list of files created.
6. A list of files updated.
7. An explanation of the game-state structure.
8. An explanation of the responsive approach.
9. An explanation of the timer implementation.
10. An explanation of Ultimate Game mode.
11. An explanation of the audio system.
12. Any installation or run instructions.
13. Any external assets or packages added.
14. Confirmation that the game works on mobile, tablet and desktop.
15. Any remaining recommendations.
Do not leave the project half-upgraded.

The final result should feel like one complete product, not a collection of unrelated features added onto a basic Connect Four game.

