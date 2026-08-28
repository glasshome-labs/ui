import { ToggleButton as ToggleButtonPrimitive } from "@kobalte/core/toggle-button";
import { cva, type VariantProps } from "cva";
import { type Component, type ComponentProps, splitProps } from "solid-js";
import { CONTROL_H } from "../lib/input-classes.js";
import { SEGMENT_ITEM } from "../lib/segment-classes.js";
import { cn } from "../lib/utils.js";

const toggleVariants = cva({
	base: `${SEGMENT_ITEM} border border-transparent aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
	variants: {
		variant: {
			// `hover:bg-muted` only paints when the element isn't glass yet (unpressed);
			// once `data-[pressed]:glass` (below) engages, bg-*/text-* hover are no-ops,
			// so the pressed hover bumps the glass wash through a knob instead.
			default:
				"bg-transparent not-data-[pressed]:hover:bg-muted not-data-[pressed]:hover:text-muted-foreground data-[pressed]:hover:[--glass-wash:40%]",
			// Same material as Button's outline variant: a real border-input box was a
			// no-op the moment `data-[pressed]:glass` engaged, since glass owns the
			// background/border of the element it's on.
			outline:
				"glass [--glass-edge:var(--border)] hover:[--glass-base:var(--muted)] dark:[--glass-base:var(--input)] dark:hover:[--glass-base:var(--muted)]",
		},
		size: {
			default: `${CONTROL_H.default} min-w-9 px-2`,
			sm: `${CONTROL_H.sm} min-w-8 px-1.5`,
			lg: `${CONTROL_H.lg} min-w-10 px-2.5`,
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

const Toggle: Component<
	ComponentProps<typeof ToggleButtonPrimitive> & VariantProps<typeof toggleVariants>
> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size"] as const);
	return (
		<ToggleButtonPrimitive
			data-slot="toggle"
			class={cn(
				toggleVariants({ variant: local.variant, size: local.size }),
				"data-[pressed]:glass data-[pressed]:[--glass-tone:var(--primary)]",
				local.class,
			)}
			{...rest}
		/>
	);
};

export { Toggle, toggleVariants };
