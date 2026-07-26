import EmblaCarousel from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { type CarouselTransition, carouselDot } from "./carousel-classes.js";

/**
 * Client enhancement for astro/Carousel.astro. The markup is already in the
 * server HTML; this only adds behaviour, so the slides stay visible (and
 * indexable) if the script never runs.
 *
 * Emits `carousel:select` with `{ index }` so a host page can sync its own
 * chrome (labels, lightboxes) without owning the carousel.
 */
export function initCarousels(root: ParentNode = document) {
	const roots = Array.from(root.querySelectorAll("[data-carousel]")) as HTMLElement[];
	for (const el of roots) {
		if (el.dataset.carouselReady) continue;
		el.dataset.carouselReady = "1";

		const viewport = el.querySelector("[data-carousel-viewport]") as HTMLElement | null;
		if (!viewport) continue;

		const transition = (el.dataset.carouselTransition ?? "slide") as CarouselTransition;
		const autoplayMs = Number(el.dataset.carouselAutoplay ?? 0);
		const loop = el.dataset.carouselLoop === "";
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const plugins = [];
		if (transition !== "slide") plugins.push(Fade());
		if (autoplayMs > 0 && !reduced) {
			plugins.push(Autoplay({ delay: autoplayMs, stopOnInteraction: true }));
		}

		const embla = EmblaCarousel(viewport, { loop }, plugins);
		const dots = Array.from(el.querySelectorAll("[data-carousel-dot]")) as HTMLButtonElement[];

		const onSelect = () => {
			const index = embla.selectedScrollSnap();
			embla.slideNodes().forEach((node, i) => node.toggleAttribute("data-selected", i === index));
			dots.forEach((dot, i) => {
				dot.className = carouselDot(i === index);
				dot.setAttribute("aria-current", String(i === index));
			});
			el.dispatchEvent(new CustomEvent("carousel:select", { detail: { index }, bubbles: true }));
		};

		dots.forEach((dot, i) => dot.addEventListener("click", () => embla.scrollTo(i)));
		el.querySelector("[data-carousel-prev]")?.addEventListener("click", () => embla.scrollPrev());
		el.querySelector("[data-carousel-next]")?.addEventListener("click", () => embla.scrollNext());

		onSelect();
		embla.on("select", onSelect);
		embla.on("reInit", onSelect);
	}
}
