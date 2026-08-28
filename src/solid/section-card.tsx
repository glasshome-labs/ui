import { Icon } from "@iconify-icon/solid";
import { type ComponentProps, type JSX, Show, splitProps } from "solid-js";
import { CARD_BLUR, CARD_SURFACE_BASE, SECTION_ROW_SURFACE } from "../lib/card-classes.js";
import { ICON_PILL, ICON_PILL_TINT } from "../lib/pill-classes.js";
import {
	SECTION_INNER_RADIUS,
	SECTION_OUTER_RADIUS,
	SECTION_PADDING,
} from "../lib/section-tokens.js";
import { cn } from "../lib/utils.js";
import { CountPill } from "./count-pill.js";

/* Performant-blur injection (dash): when active() the card gates CARD_BLUR off
 * and paints the engine's precomputed slice via style() instead. */
export type GlassSurface = {
	ref?: (el: HTMLElement) => void;
	style?: () => JSX.CSSProperties;
	active?: () => boolean;
};

export const NOOP_GLASS: Required<GlassSurface> = {
	ref: () => {},
	style: () => ({}),
	active: () => false,
};

type SectionCardProps = {
	icon?: string;
	title?: JSX.Element;
	subtitle?: JSX.Element;
	count?: number | string;
	action?: JSX.Element;
	toolbar?: JSX.Element;
	headerClass?: string;
	subtitleClass?: string;
	class?: string;
	glass?: GlassSurface;
	children: JSX.Element;
};

export function SectionCard(props: SectionCardProps) {
	const glass = () => props.glass ?? NOOP_GLASS;
	const active = () => glass().active?.() ?? false;
	const hasHeader = () =>
		props.icon != null || props.title != null || props.action != null || props.count != null;

	return (
		<section
			data-slot="section-card"
			ref={glass().ref}
			class={cn(
				CARD_SURFACE_BASE,
				SECTION_OUTER_RADIUS,
				SECTION_PADDING,
				"relative flex flex-col gap-3 overflow-hidden transition-colors [contain:layout_style_paint] md:gap-4",
				props.class,
			)}
			classList={{ [CARD_BLUR]: !active() }}
			style={glass().style?.() ?? {}}
		>
			<Show when={hasHeader()}>
				<header
					data-slot="section-card-header"
					class={cn("flex items-center gap-2 sm:gap-3", props.headerClass)}
				>
					<Show when={props.icon}>{(icon) => <SectionIcon icon={icon()} />}</Show>
					<div data-slot="section-card-headings" class="flex min-w-0 flex-1 flex-col gap-0.5">
						<div data-slot="section-card-headline" class="flex min-w-0 items-center gap-2 sm:gap-3">
							<Show when={props.title}>
								<SectionTitle>{props.title}</SectionTitle>
							</Show>
							<Show when={props.count != null}>
								<CountPill>{props.count}</CountPill>
							</Show>
						</div>
						<Show when={props.subtitle}>
							<SectionMeta class={props.subtitleClass}>{props.subtitle}</SectionMeta>
						</Show>
					</div>
					<Show when={props.action}>
						<div data-slot="section-card-actions" class="flex shrink-0 items-center gap-2">
							{props.action}
						</div>
					</Show>
				</header>
			</Show>
			<Show when={props.toolbar}>
				<div
					data-slot="section-card-toolbar"
					class={cn(hasHeader() && "border-border/50 border-t pt-3")}
				>
					{props.toolbar}
				</div>
			</Show>
			<div data-slot="section-card-body">{props.children}</div>
		</section>
	);
}

export function SectionRow(props: ComponentProps<"div">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			data-slot="section-row"
			class={cn(SECTION_ROW_SURFACE, SECTION_INNER_RADIUS, SECTION_PADDING, local.class)}
			{...rest}
		/>
	);
}

type SectionIconSize = "sm" | "md" | "lg";

const ICON_DIMENSIONS: Record<SectionIconSize, string> = {
	sm: "size-7 [&>iconify-icon]:text-[16px]",
	md: "size-10 sm:size-11 [&>iconify-icon]:text-[20px] sm:[&>iconify-icon]:text-[22px]",
	lg: "size-12 sm:size-14 [&>iconify-icon]:text-[24px] sm:[&>iconify-icon]:text-[28px]",
};

/** @deprecated pass a CSS color to `tone` instead. */
const LEGACY_TONES: Record<string, string | undefined> = {
	neutral: undefined,
	primary: "var(--primary)",
};

export function SectionIcon(props: {
	icon?: string;
	children?: JSX.Element;
	size?: SectionIconSize;
	/** Any CSS color. `"neutral"` and `"primary"` are the deprecated old enum. */
	tone?: string;
	class?: string;
}) {
	const tone = () => {
		const t = props.tone;
		if (t == null) return undefined;
		return t in LEGACY_TONES ? LEGACY_TONES[t] : t;
	};
	return (
		<span
			data-slot="section-icon"
			class={cn(
				tone() ? ICON_PILL_TINT : `${ICON_PILL} text-foreground/80`,
				SECTION_INNER_RADIUS,
				ICON_DIMENSIONS[props.size ?? "md"],
				props.class,
			)}
			style={tone() ? { "--glass-tone": tone() } : undefined}
		>
			<Show when={props.children} fallback={props.icon ? <Icon icon={props.icon} /> : null}>
				{props.children}
			</Show>
		</span>
	);
}

export function SectionTitle(props: { children: JSX.Element; class?: string }) {
	return (
		<h2
			data-slot="section-title"
			class={cn(
				"truncate font-bold text-foreground text-lg tracking-tight sm:text-xl",
				props.class,
			)}
		>
			{props.children}
		</h2>
	);
}

export function SectionSubtitle(props: { children: JSX.Element; class?: string }) {
	return (
		<h3
			data-slot="section-subtitle"
			class={cn("font-semibold text-base leading-tight", props.class)}
		>
			{props.children}
		</h3>
	);
}

/** @deprecated SectionMeta, or FieldLegend for a titled group of rows. */
export function SectionLabel(props: { children: JSX.Element; class?: string }) {
	return <SectionMeta class={cn("font-medium", props.class)}>{props.children}</SectionMeta>;
}

export function SectionMeta(props: { children: JSX.Element; class?: string }) {
	return (
		<p data-slot="section-meta" class={cn("text-muted-foreground text-xs", props.class)}>
			{props.children}
		</p>
	);
}

export function SectionRowSkeleton(props: { class?: string }) {
	return (
		<div
			data-slot="section-row-skeleton"
			aria-hidden="true"
			class={cn(
				SECTION_ROW_SURFACE,
				SECTION_INNER_RADIUS,
				"h-14 animate-pulse [--glass-rim:0.15]",
				props.class,
			)}
		/>
	);
}

export function SectionRowSkeletons(props: { count?: number }) {
	const n = props.count ?? 3;
	return (
		<div data-slot="section-row-skeletons" class="flex flex-col gap-2" aria-busy="true">
			{Array.from({ length: n }, () => (
				<SectionRowSkeleton />
			))}
		</div>
	);
}
