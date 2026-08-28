/* One menu row, label and separator for every listbox and menu (Select,
 * DropdownMenu, ContextMenu, pickers). Highlight comes from SlidingIndicator,
 * so the row itself paints no background. */
export const MENU_ITEM =
	// structural-ok: [&>iconify-icon] sizes the package Icon inside a row; utility layer so a caller size-* wins.
	"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>iconify-icon]:shrink-0 [&>iconify-icon]:text-[16px]";

export const MENU_LABEL = "px-2 py-1.5 font-medium text-muted-foreground text-xs";

export const MENU_SEPARATOR = "-mx-1 my-1 h-px bg-border";
