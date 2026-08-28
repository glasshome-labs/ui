import { Z_CLASS } from "./layers.js";

/* Rim/sheen raised above card level (0.3/0.05) so the bevel and highlight read
 * on large panels instead of smearing into a flat matte gray. */
const OVERLAY_KNOBS =
	"glass [--glass-rim:1] [--glass-lift:0.6] [--glass-light:0.05] [--glass-edge:color-mix(in_srgb,var(--border)_90%,transparent)]";

/* Split from the surface the way CARD_BLUR is, so a host can gate it off and
 * paint a precomputed frost instead. */
export const OVERLAY_BLUR = "backdrop-blur-[var(--glass-blur,20px)] backdrop-saturate-[1.6]";

export const OVERLAY_SURFACE_BASE = `${OVERLAY_KNOBS} [--glass-base:color-mix(in_srgb,var(--popover)_75%,transparent)]`;

/* Floating-panel glass: translucent popover fill over a blur, so a menu reads
 * as glass and not as a flat plate. */
export const OVERLAY_SURFACE = `${OVERLAY_SURFACE_BASE} ${OVERLAY_BLUR}`;

/* Opaque fill, no blur: the drag-animated surfaces (BottomSheet), where
 * backdrop-blur is too slow on mobile and a translucent fill with no blur
 * behind it would just be see-through. */
export const OVERLAY_SURFACE_OPAQUE = `${OVERLAY_KNOBS} [--glass-base:var(--popover)]`;

/* Modal scrim behind dialogs/sheets. BottomSheet keeps its own unblurred scrim
 * (backdrop-blur is too slow on mobile). */
export const SCRIM_CLASS = "bg-background/70 backdrop-blur-md";

/* Anchored panels (menu, popover, hover card) fade and zoom from their side. */
export const OVERLAY_MOTION =
	"data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[closed]:animate-out data-[expanded]:animate-in";

/* Paired with gutter={0} + anchorToTriggerTop, the clip-path reveal is what
 * makes a picker panel read as the field expanding, not a box dropping in. */
export const FIELD_MOTION = "data-[closed]:animate-select-out data-[expanded]:animate-select-in";

/* The floating panel every anchored surface wears. Padding is the caller's:
 * menus add p-1, popovers p-4, pickers none. */
export const FLOATING_PANEL = `${OVERLAY_SURFACE} relative ${Z_CLASS.overlay} rounded-md text-popover-foreground outline-hidden`;

/* Zero-height rect on the trigger's top edge. With gutter 0 and the panel
 * width bound to --kb-popper-anchor-width, the panel covers the trigger and
 * grows downward from it. */
export const anchorToTriggerTop = (anchor?: HTMLElement) => {
	const r = anchor?.getBoundingClientRect();
	return r
		? { x: r.left, y: r.top, width: r.width, height: 0 }
		: { x: 0, y: 0, width: 0, height: 0 };
};
