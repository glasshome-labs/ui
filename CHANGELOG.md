# Changelog

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
