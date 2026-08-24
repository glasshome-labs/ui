import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { cn } from "../lib/utils.js";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";

/* The card is the affordance, so the radio's own control is suppressed and the
 * tinted border plus the check carry the picked state. Padding lives inside the
 * label, not on the item, so the whole card is a click target. */
const OPTION_CARD_CHROME =
	"group/option-card cursor-pointer border border-border transition-colors duration-200 hover:bg-foreground/[0.03] has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 data-[checked]:border-primary data-[checked]:bg-primary/5 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent";

type OptionCardSize = "default" | "hero";

/* Visual weight per size: "hero" reaches the setup wizard's big-tile register
 * (52px icon, generous padding, min height) for a pick-one screen that IS the
 * page's main content, not a compact row among other fields. */
const OPTION_CARD_SIZE: Record<
	OptionCardSize,
	{
		chrome: string;
		row: string;
		iconSize: number;
		icon: string;
		title: string;
		description: string;
		check: number;
	}
> = {
	default: {
		chrome: "rounded-md",
		row: "gap-3 p-3",
		iconSize: 18,
		icon: "text-muted-foreground",
		title: "font-medium leading-snug",
		description: "text-muted-foreground text-xs leading-normal",
		check: 16,
	},
	hero: {
		chrome: "rounded-2xl min-h-[6.25rem]",
		row: "gap-4 p-5",
		iconSize: 52,
		icon: "text-muted-foreground",
		title: "font-semibold text-lg leading-tight",
		description: "text-foreground/80 text-sm leading-normal",
		check: 20,
	},
};

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
	disabled?: boolean;
	/** "hero" reaches the setup wizard's big-tile register; default is the compact row. */
	size?: OptionCardSize;
	class?: string;
	children?: JSX.Element;
}) {
	const size = () => OPTION_CARD_SIZE[props.size ?? "default"];
	return (
		<div data-slot="option-card" class={cn("flex flex-col gap-2", props.class)}>
			<RadioGroupItem
				value={props.value}
				disabled={props.disabled}
				showControl={false}
				class={cn(OPTION_CARD_CHROME, size().chrome)}
			>
				<div class={cn("flex w-full items-center", size().row)}>
					<Show when={props.icon}>
						{(icon) => (
							<Icon
								icon={icon()}
								width={size().iconSize}
								height={size().iconSize}
								aria-hidden="true"
								class={cn("shrink-0", size().icon)}
							/>
						)}
					</Show>
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span data-slot="option-card-title" class={size().title}>
							{props.title}
						</span>
						<Show when={props.description}>
							{(description) => (
								<span data-slot="option-card-description" class={size().description}>
									{description()}
								</span>
							)}
						</Show>
					</div>
					<Icon
						icon="lucide:check"
						width={size().check}
						height={size().check}
						aria-hidden="true"
						data-slot="option-card-check"
						class="shrink-0 text-primary opacity-0 transition-opacity duration-200 group-data-[checked]/option-card:opacity-100"
					/>
				</div>
			</RadioGroupItem>
			{props.children}
		</div>
	);
}
