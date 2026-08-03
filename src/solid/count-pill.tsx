import type { JSX } from "solid-js";
import { cn } from "../lib/utils.js";

/**
 * Small neutral count chip (list size, item count) sitting next to a title.
 * The one source for `rounded-full bg-foreground/10 … tabular-nums`, previously
 * hand-inlined in SectionCard, PageHeader, and widget rows.
 */
export function CountPill(props: { children: JSX.Element; class?: string }) {
	return (
		<span
			class={cn(
				"shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 font-medium text-muted-foreground text-xs tabular-nums",
				props.class,
			)}
		>
			{props.children}
		</span>
	);
}
