import { type Component, type ComponentProps, splitProps } from "solid-js";
import { cn } from "../lib/utils.js";

const Kbd: Component<ComponentProps<"kbd">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<kbd
			data-slot="kbd"
			class={cn(
				"pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-muted px-1 font-medium font-sans text-muted-foreground text-xs",
				"[&_svg:not([class*='size-'])]:size-3",
				local.class,
			)}
			{...rest}
		/>
	);
};

const KbdGroup: Component<ComponentProps<"kbd">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<kbd
			data-slot="kbd-group"
			class={cn("inline-flex items-center gap-1", local.class)}
			{...rest}
		/>
	);
};

export { Kbd, KbdGroup };
