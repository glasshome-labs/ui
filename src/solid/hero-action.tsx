import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { ALERT_ICON_BG_CLASS, alertIconBgStyle } from "../lib/alert-tones.js";
import { glassToneText } from "../lib/glass-tone.js";
import { cn } from "../lib/utils.js";
import { Badge } from "./badge.js";
import { RadioGroupItem } from "./radio-group.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js";

/* One card for every "pick one of a few big choices" screen: the setup
 * wizard's connect/sign-in steps and People's pick-one dialogs. Chrome lives
 * here once; the two call shapes below (nav button vs. grouped radio item)
 * share it so neither surface can drift from the other. */
const HERO_ACTION_CHROME =
	"onboard-card glass group relative flex min-h-[6.25rem] items-center gap-4 overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 [--glass-lift:0.4] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 hover:[--glass-lift:0.85] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:translate-y-0";

/* glassToneText tints a label toward its own tone, which stops being legible
 * on a dark surface once the tone itself is dark (the GlassHome deep blue).
 * Lift dark tones to a readable lightness first; light tones pass through. */
function titleTone(tone: string): string {
	const l = Number.parseFloat(tone.match(/oklch\(\s*([0-9.]+)/)?.[1] ?? "");
	if (Number.isNaN(l) || l >= 0.68) return tone;
	return tone.replace(/oklch\(\s*[0-9.]+/, "oklch(0.76");
}

interface HeroActionContentProps {
	icon: string;
	iconImage?: string;
	title: string;
	description: string;
	accentVar: string;
	recommended?: boolean;
	recommendedHint?: string;
	/** "arrow" is the go-somewhere-else watermark (setup); "check" is the
	 *  picked-state glyph for a grouped radio item (People dialogs). */
	ornament: "arrow" | "check";
}

function HeroActionContent(props: HeroActionContentProps) {
	return (
		<>
			{/* Absolutely positioned (ALERT_ICON_BG_CLASS): a sibling of the flex
			 *  row below, not a flex child, so it never competes for row gap. */}
			<Show when={props.ornament === "arrow"}>
				<span
					class={`${ALERT_ICON_BG_CLASS} transition-transform duration-200 group-hover:translate-x-1`}
					style={alertIconBgStyle("var(--surface-tone)")}
					aria-hidden="true"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14" />
						<path d="m12 5 7 7-7 7" />
					</svg>
				</span>
			</Show>

			<div class="flex w-full items-center gap-4">
				<span
					class="relative flex shrink-0 items-center justify-center"
					style={{ color: "var(--surface-tone)" }}
				>
					<Show
						when={props.iconImage}
						fallback={<Icon icon={props.icon} width={52} aria-hidden="true" />}
					>
						{(src) => <img src={src()} alt="" class="size-14 object-contain" aria-hidden="true" />}
					</Show>
				</span>
				<div class="relative min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<h3
							class="font-semibold text-lg leading-tight"
							style={{ color: glassToneText(titleTone(props.accentVar)) }}
						>
							{props.title}
						</h3>
						<Show when={props.recommended}>
							<Tooltip openDelay={150}>
								<TooltipTrigger as={Badge} tone="var(--success)">
									Recommended
								</TooltipTrigger>
								<Show when={props.recommendedHint}>
									{(hint) => <TooltipContent>{hint()}</TooltipContent>}
								</Show>
							</Tooltip>
						</Show>
					</div>
					<p class="mt-1 truncate text-foreground/80 text-sm">{props.description}</p>
				</div>

				<Show when={props.ornament === "check"}>
					<Icon
						icon="lucide:check"
						width={20}
						height={20}
						aria-hidden="true"
						data-slot="hero-action-check"
						class="shrink-0 text-primary opacity-0 transition-opacity duration-200 group-data-[checked]:opacity-100"
					/>
				</Show>
			</div>
		</>
	);
}

/** Navigates away immediately on click — the setup wizard's connect/sign-in
 *  steps. Not part of a group, no persisted selection. */
export function HeroAction(props: {
	icon: string;
	iconImage?: string;
	title: string;
	description: string;
	onClick: () => void;
	accentVar: string;
	disabled?: boolean;
	recommended?: boolean;
	recommendedHint?: string;
	class?: string;
}) {
	return (
		<button
			type="button"
			onClick={() => !props.disabled && props.onClick()}
			disabled={props.disabled}
			class={cn(HERO_ACTION_CHROME, props.class)}
			style={{ "--glass-tone": props.accentVar } as JSX.CSSProperties}
		>
			<HeroActionContent
				icon={props.icon}
				iconImage={props.iconImage}
				title={props.title}
				description={props.description}
				accentVar={props.accentVar}
				recommended={props.recommended}
				recommendedHint={props.recommendedHint}
				ornament="arrow"
			/>
		</button>
	);
}

/** A `HeroAction` used inside `OptionCardGroup` as a persisted, revisable
 *  choice instead of a one-shot navigation button — People's pick-one
 *  dialogs. Radio semantics (role, aria-checked, keyboard nav) come from
 *  `RadioGroupItem`, same accessible door as `OptionCard`. */
export function HeroOption(props: {
	value: string;
	icon: string;
	iconImage?: string;
	title: string;
	description: string;
	/** Neutral by default — People's pickers don't carry setup's per-option
	 *  brand colors. */
	accentVar?: string;
	disabled?: boolean;
	/** Content revealed under the card when it's the picked option (e.g. a
	 *  nested field), same slot `OptionCard` offers. */
	children?: JSX.Element;
	class?: string;
}) {
	const accentVar = () => props.accentVar ?? "var(--muted-foreground)";
	return (
		<div data-slot="hero-option" class="flex min-w-0 flex-col gap-2">
			<RadioGroupItem
				value={props.value}
				disabled={props.disabled}
				showControl={false}
				class={cn(
					HERO_ACTION_CHROME,
					"min-w-0 cursor-pointer data-[checked]:border-primary",
					props.class,
				)}
				style={{ "--glass-tone": accentVar() } as JSX.CSSProperties}
			>
				<HeroActionContent
					icon={props.icon}
					iconImage={props.iconImage}
					title={props.title}
					description={props.description}
					accentVar={accentVar()}
					ornament="check"
				/>
			</RadioGroupItem>
			{props.children}
		</div>
	);
}
