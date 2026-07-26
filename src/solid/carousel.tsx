import { Icon } from "@iconify-icon/solid";
import EmblaCarousel, {
	type EmblaCarouselType,
	type EmblaOptionsType,
	type EmblaPluginType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
	type Accessor,
	type Component,
	type ComponentProps,
	createContext,
	createSignal,
	onCleanup,
	onMount,
	type ParentComponent,
	splitProps,
	useContext,
} from "solid-js";
import { cn } from "../lib/utils.js";
import { Button } from "./button.js";

type CarouselApi = EmblaCarouselType;

interface CarouselContextProps {
	viewportRef: (el: HTMLDivElement) => void;
	api: Accessor<CarouselApi | undefined>;
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: Accessor<boolean>;
	canScrollNext: Accessor<boolean>;
	orientation: Accessor<"horizontal" | "vertical">;
	transition: Accessor<CarouselTransition>;
	selected: Accessor<number>;
	slideCount: Accessor<number>;
	scrollTo: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextProps>();

function useCarousel() {
	const context = useContext(CarouselContext);
	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}
	return context;
}

/* slide moves a track; fade and wipe stack the slides and reveal the incoming
 * one in place (wipe sweeps a diagonal clip-path, fade cross-dissolves). */
type CarouselTransition = "slide" | "fade" | "wipe";

const Carousel: ParentComponent<
	ComponentProps<"div"> & {
		opts?: EmblaOptionsType;
		plugins?: EmblaPluginType[];
		orientation?: "horizontal" | "vertical";
		transition?: CarouselTransition;
		/** Advance every N ms. Ignored under prefers-reduced-motion. */
		autoplay?: number;
		setApi?: (api: CarouselApi) => void;
	}
> = (props) => {
	const [local, rest] = splitProps(props, [
		"class",
		"children",
		"opts",
		"plugins",
		"orientation",
		"transition",
		"autoplay",
		"setApi",
	]);
	const orientation = () => local.orientation ?? "horizontal";
	const transition = () => local.transition ?? "slide";
	let viewportEl: HTMLDivElement | undefined;
	const [api, setApi] = createSignal<CarouselApi>();
	const [canScrollPrev, setCanScrollPrev] = createSignal(false);
	const [canScrollNext, setCanScrollNext] = createSignal(false);
	const [selected, setSelected] = createSignal(0);
	const [slideCount, setSlideCount] = createSignal(0);

	const viewportRef = (el: HTMLDivElement) => {
		viewportEl = el;
	};

	onMount(() => {
		if (!viewportEl) return;
		// Reduced motion keeps the carousel usable but stops it moving on its own.
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const plugins = [...(local.plugins ?? [])];
		if (transition() !== "slide") plugins.push(Fade());
		if (local.autoplay && !reduced) {
			plugins.push(Autoplay({ delay: local.autoplay, stopOnInteraction: true }));
		}
		const embla = EmblaCarousel(
			viewportEl,
			{
				...(transition() === "slide" ? { axis: orientation() === "horizontal" ? "x" : "y" } : {}),
				...local.opts,
			},
			plugins,
		);
		setApi(embla);
		local.setApi?.(embla);

		const onSelect = () => {
			setCanScrollPrev(embla.canScrollPrev());
			setCanScrollNext(embla.canScrollNext());
			setSelected(embla.selectedScrollSnap());
			setSlideCount(embla.scrollSnapList().length);
			// Slides carry their own selected state so CSS transitions (wipe) can
			// key off it; embla itself only drives transform and opacity.
			const active = embla.selectedScrollSnap();
			embla.slideNodes().forEach((node, i) => {
				node.toggleAttribute("data-selected", i === active);
			});
		};
		onSelect();
		embla.on("reInit", onSelect);
		embla.on("select", onSelect);

		onCleanup(() => embla.destroy());
	});

	const scrollPrev = () => api()?.scrollPrev();
	const scrollNext = () => api()?.scrollNext();
	const scrollTo = (index: number) => api()?.scrollTo(index);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			scrollNext();
		}
	};

	return (
		<CarouselContext.Provider
			value={{
				viewportRef,
				api,
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
				orientation,
				transition,
				selected,
				slideCount,
				scrollTo,
			}}
		>
			{/* biome-ignore lint/a11y/useSemanticElements: role=region + aria-roledescription is the canonical ARIA carousel pattern; section would change document outline semantics. */}
			<div
				onKeyDown={handleKeyDown}
				class={cn("relative", local.class)}
				role="region"
				aria-roledescription="carousel"
				data-slot="carousel"
				{...rest}
			>
				{local.children}
			</div>
		</CarouselContext.Provider>
	);
};

const CarouselContent: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	const { viewportRef, orientation, transition } = useCarousel();
	// Stacked modes keep every slide in the same grid cell; embla's fade plugin
	// drives opacity, and `wipe` layers a clip-path sweep on top of it.
	const stacked = () => transition() !== "slide";

	return (
		<div ref={viewportRef} class="h-full overflow-hidden" data-slot="carousel-content">
			<div
				class={cn(
					stacked()
						? "grid [&>*]:col-start-1 [&>*]:row-start-1"
						: cn("flex", orientation() === "horizontal" ? "-ml-4" : "-mt-4 flex-col"),
					local.class,
				)}
				data-transition={transition()}
				{...rest}
			/>
		</div>
	);
};

const CarouselItem: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	const { orientation, transition } = useCarousel();

	return (
		// biome-ignore lint/a11y/useSemanticElements: role=group + aria-roledescription=slide is the canonical ARIA carousel slide; no HTML element maps to group.
		<div
			role="group"
			aria-roledescription="slide"
			data-slot="carousel-item"
			class={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				transition() === "slide" && (orientation() === "horizontal" ? "pl-4" : "pt-4"),
				transition() === "wipe" && "carousel-wipe",
				local.class,
			)}
			{...rest}
		/>
	);
};

/** Slide indicators. Stays in sync with drag, autoplay, and prev/next alike. */
const CarouselDots: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	const { selected, slideCount, scrollTo } = useCarousel();

	return (
		<div
			class={cn("flex items-center justify-center gap-2", local.class)}
			data-slot="carousel-dots"
			{...rest}
		>
			{Array.from({ length: slideCount() }, (_, i) => (
				<button
					type="button"
					data-slot="carousel-dot"
					data-active={selected() === i ? "" : undefined}
					aria-label={`Go to slide ${i + 1}`}
					aria-current={selected() === i}
					class={cn(
						"h-1.5 rounded-full bg-foreground/40 transition-all hover:bg-foreground/70",
						selected() === i ? "w-6 bg-foreground/80" : "w-1.5",
					)}
					onClick={() => scrollTo(i)}
				/>
			))}
		</div>
	);
};

const CarouselPrevious: Component<ComponentProps<typeof Button>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size"]);
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			data-slot="carousel-previous"
			variant={local.variant ?? "outline"}
			size={local.size ?? "icon"}
			class={cn(
				"absolute size-8 rounded-full",
				orientation() === "horizontal"
					? "top-1/2 -left-12 -translate-y-1/2"
					: "-top-12 left-1/2 -translate-x-1/2 rotate-90",
				local.class,
			)}
			disabled={!canScrollPrev()}
			onClick={scrollPrev}
			{...rest}
		>
			<Icon icon="lucide:arrow-left" width={16} height={16} />
			<span class="sr-only">Previous slide</span>
		</Button>
	);
};

const CarouselNext: Component<ComponentProps<typeof Button>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "variant", "size"]);
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			data-slot="carousel-next"
			variant={local.variant ?? "outline"}
			size={local.size ?? "icon"}
			class={cn(
				"absolute size-8 rounded-full",
				orientation() === "horizontal"
					? "top-1/2 -right-12 -translate-y-1/2"
					: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
				local.class,
			)}
			disabled={!canScrollNext()}
			onClick={scrollNext}
			{...rest}
		>
			<Icon icon="lucide:arrow-right" width={16} height={16} />
			<span class="sr-only">Next slide</span>
		</Button>
	);
};

export {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselTransition,
};
