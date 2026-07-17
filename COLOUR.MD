## Connect Four Visual Direction

This is a **Connect Four game**, so the visual design must feel playful, energetic and immediately recognisable as a game.

Do not make it resemble:

* A SaaS dashboard
* An admin panel
* A corporate application
* A generic AI-generated interface
* A dark futuristic AI product

The interface should feel like a polished modern version of the classic Connect Four experience.

## Board Design

The Connect Four board must be the main visual focus.

Create a board that feels:

* Thick
* Solid
* Playful
* Tactile
* Durable
* Visually satisfying

The outer frame and internal grid should have enough thickness to resemble a physical Connect Four board rather than a flat collection of circles.

Use:

* A thick outer board frame
* Clearly defined circular slots
* Consistent spacing between slots
* Rounded outer corners
* Subtle solid-colour shadows to create depth
* Slightly raised or inset slot styling

Do not use gradients, glow effects or glassmorphism.

The board should use a playful solid green by default and must fit naturally with the page background.

## Counters

All playing counters must be perfectly circular.

The counters should:

* Fit neatly inside each board slot
* Maintain a perfect 1:1 aspect ratio
* Have clear separation from the board
* Feel like physical game pieces
* Drop smoothly into the selected column
* Never appear stretched or oval on any screen size

Use a playful default colour combination that provides strong contrast.

For example:

* Player One: warm yellow
* Player Two or Computer: coral red
* Board: playful green
* Background: soft cream or warm off-white

The colour combination must make sense as one complete visual system.

## In-Game Counter Colour Customisation

Allow players to change their counter colours, but **do not show this option in the initial setup menu**.

The counter colour controls should only become available **after the game has started**.

Once the match begins, include a small, clean customisation control inside the game screen, such as:

* A palette icon
* A “Change colours” option in the game settings
* A compact colour panel

The colour customisation must not interrupt gameplay or dominate the interface.

When opened, allow the user to choose from a curated set of playful solid colours.

Suggested options:

* Yellow
* Red
* Orange
* Blue
* Purple
* Pink
* Turquoise
* White

Do not use unrestricted colour inputs that could allow both players to select nearly identical colours.

The system must prevent:

* Player One and Player Two using the same colour
* Colours that are too similar
* Colours that blend into the board
* Colours with insufficient contrast
* Colours that make the counters difficult to distinguish

Show a clear preview of each player's selected counter colour.

Changing a counter colour should update:

* Counters already placed on the board
* The current-turn indicator
* Player labels
* Score indicators
* Relevant player UI accents

The selected colours should remain consistent throughout the current match.

## Menu Behaviour

Keep the initial game menu clean and focused.

The setup screen should only contain the options needed to begin playing:

* Game mode
* Player details
* Difficulty where relevant
* Match length
* Start Game button

Do not include counter colour selection before the game starts.

When the user selects **Player vs Computer**, show only:

* Player name
* Difficulty
* Match length
* Start Game

Do not show a second player name field.

When the user selects **Player vs Player**, show:

* Player One name
* Player Two name
* Match length
* Start Game

Do not show AI difficulty settings.

Use progressive disclosure so the menu only displays controls relevant to the selected mode.

## Colour System

All colours must be defined centrally inside the main CSS file using `:root` variables.

There must be:

* No hardcoded colours inside components
* No inline colour styles
* No colours scattered across multiple CSS files
* No gradients anywhere in the application

Use variables such as:

```css
:root {
  --color-page-background: #fff8e8;
  --color-surface: #ffffff;
  --color-board: #29a866;
  --color-board-dark: #207f50;
  --color-board-slot: #f4eddb;

  --color-player-one: #f6c945;
  --color-player-two: #ef654f;

  --color-text-primary: #203028;
  --color-text-secondary: #66756d;
  --color-border: #d9e0dc;

  --color-primary-action: #207f50;
  --color-primary-action-hover: #196a42;
}
```

These are directional starting values and may be adjusted to create the strongest cohesive palette.

All dynamically selected counter colours should also come from an approved colour-token list rather than arbitrary values.

## No Gradients

Do not use gradients anywhere.

This rule applies to:

* Page backgrounds
* Board
* Counters
* Buttons
* Cards
* Menus
* Modals
* Score displays
* Hover states
* Victory screens
* Overlays
* Timer states

Depth should be created using solid colours, borders, spacing, layering and subtle shadows.

## Final Design Goal

The finished game should immediately communicate:

> “This is a fun, polished and modern Connect Four game.”

It should be colourful without becoming childish, modern without becoming corporate, and playful without looking messy.

The board should feel substantial, the counters should feel satisfying, and every colour should serve a clear purpose.
