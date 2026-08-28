import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core/dropdown-menu";
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

const DropdownMenu = DropdownMenuPrimitive;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuTrigger: Component<ComponentProps<typeof DropdownMenuPrimitive.Trigger>> = (
	props,
) => {
	return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

const DropdownMenuContent: Component<ComponentProps<typeof DropdownMenuPrimitive.Content>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot="dropdown-menu-content"
				class={cn(MENU_CONTENT_CLASS, local.class)}
				{...others}
			>
				<MenuContentIndicator>{local.children}</MenuContentIndicator>
			</DropdownMenuPrimitive.Content>
		</DropdownMenuPrimitive.Portal>
	);
};

const DropdownMenuItem: Component<
	ComponentProps<typeof DropdownMenuPrimitive.Item> & {
		inset?: boolean;
		tone?: string;
		/** @deprecated pass `tone="var(--destructive)"` instead */
		variant?: "default" | "destructive";
	}
> = (props) => <MenuItemPart slotName="dropdown-menu-item" {...props} />;

const DropdownMenuSubTrigger: ParentComponent<
	ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
> = (props) => <MenuSubTriggerPart slotName="dropdown-menu-sub-trigger" {...props} />;

const DropdownMenuSubContent: ParentComponent<
	ComponentProps<typeof DropdownMenuPrimitive.SubContent>
> = (props) => <MenuSubContentPart slotName="dropdown-menu-sub-content" {...props} />;

const DropdownMenuCheckboxItem: ParentComponent<
	ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
> = (props) => <MenuCheckboxItemPart slotName="dropdown-menu-checkbox-item" {...props} />;

const DropdownMenuRadioItem: ParentComponent<
	ComponentProps<typeof DropdownMenuPrimitive.RadioItem>
> = (props) => <MenuRadioItemPart slotName="dropdown-menu-radio-item" {...props} />;

const DropdownMenuSeparator: Component<ComponentProps<typeof DropdownMenuPrimitive.Separator>> = (
	props,
) => <MenuSeparatorPart slotName="dropdown-menu-separator" {...props} />;

const DropdownMenuLabel: Component<
	ComponentProps<typeof DropdownMenuPrimitive.GroupLabel> & { inset?: boolean }
> = (props) => <MenuLabelPart slotName="dropdown-menu-label" {...props} />;

const DropdownMenuShortcut: Component<ComponentProps<"span">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			class={cn("ml-auto text-muted-foreground text-xs tracking-widest", local.class)}
			{...others}
		/>
	);
};

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
