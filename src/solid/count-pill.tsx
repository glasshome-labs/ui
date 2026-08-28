import type { JSX } from "solid-js";
import { cn } from "../lib/utils.js";
import { Badge } from "./badge.js";

/**
 * Small neutral count chip (list size, item count) sitting next to a title:
 * the Badge material with the muted tone and figures that do not jitter.
 */
export function CountPill(props: { children: JSX.Element; class?: string }) {
	return (
		<Badge tone="var(--muted-foreground)" class={cn("px-2 tabular-nums", props.class)}>
			{props.children}
		</Badge>
	);
}
