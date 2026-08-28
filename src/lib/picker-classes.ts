import { CONTROL_H, FIELD_CONTROL } from "./input-classes.js";

/* The one trigger every field-shaped picker wears (Select, AreaPicker,
 * EntitySelector, IconPicker, ImagePicker). While the panel is open it covers
 * the trigger at the same width and radius, so the trigger drops its own edge
 * and focus ring: leaving them on paints a double border at the corners and a
 * ring halo down the sides of the panel. The compound data+focus variants are
 * needed because the trigger keeps focus while the panel is open. */
export const PICKER_TRIGGER = `${FIELD_CONTROL} ${CONTROL_H.default} items-center justify-between gap-2 text-left hover:[--glass-light:0.09] disabled:hover:[--glass-light:0.04] data-[expanded]:ring-0 data-[expanded]:[--glass-edge:transparent] data-[expanded]:focus-visible:ring-0 data-[expanded]:focus-visible:[--glass-edge:transparent]`;

/* Every picker list scrolls at the same size, on the list itself, never on the
 * panel: a max-height on the panel clips the search row and the footer too. */
export const PICKER_LIST = "max-h-[min(70vh,400px)] overflow-y-auto gh-scroll";

/* 44 px: the minimum comfortable touch target, for the search row when a picker
 * opens as a sheet. CONTROL_H has no touch step yet, so it is named here. */
export const CONTROL_H_TOUCH = "h-11";
