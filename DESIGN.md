---
name: GlassHome UI
description: Shared glass design system for the GlassHome dash app and hub marketing site
colors:
  primary: "oklch(0.48 0.2 215.221)"
  accent: "oklch(0.6 0.2 195)"
  success: "oklch(0.7 0.17 145)"
  warning: "oklch(0.78 0.14 85)"
  destructive: "oklch(0.7106 0.1661 22.2162)"
  background: "oklch(0.12 0.01 250)"
  card: "oklch(0.17 0.01 250)"
  popover: "oklch(0.19 0.008 250)"
  muted: "oklch(0.22 0.02 250)"
  border: "oklch(0.26 0.012 250)"
  input: "oklch(0.19 0.01 250)"
  ring: "oklch(0.6 0.2 195)"
typography:
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontFeature: "normal"
  mono:
    fontFamily: "GeistMono Variable, JetBrains Mono, Fira Code, Consolas, monospace"
rounded:
  sm: "calc(1.4rem - 4px)"
  md: "calc(1.4rem - 2px)"
  lg: "1.4rem"
  xl: "calc(1.4rem + 4px)"
  2xl: "calc(1.4rem + 8px)"
  3xl: "calc(1.4rem + 16px)"
components:
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.background}"
    rounded: "{rounded.xl}"
  overlay:
    backgroundColor: "{colors.popover}"
    rounded: "{rounded.md}"
  badge-success:
    backgroundColor: "{colors.success}"
    rounded: "{rounded.sm}"
  badge-destructive:
    backgroundColor: "{colors.destructive}"
    rounded: "{rounded.sm}"
---

# Design System: GlassHome UI

## Overview

**Creative North Star: "The One Glass Pane"**

Every surface in GlassHome is cut from the same sheet of glass: one `.glass`
CSS formula (`packages/public/ui/src/styles/globals.css`), driven by
`--glass-*` knobs, never hand-rolled per component. The look is a premium
consumer smart-home product, not a developer tool: rounded corners, solid
surfaces with a lit rim and clear border, depth built from layering and
shadow rather than saturated color. Motion is subtle and purposeful,
exponential ease-out, never bounce or elastic.

The palette is restrained: neutrals (background, card, popover, muted,
border, input) sit at OKLCH hue 250 but near-zero chroma (0.003-0.02) — they
read as gray, not blue. Color lives only in the semantic roles: primary
(deep cyan-blue, h215), accent (cyan, h195), and the status trio
success/warning/destructive.

**Key characteristics:**
- One glass formula, tuned by knobs, never duplicated per component
- Neutral (near-achromatic) surfaces; color reserved for primary/accent/status
- Solid fills, clear borders, elevation via shadow + rim, not translucency games
- Dark mode primary, full light mode parity
- Radius-forward (1.4rem base), rounded and friendly, Apple Home-adjacent
- Exponential ease-out motion only; respects `prefers-reduced-motion`

## Colors

Semantic roles, one value per role used as both fill and text, tuned
independently per theme so contrast holds (4.5:1 against background/card/
popover/muted, 3:1 for ring) rather than reused verbatim across light/dark.

- **Primary** — deep cyan-blue (h215.221), the dominant brand color: primary
  actions, focus emphasis, chart accents.
- **Accent** — cyan (h195), the secondary brand color: highlights, the focus
  ring, secondary emphasis.
- **Success / Warning / Destructive** — status trio (h145 green, h85 amber,
  h23 red-orange).
- **Background / Card / Popover / Muted** — the neutral stack, each a
  slightly different lightness step at the same near-zero-chroma hue 250.
  Popover sits just above card (dark) so a floating panel reads as a
  distinct layer, not a color shift.
- **Border / Input / Ring** — structural neutrals; ring borrows the accent
  hue so focus states carry brand color even though the rest of the
  neutral stack does not.

## Typography

Geist Variable for UI text (dash app), Plus Jakarta Sans for the marketing
hub — both clean geometric sans-serifs, no serif or display face in the
product. GeistMono for anything tabular or code-like (entity IDs, values).

## Layout

Touch-first: generous tap targets, no hover-only affordances. Responsive
from phone through tablet to desktop, the same component set at every size.
Density stays comfortable, never dense-data-table.

## Elevation & Depth

Layered, not flat: `--shadow-*` tokens (2xs through 2xl) build a consistent
soft-shadow scale (`0 2px 3px black/16%` family) used by cards and overlays
for elevation. The `.glass` formula adds its own bevel (`--glass-rim`) and
elevation lift (`--glass-lift`) on top of the shadow scale — cards sit at
rim 0.3 lift 0.45, overlays (dialogs/sheets/popovers/menus) at rim 1 lift
0.6, reading one notch higher than a card.

## Shapes

Radius-forward: base `--radius` is 1.4rem, scaled sm→3xl
(`calc(radius ± step)`) for nested chrome (chips inside cards, cards inside
sheets). Corners are always rounded — square corners are an explicit
anti-reference (stock Home Assistant / generic Material).

## Components

- **Card** (`CARD_SURFACE`) — the base panel: `.glass` on `--card`, rim 0.3,
  lift 0.45, optional `CARD_BLUR` where perf allows.
- **Overlay** (`OVERLAY_SURFACE`) — anything floating (menu, dialog, sheet,
  popover, tooltip): `.glass` on a translucent `--popover` over
  `OVERLAY_BLUR`, rim 1, lift 0.6. Surfaces that cannot blur (the
  drag-animated BottomSheet) take `OVERLAY_SURFACE_OPAQUE` instead.
- **Scrim** (`SCRIM_CLASS`) — modal backdrop: `bg-background/70` +
  `backdrop-blur-md`. Since `--background` is the same near-zero-chroma
  neutral as the rest of the stack, the scrim currently reads as flat gray
  dimming rather than tinted glass.
- **Badge / Alert** — `.glass-tint` on a semantic `tone` (one of the status
  colors or primary/accent); never an ad-hoc `bg-{color}-500/10` pairing.
- **Input** (`INPUT_SURFACE`) — concave via `.glass-sink`; theme-asymmetric
  fill (`--field`/`--field-edge`) so it never reads as `disabled`.

## Do's and Don'ts

- **Do** drive every surface through `.glass` + knobs. **Don't** hand-roll
  `backdrop-blur` + translucent `bg-*` for a new panel.
- **Do** keep color on semantic roles (primary/accent/success/warning/
  destructive). **Don't** introduce a new hue for a one-off component.
- **Do** use exponential ease-out motion. **Don't** use bounce/elastic
  easing (`cubic-bezier` with overshoot) outside the one confirmed
  intentional exception (`widget-slot-in`).
- **Do** treat the neutral stack as gray-on-purpose. **Don't** invent a hue
  for it that isn't in `theme.css`.
