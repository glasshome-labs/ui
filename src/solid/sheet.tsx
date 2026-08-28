import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import type { VariantProps } from "cva";
import {
	type Component,
	type ComponentProps,
	createContext,
	createSignal,
	type JSX,
	type ParentComponent,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import { buttonVariants } from "../lib/button-variants.js";
import { Z_CLASS } from "../lib/layers.js";
import { OVERLAY_SURFACE, SCRIM_CLASS } from "../lib/overlay-classes.js";
import { cn } from "../lib/utils.js";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetHandle,
	BottomSheetOverlay,
	BottomSheetPortal,
} from "./bottom-sheet/index.js";
import {
	createModalParts,
	MODAL_DESCRIPTION,
	MODAL_TITLE,
	ModalScrollLock,
} from "./dialog-parts.js";

interface SheetOpenState {
	open: () => boolean;
	setOpen: (next: boolean) => void;
}

const SheetOpenContext = createContext<SheetOpenState>();

/* The open state is mirrored out of kobalte so the deprecated bottom variant
 * can drive a BottomSheet from the same <Sheet open> the side variants use. */
const Sheet: ParentComponent<ComponentProps<typeof DialogPrimitive>> = (props) => {
	const [uncontrolled, setUncontrolled] = createSignal(props.defaultOpen ?? false);
	const open = () => (props.open !== undefined ? props.open === true : uncontrolled());
	const setOpen = (next: boolean) => {
		if (props.open === undefined) setUncontrolled(next);
		props.onOpenChange?.(next);
	};

	return (
		<SheetOpenContext.Provider value={{ open, setOpen }}>
			<DialogPrimitive {...props} preventScroll={false} open={open()} onOpenChange={setOpen} />
		</SheetOpenContext.Provider>
	);
};

const SheetTrigger: Component<ComponentProps<typeof DialogPrimitive.Trigger>> = (props) => (
	<DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
);

type SheetCloseProps = ComponentProps<typeof DialogPrimitive.CloseButton> &
	Partial<Pick<VariantProps<typeof buttonVariants>, "variant" | "size">>;

/** Already the outline button; see DialogClose on why `as={Button}` is wrong. */
const SheetClose: ParentComponent<SheetCloseProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size", "children"]);
	return (
		<DialogPrimitive.CloseButton
			data-slot="sheet-close"
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

const SheetOverlay: Component<ComponentProps<typeof DialogPrimitive.Overlay>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Overlay
			data-slot="sheet-overlay"
			class={cn(
				`data-[closed]:fade-out-0 data-[expanded]:fade-in-0 pointer-events-auto fixed inset-0 select-none ${Z_CLASS.sheet} ${SCRIM_CLASS} data-[closed]:animate-out data-[expanded]:animate-in`,
				local.class,
			)}
			{...rest}
		/>
	);
};

/* A viewport-tall panel would stretch the percentage-sized sheen into a small
 * blob over a flat field; pinned lengths match the ellipse a dialog gets. */
const SHEET_SURFACE = `${OVERLAY_SURFACE} [--glass-sheen:600px_300px]`;

const SHEET_PANEL = `fixed ${Z_CLASS.sheet} flex flex-col overflow-hidden rounded-lg ${SHEET_SURFACE} transition ease-in-out focus:outline-none focus-visible:outline-none data-[closed]:animate-out data-[expanded]:animate-in data-[closed]:duration-300 data-[expanded]:duration-500`;

const SHEET_SIDE = {
	right:
		"data-[closed]:slide-out-to-right data-[expanded]:slide-in-from-right inset-y-3 right-3 w-3/4 sm:max-w-sm",
	left: "data-[closed]:slide-out-to-left data-[expanded]:slide-in-from-left inset-y-3 left-3 w-3/4 sm:max-w-sm",
	top: "data-[closed]:slide-out-to-top data-[expanded]:slide-in-from-top inset-x-3 top-3 max-h-[85dvh]",
} as const;

type SheetSide = keyof typeof SHEET_SIDE | "bottom";

type SheetContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
	/** `"bottom"` is deprecated: it renders a `BottomSheet`. Use `ResponsiveDialog`. */
	side?: SheetSide;
	above?: JSX.Element;
	/** Names a panel that has no `SheetTitle`. */
	ariaLabel?: string;
};

const SheetContent: ParentComponent<SheetContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "side", "above", "ariaLabel"]);
	const side = (): SheetSide => local.side ?? "right";
	const bottomState = useContext(SheetOpenContext);

	return (
		<Show
			when={side() !== "bottom"}
			fallback={
				<BottomSheet
					open={bottomState?.open() === true}
					onOpenChange={(next) => bottomState?.setOpen(next)}
				>
					<BottomSheetPortal>
						<BottomSheetOverlay />
						<BottomSheetContent class={local.class} ariaLabel={local.ariaLabel}>
							<BottomSheetHandle />
							{local.children}
						</BottomSheetContent>
					</BottomSheetPortal>
				</BottomSheet>
			}
		>
			<DialogPrimitive.Portal>
				<ModalScrollLock />
				<SheetOverlay />
				<DialogPrimitive.Content
					data-slot="sheet-content"
					aria-label={local.ariaLabel}
					class={cn(SHEET_PANEL, SHEET_SIDE[side() as keyof typeof SHEET_SIDE], local.class)}
					onOpenAutoFocus={(e: Event) => e.preventDefault()}
					{...rest}
				>
					<Show when={local.above}>
						<div
							data-slot="sheet-content-above"
							class="flex w-full shrink-0 items-end justify-center"
						>
							{local.above}
						</div>
					</Show>
					{local.children}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</Show>
	);
};

const { Header: SheetHeader, Body: SheetBody, Footer: SheetFooter } = createModalParts("sheet");

const SheetTitle: Component<ComponentProps<typeof DialogPrimitive.Title>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Title data-slot="sheet-title" class={cn(MODAL_TITLE, local.class)} {...rest} />
	);
};

const SheetDescription: Component<ComponentProps<typeof DialogPrimitive.Description>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Description
			data-slot="sheet-description"
			class={cn(MODAL_DESCRIPTION, local.class)}
			{...rest}
		/>
	);
};

export {
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
};
