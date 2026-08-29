import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { CARD_SURFACE } from "../lib/card-classes.js";
import { isNeutralTone, NEUTRAL_KNOBS } from "../lib/glass-tone.js";
import { cn } from "../lib/utils.js";
import { Ornament } from "./ornament.js";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";

/* The card is the affordance, so the radio's own control is suppressed and the
 * toned surface plus the check ornament carry the picked state; an accented card keeps its own tone at rest. Tone alone (no
 * .glass-tint) because a card is body copy: .glass-tint would mix the label
 * colour toward the tone, and toward `transparent` while nothing is picked.
 * Padding lives inside the label, not on the item, so the whole card is a
 * click target. */
const OPTION_CARD_CHROME = `${CARD_SURFACE} group/option-card relative cursor-pointer overflow-hidden rounded-md transition-glass duration-200 hover:[--glass-base:color-mix(in_srgb,var(--card)_80%,transparent)] has-[:focus-visible]:[--glass-edge:var(--ring)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 [&:not([style*=--glass-tone])]:data-[checked]:[--glass-tone:var(--primary)] data-[checked]:[--glass-edge:color-mix(in_srgb,var(--primary)_45%,transparent)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50`;

export function OptionCardGroup(props: {
	value: string | null;
	onChange: (value: string) => void;
	"aria-label"?: string;
	class?: string;
	children: JSX.Element;
}) {
	return (
		<RadioGroup
			class={cn("gap-2", props.class)}
			value={props.value ?? undefined}
			onChange={props.onChange}
			aria-label={props["aria-label"]}
		>
			{props.children}
		</RadioGroup>
	);
}

export function OptionCard(props: {
	value: string;
	title: string;
	description?: string;
	icon?: string;
	iconImage?: string;
	/** Per-option tone at rest (setup's brand colours); neutral by default. */
	accentVar?: string;
	/** Drop the check when picking the card is itself the next step. */
	ornament?: "check" | "none";
	/** Fires on every click, including a re-pick of the already-checked card,
	 *  which the group's `onChange` alone never reports. */
	onPick?: () => void;
	disabled?: boolean;
	class?: string;
	/** Content revealed under the card (a nested field). */
	children?: JSX.Element;
}) {
	return (
		<div data-slot="option-card" class={cn("flex min-w-0 flex-col gap-2", props.class)}>
			<RadioGroupItem
				value={props.value}
				disabled={props.disabled}
				showControl={false}
				onClick={() => !props.disabled && props.onPick?.()}
				class={cn(OPTION_CARD_CHROME, isNeutralTone(props.accentVar) && NEUTRAL_KNOBS)}
				style={
					props.accentVar ? ({ "--glass-tone": props.accentVar } as JSX.CSSProperties) : undefined
				}
			>
				<Ornament kind={props.ornament ?? "check"} />
				<div data-slot="option-card-row" class="flex w-full items-start gap-3 p-3">
					<Show
						when={props.iconImage}
						fallback={<OptionIcon icon={props.icon} toned={!!props.accentVar} />}
					>
						{(src) => (
							<img src={src()} alt="" aria-hidden="true" class="size-5 shrink-0 object-contain" />
						)}
					</Show>
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span data-slot="option-card-title" class="font-medium text-sm leading-snug">
							{props.title}
						</span>
						<Show when={props.description}>
							{(description) => (
								<span
									data-slot="option-card-description"
									class="text-muted-foreground text-sm leading-normal"
								>
									{description()}
								</span>
							)}
						</Show>
					</div>
				</div>
			</RadioGroupItem>
			{props.children}
		</div>
	);
}

/* The icon sits on the title line, the mini form of HeroAction's big glyph:
 * toned with the card when it has an accent, muted otherwise. */
function OptionIcon(props: { icon?: string; toned: boolean }) {
	return (
		<Show when={props.icon}>
			{(icon) => (
				<Icon
					icon={icon()}
					width={20}
					height={20}
					aria-hidden="true"
					class={cn(
						"mt-px shrink-0",
						props.toned ? "text-(--surface-tone)" : "text-muted-foreground",
					)}
				/>
			)}
		</Show>
	);
}
