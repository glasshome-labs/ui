import { Icon } from "@iconify-icon/solid";
import { DropdownMenu as MenuPrimitive } from "@kobalte/core/dropdown-menu";
import { type Component, type ComponentProps, type ParentComponent, splitProps } from "solid-js";
import { glassToneText } from "../lib/glass-tone.js";
import { MENU_ITEM, MENU_LABEL, MENU_SEPARATOR } from "../lib/menu-classes.js";
import { FLOATING_PANEL, OVERLAY_MOTION } from "../lib/overlay-classes.js";
import { cn } from "../lib/utils.js";
import { SlidingIndicator } from "./sliding-indicator.js";

/*
 * DropdownMenu and ContextMenu are two Root flavors over one Kobalte Menu
 * engine: Item, CheckboxItem, RadioItem, SubTrigger, SubContent, GroupLabel,
 * Separator and ItemIndicator are the identical components either family
 * re-exports (see @kobalte/core's dropdown-menu and context-menu index,
 * which both alias the same ../menu implementation), so they are styled once
 * here under whichever Root happens to be an ancestor.
 */

export const MENU_CONTENT_CLASS = cn(FLOATING_PANEL, OVERLAY_MOTION, "min-w-[8rem] p-1");

/** Every menu content and sub content wraps its rows in one sliding highlight,
 *  keyed off Kobalte's roving-focus attribute. */
export const MenuContentIndicator: ParentComponent = (props) => (
	<SlidingIndicator
		activeSelector="[data-highlighted]"
		orientation="vertical"
		indicatorClass="rounded-sm"
	>
		{props.children}
	</SlidingIndicator>
);

type ToneProps = {
	tone?: string;
	/** @deprecated pass `tone="var(--destructive)"` instead */
	variant?: "default" | "destructive";
};

function resolveTone(local: ToneProps): string | undefined {
	return local.tone ?? (local.variant === "destructive" ? "var(--destructive)" : undefined);
}

function toneStyle(tone: string | undefined) {
	return tone ? { "--glass-tone": tone, color: glassToneText(tone) } : undefined;
}

type MenuItemProps = ComponentProps<typeof MenuPrimitive.Item> &
	ToneProps & { inset?: boolean; slot: string };

export const MenuItemPart: Component<MenuItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset", "tone", "variant", "slot"]);
	const tone = () => resolveTone(local);
	return (
		<MenuPrimitive.Item
			data-slot={local.slot}
			data-inset={local.inset}
			class={cn(MENU_ITEM, local.inset && "pl-8", local.class)}
			style={toneStyle(tone())}
			{...rest}
		/>
	);
};

type MenuLabelProps = ComponentProps<typeof MenuPrimitive.GroupLabel> & {
	inset?: boolean;
	slot: string;
};

export const MenuLabelPart: Component<MenuLabelProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset", "slot"]);
	return (
		<MenuPrimitive.GroupLabel
			data-slot={local.slot}
			data-inset={local.inset}
			class={cn(MENU_LABEL, local.inset && "pl-8", local.class)}
			{...rest}
		/>
	);
};

type MenuSeparatorProps = ComponentProps<typeof MenuPrimitive.Separator> & { slot: string };

export const MenuSeparatorPart: Component<MenuSeparatorProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "slot"]);
	return (
		<MenuPrimitive.Separator
			data-slot={local.slot}
			class={cn(MENU_SEPARATOR, local.class)}
			{...rest}
		/>
	);
};

type MenuSubTriggerProps = ComponentProps<typeof MenuPrimitive.SubTrigger> & {
	inset?: boolean;
	slot: string;
};

export const MenuSubTriggerPart: ParentComponent<MenuSubTriggerProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "inset", "slot"]);
	return (
		<MenuPrimitive.SubTrigger
			data-slot={local.slot}
			data-inset={local.inset}
			class={cn(MENU_ITEM, local.inset && "pl-8", local.class)}
			{...rest}
		>
			{local.children}
			<Icon icon="lucide:chevron-right" width={16} height={16} class="ml-auto" />
		</MenuPrimitive.SubTrigger>
	);
};

type MenuSubContentProps = ComponentProps<typeof MenuPrimitive.SubContent> & { slot: string };

export const MenuSubContentPart: ParentComponent<MenuSubContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "slot"]);
	return (
		<MenuPrimitive.SubContent
			data-slot={local.slot}
			class={cn(MENU_CONTENT_CLASS, local.class)}
			{...rest}
		>
			<MenuContentIndicator>{local.children}</MenuContentIndicator>
		</MenuPrimitive.SubContent>
	);
};

type MenuCheckboxItemProps = ComponentProps<typeof MenuPrimitive.CheckboxItem> & { slot: string };

export const MenuCheckboxItemPart: ParentComponent<MenuCheckboxItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "slot"]);
	return (
		<MenuPrimitive.CheckboxItem
			data-slot={local.slot}
			class={cn(MENU_ITEM, "py-1.5 pr-2 pl-8", local.class)}
			{...rest}
		>
			<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<MenuPrimitive.ItemIndicator>
					<Icon icon="lucide:check" width={16} height={16} class="size-4" />
				</MenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</MenuPrimitive.CheckboxItem>
	);
};

type MenuRadioItemProps = ComponentProps<typeof MenuPrimitive.RadioItem> & { slot: string };

export const MenuRadioItemPart: ParentComponent<MenuRadioItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "slot"]);
	return (
		<MenuPrimitive.RadioItem
			data-slot={local.slot}
			class={cn(MENU_ITEM, "py-1.5 pr-2 pl-8", local.class)}
			{...rest}
		>
			<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<MenuPrimitive.ItemIndicator>
					{/* mdi:circle is filled; lucide:circle is stroke-only and invisible at 8px. */}
					<Icon icon="mdi:circle" width={8} height={8} class="size-2" />
				</MenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</MenuPrimitive.RadioItem>
	);
};
