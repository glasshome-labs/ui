import { Popover as PopoverPrimitive } from "@kobalte/core/popover";
import {
	type Component,
	type ComponentProps,
	createContext,
	splitProps,
	useContext,
} from "solid-js";
import { INPUT_SURFACE } from "../lib/input-classes.js";
import { Z_CLASS } from "../lib/layers.js";
import {
	anchorToTriggerTop,
	FIELD_MOTION,
	FLOATING_PANEL,
	OVERLAY_MOTION,
} from "../lib/overlay-classes.js";
import { cn } from "../lib/utils.js";

type PopoverSurface = "overlay" | "field";

const PopoverSurfaceContext = createContext<() => PopoverSurface>(
	() => "overlay" as PopoverSurface,
);

/* The expanding field panel: opaque (the trigger sits underneath it), bound to
 * the anchor width and radius, and padded by whatever part needs padding, never
 * by the panel, so the panel edge and the trigger edge are one rectangle. */
const FIELD_PANEL = `${INPUT_SURFACE} ${FIELD_MOTION} relative ${Z_CLASS.overlay} w-[var(--kb-popper-anchor-width)] overflow-hidden rounded-md text-popover-foreground outline-hidden`;

const OVERLAY_PANEL = `${FLOATING_PANEL} ${OVERLAY_MOTION} w-72 p-4`;

type PopoverProps = ComponentProps<typeof PopoverPrimitive> & {
	/** "field" anchors the panel over the trigger's top edge, so the field reads
	 *  as expanding into its panel instead of a box dropping in below it. */
	surface?: PopoverSurface;
};

const Popover: Component<PopoverProps> = (props) => {
	const [local, rest] = splitProps(props, ["surface", "gutter", "getAnchorRect"]);
	const surface = () => local.surface ?? "overlay";
	const field = () => surface() === "field";
	return (
		<PopoverSurfaceContext.Provider value={surface}>
			<PopoverPrimitive
				gutter={local.gutter ?? (field() ? 0 : undefined)}
				getAnchorRect={local.getAnchorRect ?? (field() ? anchorToTriggerTop : undefined)}
				{...rest}
			/>
		</PopoverSurfaceContext.Provider>
	);
};

const PopoverTrigger: Component<ComponentProps<typeof PopoverPrimitive.Trigger>> = (props) => {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
};

type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content> & {
	surface?: PopoverSurface;
};

const PopoverContent: Component<PopoverContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "surface"]);
	const fromRoot = useContext(PopoverSurfaceContext);
	const surface = () => local.surface ?? fromRoot();
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				data-surface={surface()}
				class={cn(surface() === "field" ? FIELD_PANEL : OVERLAY_PANEL, local.class)}
				{...rest}
			/>
		</PopoverPrimitive.Portal>
	);
};

const PopoverAnchor: Component<ComponentProps<typeof PopoverPrimitive.Anchor>> = (props) => {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
};

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
