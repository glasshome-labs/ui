import { ContextMenu as ContextMenuPrimitive } from "@kobalte/core/context-menu";
import { type Component, type ComponentProps, type ParentComponent, splitProps } from "solid-js";
import { cn } from "../lib/utils.js";
import {
	MENU_CONTENT_CLASS,
	MenuCheckboxItemPart,
	MenuContentIndicator,
	MenuItemPart,
	MenuLabelPart,
	MenuRadioItemPart,
	MenuSeparatorPart,
	MenuSubContentPart,
	MenuSubTriggerPart,
} from "./menu-parts.js";

const ContextMenu = ContextMenuPrimitive;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuTrigger: Component<ComponentProps<typeof ContextMenuPrimitive.Trigger>> = (
	props,
) => {
	return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
};

const ContextMenuSubTrigger: ParentComponent<
	ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }
> = (props) => <MenuSubTriggerPart slot="context-menu-sub-trigger" {...props} />;

const ContextMenuSubContent: Component<ComponentProps<typeof ContextMenuPrimitive.SubContent>> = (
	props,
) => <MenuSubContentPart slot="context-menu-sub-content" {...props} />;

const ContextMenuContent: Component<ComponentProps<typeof ContextMenuPrimitive.Content>> = (
	props,
) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				data-slot="context-menu-content"
				class={cn(MENU_CONTENT_CLASS, local.class)}
				{...rest}
			>
				<MenuContentIndicator>{local.children}</MenuContentIndicator>
			</ContextMenuPrimitive.Content>
		</ContextMenuPrimitive.Portal>
	);
};

const ContextMenuItem: Component<
	ComponentProps<typeof ContextMenuPrimitive.Item> & {
		inset?: boolean;
		tone?: string;
		/** @deprecated pass `tone="var(--destructive)"` instead */
		variant?: "default" | "destructive";
	}
> = (props) => <MenuItemPart slot="context-menu-item" {...props} />;

const ContextMenuCheckboxItem: ParentComponent<
	ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>
> = (props) => <MenuCheckboxItemPart slot="context-menu-checkbox-item" {...props} />;

const ContextMenuRadioItem: ParentComponent<
	ComponentProps<typeof ContextMenuPrimitive.RadioItem>
> = (props) => <MenuRadioItemPart slot="context-menu-radio-item" {...props} />;

const ContextMenuLabel: Component<
	ComponentProps<typeof ContextMenuPrimitive.GroupLabel> & { inset?: boolean }
> = (props) => <MenuLabelPart slot="context-menu-label" {...props} />;

const ContextMenuSeparator: Component<ComponentProps<typeof ContextMenuPrimitive.Separator>> = (
	props,
) => <MenuSeparatorPart slot="context-menu-separator" {...props} />;

const ContextMenuShortcut: Component<ComponentProps<"span">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<span
			data-slot="context-menu-shortcut"
			class={cn("ml-auto text-muted-foreground text-xs tracking-widest", local.class)}
			{...rest}
		/>
	);
};

export {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
};
