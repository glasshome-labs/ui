import { AlertDialog as AlertDialogPrimitive } from "@kobalte/core/alert-dialog";
import type { VariantProps } from "cva";
import { type Component, type ComponentProps, type ParentComponent, splitProps } from "solid-js";
import { buttonVariants } from "../lib/button-variants.js";
import { cn } from "../lib/utils.js";
import {
	createModalParts,
	MODAL_DESCRIPTION,
	MODAL_PANEL,
	MODAL_SCRIM,
	MODAL_TITLE,
	MODAL_WIDTH,
	ModalScrollLock,
	type ModalSize,
} from "./dialog-parts.js";

const AlertDialog: ParentComponent<ComponentProps<typeof AlertDialogPrimitive>> = (props) => (
	<AlertDialogPrimitive preventScroll={false} {...props} />
);

const AlertDialogTrigger: Component<ComponentProps<typeof AlertDialogPrimitive.Trigger>> = (
	props,
) => <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;

const AlertDialogOverlay: Component<ComponentProps<typeof AlertDialogPrimitive.Overlay>> = (
	props,
) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<AlertDialogPrimitive.Overlay
			data-slot="alert-dialog-overlay"
			class={cn(MODAL_SCRIM, local.class)}
			{...rest}
		/>
	);
};

type AlertDialogContentProps = ComponentProps<typeof AlertDialogPrimitive.Content> & {
	size?: ModalSize;
	/** Names a panel that has no `AlertDialogTitle`. */
	ariaLabel?: string;
};

const AlertDialogContent: ParentComponent<AlertDialogContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "size", "ariaLabel"]);
	return (
		<AlertDialogPrimitive.Portal>
			<ModalScrollLock />
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				data-slot="alert-dialog-content"
				aria-label={local.ariaLabel}
				class={cn(MODAL_PANEL, MODAL_WIDTH[local.size ?? "md"], local.class)}
				{...rest}
			>
				{local.children}
			</AlertDialogPrimitive.Content>
		</AlertDialogPrimitive.Portal>
	);
};

const {
	Header: AlertDialogHeader,
	Body: AlertDialogBody,
	Footer: AlertDialogFooter,
} = createModalParts("alert-dialog");

const AlertDialogTitle: Component<ComponentProps<typeof AlertDialogPrimitive.Title>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			class={cn(MODAL_TITLE, local.class)}
			{...rest}
		/>
	);
};

const AlertDialogDescription: Component<ComponentProps<typeof AlertDialogPrimitive.Description>> = (
	props,
) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			class={cn(MODAL_DESCRIPTION, local.class)}
			{...rest}
		/>
	);
};

type AlertDialogButtonProps = ComponentProps<typeof AlertDialogPrimitive.CloseButton> &
	Partial<Pick<VariantProps<typeof buttonVariants>, "variant" | "size">>;

/** Confirming action. Pass `variant` (e.g. "destructive"); layering a second
 *  buttonVariants() call through `class` cannot work, because the variants
 *  carry tone as arbitrary custom properties that tailwind-merge keeps side by
 *  side, leaving the later stylesheet rule to win. */
const AlertDialogAction: ParentComponent<AlertDialogButtonProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size"] as const);
	return (
		<AlertDialogPrimitive.CloseButton
			data-slot="alert-dialog-action"
			class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
			{...rest}
		/>
	);
};

/** This family's Close: the outline button that dismisses without acting. */
const AlertDialogCancel: ParentComponent<AlertDialogButtonProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size"] as const);
	return (
		<AlertDialogPrimitive.CloseButton
			data-slot="alert-dialog-cancel"
			class={cn(
				buttonVariants({ variant: local.variant ?? "outline", size: local.size }),
				local.class,
			)}
			{...rest}
		/>
	);
};

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
};
