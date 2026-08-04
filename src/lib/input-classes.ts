/* Recessed (concave) glass field: text inputs, textareas, and the pickers that
 * wear a field (Select trigger + listbox, EntitySelector, AreaPicker). The fill
 * and edge come from the theme's --field/--field-edge pair rather than --input
 * directly, because the two themes need different material: on a dark ground a
 * dug-out fill reads as depth, on a light one the same drop reads as `disabled`,
 * so light fields sit at the card and carry a solid border instead. Both are
 * opaque — a translucent field shows whatever sits behind it (worst inside the
 * overlapping Select listbox). The recess itself is .glass-sink's rim, which is
 * theme independent. */
export const INPUT_SURFACE =
	"glass glass-sink [--glass-base:var(--field)] [--glass-edge:var(--field-edge)] [--glass-light:0.04]";

/* Toggle-family chrome and rails: checkbox box, radio ring, switch track, slider
 * rail, chart wells. Same concave glass, but keyed to --input in both themes:
 * these are not fields you type into, they are unfilled controls whose whole job
 * is to read as an empty well, so the fill must stay visibly below the card even
 * in the light theme. */
export const FIELD_CHROME = "glass glass-sink [--glass-base:var(--input)] [--glass-light:0.04]";

export const INPUT_CLASS = `flex h-9 w-full min-w-0 rounded-md ${INPUT_SURFACE} px-3 py-1 text-base outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`;
