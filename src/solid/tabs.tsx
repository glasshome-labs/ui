import { Tabs as TabsPrimitive } from "@kobalte/core/tabs";
import { type Component, type ComponentProps, splitProps } from "solid-js";
import { TRACK_SURFACE } from "../lib/card-classes.js";
import { SEGMENT_ITEM } from "../lib/segment-classes.js";
import { cn } from "../lib/utils.js";
import { SlidingIndicator } from "./sliding-indicator.js";

/** `split`: the root is `display: contents`, so a host (a modal panel) lays the
 *  list and the content out in its own regions while the tab state still spans
 *  them. */
type TabsLayout = "stack" | "split";

const TABS_LAYOUT: Record<TabsLayout, string> = {
	stack: "flex flex-col gap-2",
	split: "contents",
};

type TabsProps = ComponentProps<typeof TabsPrimitive> & { layout?: TabsLayout };

const Tabs: Component<TabsProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "layout"]);
	return (
		<TabsPrimitive
			data-slot="tabs"
			data-layout={local.layout ?? "stack"}
			class={cn(TABS_LAYOUT[local.layout ?? "stack"], local.class)}
			{...others}
		/>
	);
};

const TabsList: Component<ComponentProps<typeof TabsPrimitive.List>> = (props) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			class={cn(
				`inline-flex h-9 w-full items-center rounded-lg ${TRACK_SURFACE} p-1 text-muted-foreground`,
				local.class,
			)}
			{...others}
		>
			<SlidingIndicator
				activeSelector="[data-selected]"
				indicatorClass="rounded-md"
				class="flex h-full w-full items-center gap-1"
			>
				{local.children}
			</SlidingIndicator>
		</TabsPrimitive.List>
	);
};

const TabsTrigger: Component<ComponentProps<typeof TabsPrimitive.Trigger>> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			class={cn(SEGMENT_ITEM, "hover:text-primary/80 data-[selected]:text-primary", local.class)}
			{...others}
		/>
	);
};

const TabsContent: Component<ComponentProps<typeof TabsPrimitive.Content>> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			class={cn(
				"outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				local.class,
			)}
			{...others}
		/>
	);
};

export { Tabs, TabsContent, TabsList, TabsTrigger };
