/* Shared by the Solid <Carousel> and astro/Carousel.astro so the two render the
 * same markup. Astro renders slides server-side (SEO, LCP) and enhances them on
 * the client with the same embla engine. */

export type CarouselTransition = "slide" | "fade" | "wipe";

export const CAROUSEL_VIEWPORT = "h-full overflow-hidden";

/** Stacked modes put every slide in one grid cell; slide lays out a flex track. */
export function carouselTrack(
	transition: CarouselTransition,
	orientation: "horizontal" | "vertical" = "horizontal",
) {
	return transition === "slide"
		? `flex ${orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col"}`
		: "grid [&>*]:col-start-1 [&>*]:row-start-1";
}

export function carouselItem(
	transition: CarouselTransition,
	orientation: "horizontal" | "vertical" = "horizontal",
) {
	const base = "min-w-0 shrink-0 grow-0 basis-full";
	if (transition === "wipe") return `${base} carousel-wipe`;
	if (transition === "fade") return base;
	return `${base} ${orientation === "horizontal" ? "pl-4" : "pt-4"}`;
}

export const CAROUSEL_DOTS = "flex items-center justify-center gap-2";

export function carouselDot(active: boolean) {
	return `h-1.5 rounded-full transition-all hover:bg-foreground/70 ${
		active ? "w-6 bg-foreground/80" : "w-1.5 bg-foreground/40"
	}`;
}
