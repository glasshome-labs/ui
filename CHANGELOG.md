# Changelog

## Unreleased

Hand-written; drop this section once release-please cuts the version from the commits.


### Bug Fixes

* **theme:** relight the light-theme semantic roles to pass WCAG AA. `--success`, `--warning`, `--destructive` and `--ring` were high-lightness values tuned for the dark ground, measuring 2.81:1, 2.09:1, 3.59:1 and 3.50:1 against the light `--background` — under the 4.5:1 text floor (3:1 for a focus indicator). Hue held, lightness dropped: now 5.24:1, 5.17:1, 5.21:1 and 4.68:1 (5.56 / 5.49 / 5.53 / 4.97 against `--card`), and white on the destructive fill goes 3.85:1 to 5.59:1. Dark theme unchanged.

* **switch:** stop an off switch reading as on. The thumb was painted `var(--primary)` in both states, so an unchecked switch showed a filled accent knob; off now takes `--muted-foreground`.

* **input:** stop light-theme fields reading as disabled. A field fill of L=0.9 under an L=0.995 card is the nine-point drop this library spends on `disabled`, and the 60%-alpha edge left nothing else to read the boundary by. `INPUT_SURFACE` now takes its fill and edge from a theme-owned `--field` / `--field-edge` pair: light fields sit at the card with a solid `--border` edge, dark fields keep the dug-out `--input` fill and the soft edge, and `.glass-sink` still supplies the recess in both.


### Features

* **input-classes:** add `FIELD_CHROME`, the recipe SPEC.md already documented. Toggle chrome and rails (checkbox box, radio ring, switch track, slider rail, chart wells) wear it and stay keyed to `--input` in both themes, so they keep reading as empty wells now that fields do not.

## [1.6.0](https://github.com/glasshome/ui/compare/v1.5.0...v1.6.0) (2026-08-28)


### Features

* **area-picker:** disabled mode ([da5200e](https://github.com/glasshome/ui/commit/da5200e98abba49d7effb420d9a220e857863ad8))
* **area-picker:** multi-select mode ([135fa77](https://github.com/glasshome/ui/commit/135fa77c2d917b7fba7e40c721add611434a7a46))
* **field:** FieldSubGroup, legend at the sub-heading rung, disabled dims descriptions ([9026d85](https://github.com/glasshome/ui/commit/9026d858220139fe9b0863e4c8d88636bfbc201f))
* **hero-action:** promote the setup wizard's card into the package ([7f76064](https://github.com/glasshome/ui/commit/7f76064e7b5cf5797c494d1e20025f82d33a95f2))
* **hero-option:** optional tick and an onPick that fires on re-pick ([4deb0ed](https://github.com/glasshome/ui/commit/4deb0ed6422dfdecd94a051793ce9da6ee935b46))
* **option-card:** hero size for wizard-weight pick-one screens ([9c29a23](https://github.com/glasshome/ui/commit/9c29a236029aab5829e0d8eccaf40f92b21b8004))
* **option-card:** selectable option cards over RadioGroup ([daac9ab](https://github.com/glasshome/ui/commit/daac9abfb1ddeab8c988aaf4b3ab866310102ec5))
* **step-indicator:** dots for steppers ([53dc662](https://github.com/glasshome/ui/commit/53dc6625c4c8164a17a75e521f038a5ea2175a3c))
* **switch-row:** description and disabled ([38bdde1](https://github.com/glasshome/ui/commit/38bdde1a44b4ca773fca3c20b1e4dddf0c7d9fc4))
* **switch-row:** optional leading icon ([4d04d6c](https://github.com/glasshome/ui/commit/4d04d6c1835f7d10d39dad1bc72b2c81cf47e4d2))


### Bug Fixes

* **field:** legend owns its space, sub-group stacks flush ([5a7e3d4](https://github.com/glasshome/ui/commit/5a7e3d4266a1546caf66ec5afa9025d6936c75ca))
* **input,dialog,field:** password reveal, quiet dialog scrollbars, generous field spacing ([cf69cd9](https://github.com/glasshome/ui/commit/cf69cd9b1d78f203b7273c4b39a5446b632545e1))
* **switch-row:** centre the switch when there is no description ([16f2ab1](https://github.com/glasshome/ui/commit/16f2ab1a49d2526068870a4ea0067edb32ff66b7))
* **switch:** pass aria labels through ([a03d8d5](https://github.com/glasshome/ui/commit/a03d8d5bea5097e1a81dfca0bb034aa74f89fedd))

## [1.5.0](https://github.com/glasshome/ui/compare/v1.4.0...v1.5.0) (2026-08-26)


### Features

* **image-picker:** household image gallery with upload, delete and quota copy ([be7205d](https://github.com/glasshome/ui/commit/be7205d650bd21b10200c64838c764da3b293929))
* **image-store:** host-provided image store singleton and imageUrl resolver ([26a79f5](https://github.com/glasshome/ui/commit/26a79f5a12b3e3e541b310213a565756d9935d3b))
* **media-store:** resolve a thumbnail variant for gallery tiles ([07ca3d0](https://github.com/glasshome/ui/commit/07ca3d07681f98838d4a4149bb44817cd61c3482))
* **media-tile:** promote the settings picture tile into the system ([b239c82](https://github.com/glasshome/ui/commit/b239c82853fd2921541070cfd3ebb25abd194899))
* **schema-form:** a list row previews its picture ([f32e667](https://github.com/glasshome/ui/commit/f32e66749482ffc7a172be417d281fdf24b3f36a))
* **schema-form:** render ImagePicker for the image-picker formType ([93bead5](https://github.com/glasshome/ui/commit/93bead5574e79f04f3eba859d5a24b3f401f6ebf))


### Bug Fixes

* **badge:** stop setting tier chips in all caps ([fd4699a](https://github.com/glasshome/ui/commit/fd4699ac8d28d4fca9313fb3b15ba1d44f8dea18))
* **carousel:** fade rides embla's flex track, and autoplay is reactive ([fc8021b](https://github.com/glasshome/ui/commit/fc8021b320fe0ca8ad484cdabc4360100012d69a))
* **image-picker:** add data-slot to picker trigger button ([b4ebe05](https://github.com/glasshome/ui/commit/b4ebe05b80e444441d5cafc0516bf54c084b1f6d))
* **image-picker:** let a broken tile recover when its src resolves ([c209c8b](https://github.com/glasshome/ui/commit/c209c8be09e715295194b09443d0999ffec367ac))
* **image-picker:** render a retryable failure state when the gallery index rejects ([7e8c5b6](https://github.com/glasshome/ui/commit/7e8c5b6597b551167c6a94e6abb4168090589e52))
* **image-picker:** render gallery load failure as an empty state, not an alert ([5d42123](https://github.com/glasshome/ui/commit/5d42123df65ead0656d534d6a5a5cc9879ae3fee))
* **image-picker:** resolve tiles through the store, contain store rejections ([0f7c625](https://github.com/glasshome/ui/commit/0f7c625bf83c1d7e4004ba963b59aaa4af47aa24))
* **image-picker:** server-owned quota readout via ImageStore.usage() ([1e6f716](https://github.com/glasshome/ui/commit/1e6f716de166482028d2549b1318debef2e9feca))
* **image-picker:** treat a row with no usable mime as not an image ([7189b50](https://github.com/glasshome/ui/commit/7189b50906a3d4ee5dc6e23ce0a0f19f8b2167bb))
* **image-picker:** wear a field, stay reopenable, and read empty as empty ([4da947d](https://github.com/glasshome/ui/commit/4da947db944b3794f676941a54fafe22bbd12072))
* **image-store:** add upload_failed error kind for unrecognised server errors ([33f2f67](https://github.com/glasshome/ui/commit/33f2f67f486e1f4249c9fdeb0f248192df7112b4))
* **media:** bound the picker gallery and mark an upload pending ([20b6a18](https://github.com/glasshome/ui/commit/20b6a183a0eab3e2b08b571468d35e62333f4fc7))
* **responsive-dialog:** let a close button choose its variant ([82a923d](https://github.com/glasshome/ui/commit/82a923da30ed57960290bac7ed4e525a6a59dc23))
* **schema-form:** a list item's group root drops its duplicate box and title ([d615c4b](https://github.com/glasshome/ui/commit/d615c4b7e0a97802b605c8f84539ebea282c6bb2))
* **theme:** drop the button appearance reset, it never addressed the gray box ([581d88b](https://github.com/glasshome/ui/commit/581d88b9748d6c3d18f8b52c04f0a265362e2279))
* **ui-tests:** satisfy check:types on image-picker and schema-form tests ([cf72e0f](https://github.com/glasshome/ui/commit/cf72e0f3483df2f5f2ad169600f265a5df70b4e3))

## [1.4.0](https://github.com/glasshome/ui/compare/v1.3.0...v1.4.0) (2026-08-22)


### Features

* **widget-identity:** mark widgets whose publish never completed ([e5652a0](https://github.com/glasshome/ui/commit/e5652a02f5731ddf9810a4891c6cf78becaef7fa))


### Bug Fixes

* **dock:** clear the overflow timers on cleanup ([b3b99a7](https://github.com/glasshome/ui/commit/b3b99a73cf0ad0c27c629104a30e54eac3cf561d))
* **theme:** reset button appearance so old WebViews stop native-painting raw buttons ([67e480e](https://github.com/glasshome/ui/commit/67e480e9e37f9d2fedc14c901e6f49139c616391))

## [1.3.0](https://github.com/glasshome/ui/compare/v1.2.0...v1.3.0) (2026-08-08)


### Features

* **glass:** add a --glass-sheen knob for the sheen ellipse size ([9506d7c](https://github.com/glasshome/ui/commit/9506d7cfc94fce7c416d3c0fa615a08cca48b702))


### Bug Fixes

* **alert-dialog:** make variant and size optional on AlertDialogAction ([c1c26be](https://github.com/glasshome/ui/commit/c1c26be722c417fd55fbdabe2f538fce9a484f32))
* **alert:** colour AlertTitle by the tone its parent resolved ([26d4e63](https://github.com/glasshome/ui/commit/26d4e632ded79ae9c62f8323b6e4f2470ad1d74d))
* **overlay:** blur behind the translucent overlay fill ([506c5be](https://github.com/glasshome/ui/commit/506c5be2cdb84334a154692c19b3ecff86af955e))
* **sheet:** float the side panel and match the dialog's chrome ([b64125c](https://github.com/glasshome/ui/commit/b64125cc19336bc8b266f03f877f2873572046e9))

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
