import {
	type Accessor,
	type Component,
	type ComponentProps,
	createEffect,
	createSignal,
	Index,
	type JSX,
	onCleanup,
	onMount,
	type Setter,
	Show,
	splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { CARD_SURFACE } from "../lib/card-classes.js";
import { PRESS_DIP, STAGGER, TAIL_MOTION } from "../lib/motion-classes.js";
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
	/** Fixed items rendered after the scrolling strip, outside the overflow bar. */
	tail?: DockItem[];
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

interface TailEntry {
	item: DockItem;
	state: "enter" | "leave";
}

interface TailSlot {
	enter: string | undefined;
	leave: string | undefined;
}

type TailRole = "enter" | "leave";

// A tail id dropped from props keeps its node mounted (state -> "leave") until
// its own animationend, with a --duration-micro timeout as fallback so
// prefers-reduced-motion (which zeroes the token) still clears it.
function createTailPresence(tail: Accessor<DockItem[]>) {
	const entries = new Map<string, [Accessor<TailEntry>, Setter<TailEntry>]>();
	// Keyed per occupant, not per id: an id flipping enter -> leave mounts a
	// second node, and measuring the detached one reports 0ms and cuts the door.
	const refs = new Map<string, HTMLDivElement>();
	const refKey = (id: string, phase: TailRole) => `${id}:${phase}`;
	const timers = new Map<string, ReturnType<typeof setTimeout>>();
	const [order, setOrder] = createSignal<string[]>([]);

	const clearTimer = (id: string) => {
		const timeoutId = timers.get(id);
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timers.delete(id);
		}
	};

	const remove = (id: string) => {
		clearTimer(id);
		entries.delete(id);
		refs.delete(refKey(id, "enter"));
		refs.delete(refKey(id, "leave"));
		setOrder((prev) => prev.filter((existing) => existing !== id));
	};

	const scheduleFallback = (id: string) => {
		const node = refs.get(refKey(id, "enter")) ?? refs.get(refKey(id, "leave"));
		const durationMs = node
			? Number.parseFloat(getComputedStyle(node).getPropertyValue("--duration-micro")) || 0
			: 0;
		clearTimer(id);
		timers.set(
			id,
			setTimeout(() => remove(id), durationMs),
		);
	};

	createEffect(() => {
		const next = tail();
		const nextIds = new Set(next.map((it) => it.id));

		for (const item of next) {
			const existing = entries.get(item.id);
			if (existing) {
				clearTimer(item.id);
				existing[1]({ item, state: "enter" });
			} else {
				entries.set(item.id, createSignal<TailEntry>({ item, state: "enter" }));
			}
		}

		for (const [id, [get, set]] of entries) {
			if (!nextIds.has(id) && get().state !== "leave") {
				set({ ...get(), state: "leave" });
				scheduleFallback(id);
			}
		}

		setOrder((prev) => {
			const keep = prev.filter((id) => entries.has(id));
			const additions = next.map((it) => it.id).filter((id) => !keep.includes(id));
			return [...keep, ...additions];
		});
	});

	onCleanup(() => {
		for (const timeoutId of timers.values()) clearTimeout(timeoutId);
		timers.clear();
	});

	// Both rows are right-aligned into the same columns, so a leaver overlays the
	// slot its successor takes (pencil turns into done in place) and the extra
	// arrivals append beside it.
	const slots = (): TailSlot[] => {
		const ids = order();
		const stateOf = (id: string) => entries.get(id)?.[0]().state;
		const entering = ids.filter((id) => stateOf(id) === "enter");
		const leaving = ids.filter((id) => stateOf(id) === "leave");
		const columns = Math.max(entering.length, leaving.length);
		return Array.from({ length: columns }, (_, i) => ({
			enter: entering[i - (columns - entering.length)],
			leave: leaving[i - (columns - leaving.length)],
		}));
	};

	return {
		order,
		slots,
		entry: (id: string) => entries.get(id)?.[0](),
		setRef: (id: string, phase: TailRole, node: HTMLDivElement) =>
			refs.set(refKey(id, phase), node),
		clearRef: (id: string, phase: TailRole) => refs.delete(refKey(id, phase)),
		onAnimationEnd: (id: string, event: AnimationEvent) => {
			if (event.target !== event.currentTarget) return;
			if (entries.get(id)?.[0]().state === "leave") remove(id);
		},
	};
}

type TailPresence = ReturnType<typeof createTailPresence>;

const TailOccupant: Component<{
	presence: TailPresence;
	id: string;
	phase: TailRole;
	overlay?: boolean;
}> = (props) => {
	onCleanup(() => props.presence.clearRef(props.id, props.phase));
	return (
		<Show when={props.presence.entry(props.id)}>
			{(current) => (
				<div
					ref={(node) => props.presence.setRef(props.id, props.phase, node)}
					class={cn(
						TAIL_MOTION,
						current().state === "leave" && "pointer-events-none",
						props.overlay && "absolute inset-0",
					)}
					data-state={current().state}
					data-expanded={current().state === "enter" || undefined}
					data-closed={current().state === "leave" || undefined}
					aria-hidden={current().state === "leave" || undefined}
					onAnimationEnd={(event) => props.presence.onAnimationEnd(props.id, event)}
				>
					<DockIconButton
						icon={current().item.icon}
						label={current().item.label}
						onClick={() => {
							if (current().state === "leave") return;
							current().item.onClick?.();
						}}
						isActive={current().item.isActive}
						badge={current().item.badge}
						tabIndex={current().state === "leave" ? -1 : undefined}
					/>
				</div>
			)}
		</Show>
	);
};

const Dock: Component<DockProps> = (props) => {
	const [local, rest] = splitProps(props, ["items", "class", "dockMode", "tail"]);
	const dockMode = () => local.dockMode ?? "floating";
	let containerRef!: HTMLDivElement;
	const [needsScroll, setNeedsScroll] = createSignal(false);
	const tailPresence = createTailPresence(() => local.tail ?? []);

	// The moving background: the shared SlidingIndicator tracks the active item.
	const activeIndex = () => {
		const i = local.items.findIndex((it) => it.isActive);
		return i < 0 ? null : i;
	};

	const checkOverflow = () => {
		if (!containerRef) return;
		const surface = containerRef.parentElement;
		if (!surface) {
			setNeedsScroll(containerRef.scrollWidth > window.innerWidth);
			return;
		}
		const surfaceStyle = getComputedStyle(surface);
		const paddingX =
			(Number.parseFloat(surfaceStyle.paddingLeft) || 0) +
			(Number.parseFloat(surfaceStyle.paddingRight) || 0);
		let siblingWidth = 0;
		for (const child of Array.from(surface.children)) {
			if (child === containerRef) continue;
			const childStyle = getComputedStyle(child);
			siblingWidth +=
				child.getBoundingClientRect().width +
				(Number.parseFloat(childStyle.marginLeft) || 0) +
				(Number.parseFloat(childStyle.marginRight) || 0);
		}
		const availableWidth = surface.clientWidth - paddingX - siblingWidth;
		setNeedsScroll(containerRef.scrollWidth > availableWidth);
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
			<div
				data-slot="dock-surface"
				class={cn(
					"relative flex items-center justify-center p-1.5 sm:p-2",
					CARD_SURFACE,
					"[--glass-lift:0.55]",
					dockMode() === "floating" ? "rounded-xl" : "rounded-t-xl",
				)}
			>
				<div
					ref={containerRef}
					data-slot="dock-bar"
					class={cn(
						"flex items-center gap-0.5 sm:gap-1",
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
				<Show when={tailPresence.order().length > 0}>
					<span data-slot="dock-divider" class="mx-1 h-8 w-px shrink-0 bg-border/30" />
					<div
						data-slot="dock-tail"
						class={cn("flex shrink-0 items-center gap-0.5 sm:gap-1", STAGGER)}
					>
						<Index each={tailPresence.slots()}>
							{(slot) => (
								<div data-slot="dock-tail-slot" class="relative flex items-center">
									{/* keyed: a new occupant id must mount a fresh node, or it inherits the
									 * previous one's ref and replays no entrance. */}
									<Show keyed when={slot().enter}>
										{(id) => <TailOccupant presence={tailPresence} id={id} phase="enter" />}
									</Show>
									<Show keyed when={slot().leave}>
										{(id) => (
											<TailOccupant
												presence={tailPresence}
												id={id}
												phase="leave"
												overlay={slot().enter !== undefined}
											/>
										)}
									</Show>
								</div>
							)}
						</Index>
					</div>
				</Show>
			</div>
		</div>
	);
};

export type { DockIconButtonProps, DockItem, DockProps };
export { Dock };
