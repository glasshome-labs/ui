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
			// Manual nav should not kill autoplay for good; hovering pauses it and
			// leaving resumes, which is what a hero carousel wants.
			plugins.push(
				Autoplay({
					delay: autoplayMs,
					stopOnInteraction: false,
					stopOnMouseEnter: true,
					stopOnFocusIn: true,
				}),
			);
		}

		const embla = EmblaCarousel(viewport, { loop }, plugins);
		const dots = Array.from(el.querySelectorAll("[data-carousel-dot]")) as HTMLButtonElement[];

		let previous = -1;
		const onSelect = () => {
			const index = embla.selectedScrollSnap();
			embla.slideNodes().forEach((node, i) => {
				node.toggleAttribute("data-selected", i === index);
				// The outgoing slide stays visible one layer down until the sweep lands.
				node.toggleAttribute("data-prev", i === previous && i !== index);
			});
			previous = index;
			dots.forEach((dot, i) => {
				dot.className = carouselDot(i === index);
				dot.setAttribute("aria-current", String(i === index));
			});
			el.dispatchEvent(new CustomEvent("carousel:select", { detail: { index }, bubbles: true }));
		};

		el.addEventListener("keydown", (e) => {
			const key = (e as KeyboardEvent).key;
			if (key !== "ArrowLeft" && key !== "ArrowRight") return;
			e.preventDefault();
			if (key === "ArrowLeft") embla.scrollPrev();
			else embla.scrollNext();
		});

		// A host that covers the carousel (a lightbox) pauses it, so the slide
		// does not change behind the overlay.
		const autoplay = (embla.plugins() as { autoplay?: { play: () => void; stop: () => void } })
			.autoplay;
		el.addEventListener("carousel:pause", () => autoplay?.stop());
		el.addEventListener("carousel:resume", () => autoplay?.play());

		dots.forEach((dot, i) => {
			dot.addEventListener("click", () => embla.scrollTo(i));
		});
		el.querySelector("[data-carousel-prev]")?.addEventListener("click", () => embla.scrollPrev());
		el.querySelector("[data-carousel-next]")?.addEventListener("click", () => embla.scrollNext());

		onSelect();
		embla.on("select", onSelect);
		embla.on("reInit", onSelect);
	}
}
