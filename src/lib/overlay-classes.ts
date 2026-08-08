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
