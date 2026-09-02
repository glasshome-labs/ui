/* The motion vocabulary. A thing arrives one of three ways and leaves the
 * same way in reverse, faster. Durations and curves are theme tokens, so
 * prefers-reduced-motion zeroes all of it in one place. */

const ARRIVE =
	"data-[expanded]:animate-in data-[expanded]:duration-(--duration-expand) data-[expanded]:ease-(--ease-expand)";
const LEAVE =
	"data-[closed]:animate-out data-[closed]:duration-(--duration-micro) data-[closed]:ease-(--ease-contract)";

/* Anchored panels (menu, popover, tooltip, hover card): unfold from the
 * trigger edge. Kobalte writes the origin per placement. */
export const OVERLAY_MOTION = `origin-(--kb-popper-content-transform-origin) ${ARRIVE} data-[expanded]:fade-in-0 data-[expanded]:zoom-in-90 ${LEAVE} data-[closed]:fade-out-0 data-[closed]:zoom-out-95`;

/* Field pickers: paired with gutter={0} + anchorToTriggerTop, the clip-path
 * reveal is what makes the panel read as the field expanding, not a box
 * dropping in. */
export const FIELD_MOTION = "data-[closed]:animate-select-out data-[expanded]:animate-select-in";

/* Anchored panels that own their trigger (dropdown menu): the panel covers
 * the trigger (gutter 0 + anchorToTriggerTop) and unrolls out of the
 * trigger's box; the content writes --morph-h/--morph-radius from the
 * trigger it replaces, --morph-w is kobalte's anchor width. */
export const MORPH_MOTION =
	"[--morph-w:var(--kb-popper-anchor-width)] min-w-[var(--kb-popper-anchor-width)] data-[expanded]:animate-morph-in data-[closed]:animate-morph-out";

/* Children of a panel arrive staggered through the `gh-stagger` class
 * (globals.css): one door, no per-row index, mount-only. */
export const STAGGER = "gh-stagger";

/* Modals: rise into place. Sheets keep their slide. */
export const MODAL_MOTION = `${ARRIVE} data-[expanded]:fade-in-0 data-[expanded]:zoom-in-[0.94] data-[expanded]:slide-in-from-bottom-2 ${LEAVE} data-[closed]:fade-out-0 data-[closed]:zoom-out-[0.96]`;

export const SCRIM_MOTION = `${ARRIVE} data-[expanded]:fade-in-0 ${LEAVE} data-[closed]:fade-out-0`;

/* Content that swaps in place (tab panel, a row added to a list). */
export const SETTLE_MOTION =
	"animate-in fade-in-0 slide-in-from-bottom-1 duration-(--duration-state) ease-(--ease-expand)";

/* Every pressable dips the same amount. */
export const PRESS_DIP = "active:scale-[0.97]";

/** A slot whose occupant changes: the leaver contracts, the arriver grows from the same box. */
export const TAIL_MOTION = `${ARRIVE} data-[state=enter]:fade-in-0 data-[state=enter]:zoom-in-75 ${LEAVE} data-[state=leave]:fade-out-0 data-[state=leave]:zoom-out-75`;
