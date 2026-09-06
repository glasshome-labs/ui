# GlassHome UI

register: product

## Product Purpose

`@glasshome/ui` is the shared Solid + Astro design-system package for
GlassHome dash (smart-home dashboard) and the GlassHome hub marketing site.
It ships the one glass material, primitives, and theme tokens both apps
consume; it has no end users of its own, its "users" are the dash and hub
codebases and the agents/developers building UI in them.

## Brand personality

Inherits dash's brand: clean, sleek, modern, premium consumer product feel.
Glass motif is literal: transparency, light, clarity, depth through
layering. Calm confidence, never flashy or anxious.

## Reference / anti-reference

- **Reference:** Apple Home, Plex, Nothing OS. Rounded, friendly, depth via
  layering and subtle motion.
- **Anti-reference:** stock Home Assistant dashboards, generic Material UI,
  enterprise SaaS chrome.

## Aesthetic direction

- Dark mode primary, full light mode support, OKLCH tokens in `src/styles/theme.css`.
- Neutrals are near-achromatic gray (hue 250, chroma ~0.003-0.02); color is
  reserved for the semantic roles (primary h215, accent h195, success/
  warning/destructive).
- Typography: Geist (dash), Plus Jakarta Sans (hub).
- Radius-forward, rounded corners everywhere, no square-corner chrome.
- Motion: exponential ease-out only, respects `prefers-reduced-motion`.

Full contract: `SPEC.md` in this package.
