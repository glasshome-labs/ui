import { For } from "solid-js";
import {
	AspectRatio,
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	Overlay,
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
	ScrollArea,
	ScrollBar,
} from "../../src/solid";
import { CatalogGroup, CatalogItem, CatalogNote } from "../CatalogKit";

export function LayoutCatalog() {
	return (
		<CatalogGroup id="cat-layout" title="Layout & media">
			<CatalogItem name="AspectRatio" hint="16 / 9">
				<div class="w-full max-w-[240px]">
					<AspectRatio
						ratio={16 / 9}
						class="overflow-hidden rounded-md border border-border/50 bg-muted"
					>
						<div class="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/40 font-mono text-muted-foreground text-xs">
							16 / 9
						</div>
					</AspectRatio>
				</div>
			</CatalogItem>

			<CatalogItem name="ScrollArea" hint="ScrollArea · ScrollBar">
				<ScrollArea class="h-32 w-full rounded-md border border-border/50 bg-muted/20">
					<div class="space-y-1 p-3">
						<For each={Array.from({ length: 16 }, (_, i) => i + 1)}>
							{(n) => (
								<div class="rounded bg-card/60 px-2 py-1 text-foreground text-xs">Row {n}</div>
							)}
						</For>
					</div>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</CatalogItem>

			<CatalogItem name="Carousel" hint="embla · CarouselContent/Item/Prev/Next">
				<div class="w-full px-12">
					<Carousel opts={{ loop: true }} class="w-full">
						<CarouselContent>
							<For each={["A", "B", "C", "D"]}>
								{(slide) => (
									<CarouselItem>
										<div class="flex h-24 items-center justify-center rounded-md border border-border/50 bg-muted/30 font-semibold text-2xl text-foreground">
											{slide}
										</div>
									</CarouselItem>
								)}
							</For>
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>
				<CatalogNote>arrows / arrow-keys scroll; loops</CatalogNote>
			</CatalogItem>

			<CatalogItem name="Carousel wipe" hint="stacked slides · autoplay · dots">
				<div class="w-full px-12">
					<Carousel transition="wipe" autoplay={2500} opts={{ loop: true }} class="w-full">
						<CarouselContent>
							<For each={["one", "two", "three"]}>
								{(slide, i) => (
									<CarouselItem>
										<div
											class="flex h-24 items-center justify-center rounded-md border border-border/50 font-semibold text-2xl text-foreground"
											style={{ background: `var(--chart-${i() + 1})` }}
										>
											{slide}
										</div>
									</CarouselItem>
								)}
							</For>
						</CarouselContent>
						<CarouselDots class="mt-3" />
					</Carousel>
				</div>
				<CatalogNote>
					transition="wipe" | "fade" | "slide"; autoplay pauses on interaction and is skipped under
					prefers-reduced-motion. Known: wipe stacks its slides in one grid cell, which collapses
					every scroll snap onto one point, so wipe cannot be dragged. Autoplay, arrows and dots
					drive it by index and do work.
				</CatalogNote>
			</CatalogItem>

			<CatalogItem name="Carousel fade" hint="cross-fade · autoplay 2s · dots">
				<div class="w-full px-12">
					<Carousel transition="fade" autoplay={2000} opts={{ loop: true }} class="w-full">
						<CarouselContent>
							<For each={["one", "two", "three"]}>
								{(slide, i) => (
									<CarouselItem>
										<div
											class="flex h-24 items-center justify-center rounded-md border border-border/50 font-semibold text-2xl text-foreground"
											style={{ background: `var(--chart-${i() + 1})` }}
										>
											{slide}
										</div>
									</CarouselItem>
								)}
							</For>
						</CarouselContent>
						<CarouselDots class="mt-3" />
					</Carousel>
				</div>
				<CatalogNote>
					three dots, cross-fading one → two → three every 2s on its own, and draggable. Anything
					less means the fade track lost embla's scroll snaps.
				</CatalogNote>
			</CatalogItem>

			<CatalogItem name="Overlay" hint="floating glass panel">
				<div class="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md">
					<div class="absolute inset-0 bg-gradient-to-br from-primary/60 via-accent/40 to-muted" />
					<div class="absolute inset-0 grid grid-cols-4 gap-2 p-3 opacity-70">
						<For each={Array.from({ length: 8 })}>
							{() => <div class="rounded-full bg-foreground/30" />}
						</For>
					</div>
					<Overlay class="relative rounded-xl px-5 py-3">
						<span class="font-medium text-foreground text-sm">Floating panel</span>
					</Overlay>
				</div>
			</CatalogItem>

			<CatalogItem name="Resizable" hint="PanelGroup · Panel · Handle (drag divider)" span={2}>
				<div class="h-40 w-full overflow-hidden rounded-md border border-border/50">
					<ResizablePanelGroup direction="horizontal">
						<ResizablePanel defaultSize={40} minSize={20}>
							<div class="flex h-full items-center justify-center bg-muted/30 p-4 font-mono text-muted-foreground text-xs">
								Sidebar
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={60} minSize={20}>
							<div class="flex h-full items-center justify-center bg-card/40 p-4 font-mono text-muted-foreground text-xs">
								Content
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</CatalogItem>
		</CatalogGroup>
	);
}
