import { Icon } from "@iconify-icon/solid";
import { useRadioGroupContext } from "@kobalte/core/radio-group";
import { children, type JSX, Show } from "solid-js";
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

/* Sub-options live inside the card: the card grows (a grid row morphing
 * 0fr -> 1fr on the morph token) while it is picked, and the content settles
 * in behind the growing edge. Nothing appears below the card. */
const OPTION_CARD_DRAWER =
	"grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--duration-morph) ease-(--ease-morph) group-data-[checked]/option-card:grid-rows-[1fr]";
const OPTION_CARD_DRAWER_CONTENT =
	"-translate-y-2 px-3 pb-3 opacity-0 transition-[opacity,translate] duration-(--duration-expand) ease-(--ease-morph) group-data-[checked]/option-card:translate-y-0 group-data-[checked]/option-card:opacity-100 group-data-[checked]/option-card:delay-[80ms]";

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
	/** Sub-options. The card grows to reveal them while it is picked. */
	children?: JSX.Element;
}) {
	const group = useRadioGroupContext();
	const checked = () => group.isSelectedValue(props.value);
	const kids = children(() => props.children);
	return (
		<div
			data-slot="option-card"
			data-checked={checked() ? "" : undefined}
			class={cn(OPTION_CARD_CHROME, isNeutralTone(props.accentVar) && NEUTRAL_KNOBS, props.class)}
			style={
				props.accentVar ? ({ "--glass-tone": props.accentVar } as JSX.CSSProperties) : undefined
			}
		>
			<Ornament kind={props.ornament ?? "check"} />
			<RadioGroupItem
				value={props.value}
				disabled={props.disabled}
				showControl={false}
				onClick={() => !props.disabled && props.onPick?.()}
				class="w-full cursor-pointer text-left"
			>
				<div data-slot="option-card-row" class="flex w-full items-start gap-3 p-3">
					<Show when={props.iconImage} fallback={<OptionIcon icon={props.icon} />}>
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
			<Show when={kids.toArray().length > 0}>
				<div data-slot="option-card-drawer" class={OPTION_CARD_DRAWER}>
					<div class="min-h-0 overflow-hidden">
						<div class={OPTION_CARD_DRAWER_CONTENT}>{kids()}</div>
					</div>
				</div>
			</Show>
		</div>
	);
}

/* The icon sits on the title line, the mini form of HeroAction's big glyph,
 * in text colour: the tone belongs to the surface and the ornament. */
function OptionIcon(props: { icon?: string }) {
	return (
		<Show when={props.icon}>
			{(icon) => (
				<Icon
					icon={icon()}
					width={20}
					height={20}
					aria-hidden="true"
					class="mt-px shrink-0 text-muted-foreground"
				/>
			)}
		</Show>
	);
}
