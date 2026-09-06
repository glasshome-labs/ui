import {
	type Component,
	type ComponentProps,
	createEffect,
	createSignal,
	Index,
	type JSX,
	onCleanup,
	onMount,
	Show,
	splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { CARD_SURFACE } from "../lib/card-classes.js";
import { PRESS_DIP } from "../lib/motion-classes.js";
import { cn } from "../lib/utils.js";
import { Badge } from "./badge.js";
import { SlidingIndicator } from "./sliding-indicator.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js";

interface DockItem {
	id: string;
	icon: Component<{ class?: string }> | JSX.Element;
	label: string;
	onClick?: () => void;
	isActive?: boolean;
	/** Optional count badge on the item (e.g. pending updates). */
	badge?: number;
}

interface DockProps extends ComponentProps<"div"> {
	items: DockItem[];
	dockMode?: "floating" | "docked";
}

interface DockIconButtonProps extends ComponentProps<"button"> {
	icon: Component<{ class?: string }> | JSX.Element;
	label: string;
	isActive?: boolean;
	badge?: number;
}

const DockIconButton: Component<DockIconButtonProps> = (props) => {
	// Kobalte's button root narrows `type`; Solid's ComponentProps<"button"> also
	// admits "menu", so it is split off rather than spread.
	const [local, rest] = splitProps(props, ["icon", "label", "class", "isActive", "badge", "type"]);
	const isElement = () => typeof local.icon !== "function";

	return (
		<Tooltip openDelay={150} placement="top">
			<TooltipTrigger
				type="button"
				data-slot="dock-item"
				class={cn(
					"group relative flex size-11 touch-manipulation items-center justify-center rounded-lg transition-transform duration-(--duration-micro) sm:size-12",
					PRESS_DIP,
					local.class,
				)}
				aria-label={local.label}
				aria-current={local.isActive ? "page" : undefined}
				{...rest}
			>
				<div
					data-slot="dock-item-icon"
					class={cn(
						"flex items-center justify-center transition-colors duration-300",
						local.isActive ? "text-primary" : "text-foreground group-hover:text-primary/80",
					)}
				>
					{isElement() ? (
						(local.icon as JSX.Element)
					) : (
						<Dynamic
							component={local.icon as Component<{ class?: string }>}
							class="h-5 w-5 sm:h-6 sm:w-6"
						/>
					)}
				</div>
				<Show when={typeof local.badge === "number" && local.badge > 0}>
					{/* Inside the item box: an overhanging badge inflates the bar's
					 * scrollWidth and trips the overflow-to-scroll check below. */}
					<Badge
						role="status"
						tone="var(--primary)"
						class="absolute top-0 right-0 h-4 min-w-4 justify-center px-1 pt-0.5 pb-0 font-medium font-mono text-[9px] tabular-nums leading-none"
						aria-label={`${local.badge} pending`}
					>
						{local.badge != null && local.badge > 9 ? "9+" : local.badge}
					</Badge>
				</Show>
			</TooltipTrigger>
			<TooltipContent class="hidden sm:block">{local.label}</TooltipContent>
		</Tooltip>
	);
};

const Dock: Component<DockProps> = (props) => {
	const [local, rest] = splitProps(props, ["items", "class", "dockMode"]);
	const dockMode = () => local.dockMode ?? "floating";
	let containerRef!: HTMLDivElement;
	const [needsScroll, setNeedsScroll] = createSignal(false);

	// The moving background: the shared SlidingIndicator tracks the active item.
	const activeIndex = () => {
		const i = local.items.findIndex((it) => it.isActive);
		return i < 0 ? null : i;
	};

	const checkOverflow = () => {
		if (containerRef) {
			const naturalWidth = containerRef.scrollWidth;
			const availableWidth = containerRef.parentElement?.clientWidth || window.innerWidth;
			setNeedsScroll(naturalWidth > availableWidth);
		}
	};

	onMount(() => {
		const timeoutId = setTimeout(checkOverflow, 100);
		// disconnect() stops further callbacks but not one already scheduled, so the
		// pending id is held to be cleared on cleanup.
		let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
		const resizeObserver = new ResizeObserver(() => {
			clearTimeout(resizeTimeoutId);
			resizeTimeoutId = setTimeout(checkOverflow, 50);
		});
		resizeObserver.observe(containerRef);
		onCleanup(() => {
			clearTimeout(timeoutId);
			clearTimeout(resizeTimeoutId);
			resizeObserver.disconnect();
		});
	});

	createEffect(() => {
		local.items.length;
		const timeoutId = setTimeout(checkOverflow, 150);
		onCleanup(() => clearTimeout(timeoutId));
	});

	return (
		<div
			data-slot="dock"
			class={cn(
				"flex items-center justify-center",
				dockMode() === "floating" ? "p-1 sm:p-2" : "",
				local.class,
			)}
			{...rest}
		>
			<div class="relative flex items-center justify-center">
				<div
					ref={containerRef}
					data-slot="dock-bar"
					class={cn(
						"flex items-center gap-0.5 p-1.5 sm:gap-1 sm:p-2",
						CARD_SURFACE,
						"[--glass-lift:0.55]",
						dockMode() === "floating" ? "rounded-xl" : "rounded-t-xl",
						needsScroll() ? "scrollbar-hide overflow-x-auto" : "overflow-visible",
						!needsScroll() && "justify-center",
					)}
					style={{
						"min-width": needsScroll() ? "auto" : "fit-content",
					}}
				>
					<SlidingIndicator active={activeIndex()} class="flex items-center gap-0.5 sm:gap-1">
						<Index each={local.items}>
							{(item) => (
								<DockIconButton
									icon={item().icon}
									label={item().label}
									onClick={item().onClick}
									isActive={item().isActive}
									badge={item().badge}
								/>
							)}
						</Index>
					</SlidingIndicator>
				</div>
			</div>
		</div>
	);
};

export type { DockIconButtonProps, DockItem, DockProps };
export { Dock };
