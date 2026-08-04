# Changelog

## Unreleased

Hand-written; drop this section once release-please cuts the version from the commits.


### Bug Fixes

* **theme:** relight the light-theme semantic roles to pass WCAG AA. `--success`, `--warning`, `--destructive` and `--ring` were high-lightness values tuned for the dark ground, measuring 2.81:1, 2.09:1, 3.59:1 and 3.50:1 against the light `--background` — under the 4.5:1 text floor (3:1 for a focus indicator). Hue held, lightness dropped: now 5.24:1, 5.17:1, 5.21:1 and 4.68:1 (5.56 / 5.49 / 5.53 / 4.97 against `--card`), and white on the destructive fill goes 3.85:1 to 5.59:1. Dark theme unchanged.

* **switch:** stop an off switch reading as on. The thumb was painted `var(--primary)` in both states, so an unchecked switch showed a filled accent knob; off now takes `--muted-foreground`.

* **input:** stop light-theme fields reading as disabled. A field fill of L=0.9 under an L=0.995 card is the nine-point drop this library spends on `disabled`, and the 60%-alpha edge left nothing else to read the boundary by. `INPUT_SURFACE` now takes its fill and edge from a theme-owned `--field` / `--field-edge` pair: light fields sit at the card with a solid `--border` edge, dark fields keep the dug-out `--input` fill and the soft edge, and `.glass-sink` still supplies the recess in both.


### Features

* **input-classes:** add `FIELD_CHROME`, the recipe SPEC.md already documented. Toggle chrome and rails (checkbox box, radio ring, switch track, slider rail, chart wells) wear it and stay keyed to `--input` in both themes, so they keep reading as empty wells now that fields do not.

## [1.2.0](https://github.com/glasshome/ui/compare/v1.1.2...v1.2.0) (2026-08-04)


### Features

* **alert-dialog:** variant prop on AlertDialogAction ([e45fc0a](https://github.com/glasshome/ui/commit/e45fc0aee027a3ae25cc5308337f217633d5dfbc))
* class-passthrough gate and structural-class lint ([f2c855f](https://github.com/glasshome/ui/commit/f2c855f6243d6a7cd6900a79d4d37cf01ff7e202))
* **schema-form:** controlled recursive form with list and variants fields ([38728fd](https://github.com/glasshome/ui/commit/38728fd49cb559c40c34c2e8504f037b829e72e7))
* **schema-form:** interaction polish and reusable list drag-reorder ([6e3a975](https://github.com/glasshome/ui/commit/6e3a975ce36ecd579f3b16a97eb72df45d42027b))
* **section-card:** merge caller classes via cn, add subtitleClass ([b276b07](https://github.com/glasshome/ui/commit/b276b07a2e9620f7f1f8b0ec911a8bb2db5e07ca))
* **slider:** thumbColors, fillTone, markers, minStepsBetweenThumbs ([577ed42](https://github.com/glasshome/ui/commit/577ed429026594f19d82377219a282ee6c37a00d))


### Bug Fixes

* **build:** keep type declarations during watch builds ([07f9abd](https://github.com/glasshome/ui/commit/07f9abdacc326b9c103898ebdf39fd08e9a8588f))
* make the light theme legible, and stop an off switch reading as on ([5f8f071](https://github.com/glasshome/ui/commit/5f8f0712b35d560a92b017b1b89285ee63c399d3))
* **schema-form:** clear drop transforms without transition ([6168d58](https://github.com/glasshome/ui/commit/6168d585ae6807553a312d515e68d81fa236f833))

## [1.1.2](https://github.com/glasshome/ui/compare/v1.1.1...v1.1.2) (2026-07-29)


### Bug Fixes

* **astro:** accept the attributes every component already spreads ([75b5bf6](https://github.com/glasshome/ui/commit/75b5bf690c80f85f35647312aa3f193e1148dbc7))

## [1.1.1](https://github.com/glasshome/ui/compare/v1.1.0...v1.1.1) (2026-07-29)


### Bug Fixes

* **carousel:** let the Astro twin accept the div attributes it spreads ([f61f626](https://github.com/glasshome/ui/commit/f61f6267395c6ca72f47cafffe17fbb5d3226008))

## [1.1.0](https://github.com/glasshome/ui/compare/v1.0.1...v1.1.0) (2026-07-29)


### Features

* **carousel:** add a server-rendered Astro twin ([7b0010c](https://github.com/glasshome/ui/commit/7b0010cb645493f815b58595a978cdd5b5bb3cd7))
* **carousel:** add fade and wipe transitions, autoplay, and dots ([e0d917b](https://github.com/glasshome/ui/commit/e0d917bd28cba356b6f5fd8876937ad8affc7bd5))
* **icon-picker:** own the icon picker, and dispatch SchemaForm on formType ([273a533](https://github.com/glasshome/ui/commit/273a533683f56cf87e62a71e5014bb883399efe9))
* **theme:** add a motion scale with reduced-motion built in ([e687f83](https://github.com/glasshome/ui/commit/e687f83e17fdd166359c50cb565a7f678d8b031b))


### Bug Fixes

* **carousel:** give the dots forEach a statement body ([4d68b08](https://github.com/glasshome/ui/commit/4d68b08e4c9941e12aa139663c912af1d4d79313))
* **carousel:** make the wipe transition actually read ([d820a2e](https://github.com/glasshome/ui/commit/d820a2eb9b62f121e4285d18fe4810d949195180))
* **entity-selector:** name the real filter when a device-class empties the list ([e366242](https://github.com/glasshome/ui/commit/e366242b901d7e55dd4a4d135f1a9794378510a5))
* **glass:** publish a descendant-readable tone ([fb6c98f](https://github.com/glasshome/ui/commit/fb6c98f9d37c3e9b7a0e130459f8415c22e685d0))
* lock the carousel autoplay and fade deps ([73f0668](https://github.com/glasshome/ui/commit/73f06688bd5da69d7602fb7586fc55c492c80a99))
* **section-card:** accept a class passthrough ([d21c1b5](https://github.com/glasshome/ui/commit/d21c1b5bf6244b1e2ecc9e3172b3fcdde8e1122c))

## 1.0.1 (2026-07-21)

### Fixed

- npm tarball now includes `src/lib/`: the `./astro/*` components import
  shared class recipes from `../lib/*`, which the 1.0.0 package left out
  (fine under a link: symlink, unresolvable from npm).

## 1.0.0 (2026-07-21)

First stable release. The API surface is frozen: removals or reroutes from
here on are semver majors.

### Breaking

- Removed Sidebar, Command, Calendar, Menubar and NavigationMenu (no known
  call sites; re-adding later is a minor).
- Dropped the `@glasshome/sync-layer` peer dependency. EntitySelector and
  AreaPicker read entity/area data through the new `EntityDataAdapter`:
  hosts call `provideEntityData(adapter)` at startup (or wrap a tree in
  `EntityDataContext.Provider`). The `isDemoMode`/`loadDemoData`/
  `unloadDemoData` re-exports are gone.
- Icons are iconify-only: every lucide-solid usage migrated to
  `@iconify-icon/solid` and the lucide-solid dependency is removed. Spinner
  now takes iconify Icon props instead of svg props.
- `tailwindcss` and `tw-animate-css` moved from dependencies to
  peerDependencies (they are build tools, resolved by the consumer's own
  build). `astro` declared as an optional peer for the `./astro/*` entries.
- Removed unused exports: `AlertDialogOverlay`, `AlertDialogPortal`,
  `SECTION_ROW_SURFACE`, bottom-sheet `TRANSITION_CSS`, `SheetState`,
  `SwitchProps`, WidgetCard default export. Legacy top-level `main`/`types`
  package fields removed (the `exports` map is the interface).

### Added

- `EntityDataAdapter` / `EntityDataContext` / `provideEntityData` /
  `useEntityData` plus the structural `EntityViewLike` / `AreaViewLike`
  view types.
- `@source "../../dist"` in the shipped stylesheet, so npm consumers'
  Tailwind builds see component class names without hand-pointed
  node_modules paths.
- Committed `bun.lock`; CI and publishes install with `--frozen-lockfile`.
- Release automation: release-please manages versions and GitHub releases
  from semantic commits; npm publishes use trusted publishing (OIDC).
- Glass frost slot (`--glass-frost`, `--glass-frost-size`,
  `--glass-frost-pos`): hosts can composite a pre-blurred backdrop under
  the glass formula's own material (fixes performant-blur mode losing the
  glass material).

### Fixed

- Type declarations now resolve under Node 16+ module resolution: all relative imports in emitted `.d.ts` files carry explicit `.js` extensions (previously only bundler resolution worked).
- `tokens/presets.ts` re-synced with `theme.css` after oklch value normalization (`--muted-foreground`).

### Added

- Test suite (vitest + happy-dom + @solidjs/testing-library): unit tests for the BottomSheet state machine, velocity tracker, and drag/scroll arbitration; token model tests (oklch parsing, theme derivation, hex gamut mapping, preset contract); render smoke tests for the core primitives.
- `check:types` (typechecks src + tests) and `check:publish` (publint + arethetypeswrong) scripts; both run in CI and gate npm publishes alongside lint, token sync, and tests.

### Changed

- Node engine requirement raised to `>=20`.
- README rewritten around the actual entry points (`/solid`, `/tokens`, `/astro/*`, `/styles`) and current component inventory.
