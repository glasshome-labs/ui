import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
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

/* Kobalte's own scroll lock is off everywhere: one refcounted lock
 * (bottom-sheet/scroll-lock.ts) serves every modal family, so a nested modal
 * cannot release the page early. */
const Dialog: ParentComponent<ComponentProps<typeof DialogPrimitive>> = (props) => (
	<DialogPrimitive preventScroll={false} {...props} />
);

const DialogTrigger: Component<ComponentProps<typeof DialogPrimitive.Trigger>> = (props) => (
	<DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.CloseButton> &
	Partial<Pick<VariantProps<typeof buttonVariants>, "variant" | "size">>;

/** Already the outline button, so `as` is for a non-button element (a link),
 *  never for `Button`: two buttonVariants() calls leave tone knobs side by side
 *  and the later stylesheet rule wins. */
const DialogClose: ParentComponent<DialogCloseProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size", "children"]);
	return (
		<DialogPrimitive.CloseButton
			data-slot="dialog-close"
			class={cn(
				buttonVariants({ variant: local.variant ?? "outline", size: local.size }),
				local.class,
			)}
			{...rest}
		>
			{local.children ?? "Close"}
		</DialogPrimitive.CloseButton>
	);
};

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
	size?: ModalSize;
	/** Names a panel that has no `DialogTitle`; a titled panel needs nothing. */
	ariaLabel?: string;
};

const DialogContent: ParentComponent<DialogContentProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "children", "size", "ariaLabel"]);
	return (
		<DialogPrimitive.Portal>
			<ModalScrollLock />
			<DialogPrimitive.Overlay data-slot="dialog-overlay" class={MODAL_SCRIM} />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				aria-label={local.ariaLabel}
				class={cn(MODAL_PANEL, MODAL_WIDTH[local.size ?? "lg"], local.class)}
				{...others}
			>
				{local.children}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
};

const { Header: DialogHeader, Body: DialogBody, Footer: DialogFooter } = createModalParts("dialog");

const DialogTitle: Component<ComponentProps<typeof DialogPrimitive.Title>> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			class={cn(MODAL_TITLE, local.class)}
			{...others}
		/>
	);
};

const DialogDescription: Component<ComponentProps<typeof DialogPrimitive.Description>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			class={cn(MODAL_DESCRIPTION, local.class)}
			{...others}
		/>
	);
};

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
};
