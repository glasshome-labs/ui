import {
	type Accessor,
	type Component,
	type ComponentProps,
	createContext,
	createSignal,
	createUniqueId,
	type JSX,
	onCleanup,
	onMount,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import { Z_CLASS } from "../lib/layers.js";
import { OVERLAY_SURFACE, SCRIM_CLASS } from "../lib/overlay-classes.js";
import { cn } from "../lib/utils.js";
import { acquireScrollLock, releaseScrollLock } from "./bottom-sheet/scroll-lock.js";

/* kobalte 0.13.11 builds AlertDialog with Object.assign(DialogRoot, ...), the
 * same object Dialog is built from, so whichever of the two modules a bundle
 * evaluates last owns .Content for both. Every family therefore states its own
 * role instead of trusting the primitive's default. */

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export const MODAL_WIDTH: Record<ModalSize, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-3xl",
	full: "max-w-5xl",
};

/* The panel: it clips, it never scrolls, and it carries no padding. Every inset
 * belongs to Header, Body or Footer, so the Body scrollbar rides inside the
 * panel edge instead of under the header. */
export const MODAL_PANEL = `${OVERLAY_SURFACE} data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 fixed top-1/2 left-1/2 flex max-h-[85dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg outline-none ${Z_CLASS.overlay} duration-200 data-[closed]:animate-out data-[expanded]:animate-in`;

export const MODAL_SCRIM = `data-[closed]:fade-out-0 data-[expanded]:fade-in-0 fixed inset-0 ${Z_CLASS.overlay} ${SCRIM_CLASS} data-[closed]:animate-out data-[expanded]:animate-in`;

const MODAL_HEADER = "flex shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-3";
const MODAL_HEADER_TEXT = "flex min-w-0 flex-col gap-1.5 text-left";
const MODAL_HEADER_ACTION = "flex shrink-0 items-center gap-2";

/* The only scroll container. The `of-type` variants restore the full inset when
 * the Header or the Footer is absent; plain `first:`/`last:` cannot, because
 * kobalte parks a focus-trap <span> at each end of the panel. */
const MODAL_BODY =
	"gh-scroll flex min-h-0 flex-1 touch-pan-y flex-col gap-4 overflow-y-auto overscroll-contain px-6 py-3 first-of-type:pt-6 last-of-type:pb-6 [scrollbar-gutter:stable]";

const MODAL_FOOTER =
	"flex shrink-0 flex-col-reverse gap-2 px-6 pt-3 pb-6 sm:flex-row sm:justify-end";

export const MODAL_TITLE = "font-semibold text-foreground text-lg leading-none tracking-tight";
export const MODAL_DESCRIPTION = "text-muted-foreground text-sm";

export type ModalHeaderProps = ComponentProps<"div"> & { action?: JSX.Element };

export interface ModalParts {
	Header: Component<ModalHeaderProps>;
	Body: Component<ComponentProps<"div">>;
	Footer: Component<ComponentProps<"div">>;
}

export function createModalParts(slot: string): ModalParts {
	const Header: Component<ModalHeaderProps> = (props) => {
		const [local, rest] = splitProps(props, ["class", "action", "children"]);
		return (
			<div data-slot={`${slot}-header`} class={cn(MODAL_HEADER, local.class)} {...rest}>
				<div data-slot={`${slot}-header-text`} class={MODAL_HEADER_TEXT}>
					{local.children}
				</div>
				<Show when={local.action}>
					<div data-slot={`${slot}-header-action`} class={MODAL_HEADER_ACTION}>
						{local.action}
					</div>
				</Show>
			</div>
		);
	};

	/* data-sheet-scroll is the bottom sheet's drag arbitration marker: a Body
	 * inside a sheet must yield the gesture to its own scroll, whichever family
	 * rendered it. */
	const Body: Component<ComponentProps<"div">> = (props) => {
		const [local, rest] = splitProps(props, ["class"]);
		return (
			<div
				data-slot={`${slot}-body`}
				data-sheet-scroll=""
				class={cn(MODAL_BODY, local.class)}
				{...rest}
			/>
		);
	};

	const Footer: Component<ComponentProps<"div">> = (props) => {
		const [local, rest] = splitProps(props, ["class"]);
		return <div data-slot={`${slot}-footer`} class={cn(MODAL_FOOTER, local.class)} {...rest} />;
	};

	return { Header, Body, Footer };
}

/** Renderless. Mounted inside a portal that exists only while the modal is
 *  open, so the refcounted page lock follows the modal's real lifetime. */
export const ModalScrollLock: Component = () => {
	onMount(acquireScrollLock);
	onCleanup(releaseScrollLock);
	return null;
};

export interface ModalLabels {
	titleId: string;
	descriptionId: string;
	labelledBy: Accessor<string | undefined>;
	describedBy: Accessor<string | undefined>;
	registerTitle: () => void;
	registerDescription: () => void;
}

const ModalLabelsContext = createContext<ModalLabels>();

/** Kobalte wires title/description ids for its own families; the hand-rolled
 *  surfaces (BottomSheet) wire them through this. */
export function createModalLabels(): ModalLabels {
	const titleId = createUniqueId();
	const descriptionId = createUniqueId();
	const [titles, setTitles] = createSignal(0);
	const [descriptions, setDescriptions] = createSignal(0);
	const register = (set: (fn: (n: number) => number) => void) => {
		set((n) => n + 1);
		onCleanup(() => set((n) => n - 1));
	};
	return {
		titleId,
		descriptionId,
		labelledBy: () => (titles() > 0 ? titleId : undefined),
		describedBy: () => (descriptions() > 0 ? descriptionId : undefined),
		registerTitle: () => register(setTitles),
		registerDescription: () => register(setDescriptions),
	};
}

export const ModalLabelsProvider = ModalLabelsContext.Provider;

export function useModalLabels(): ModalLabels | undefined {
	return useContext(ModalLabelsContext);
}
