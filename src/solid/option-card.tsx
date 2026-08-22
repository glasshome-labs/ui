import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { cn } from "../lib/utils.js";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";

/* The card is the affordance, so the radio's own control is suppressed and the
 * tinted border plus the check carry the picked state. Padding lives inside the
 * label, not on the item, so the whole card is a click target. */
const OPTION_CARD_CHROME =
	"group/option-card cursor-pointer rounded-md border border-border transition-colors duration-200 hover:bg-foreground/[0.03] has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 data-[checked]:border-primary data-[checked]:bg-primary/5 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent";

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
	class?: string;
	children?: JSX.Element;
}) {
	return (
		<div data-slot="option-card" class={cn("flex flex-col gap-2", props.class)}>
			<RadioGroupItem
				value={props.value}
				disabled={props.disabled}
				showControl={false}
				class={OPTION_CARD_CHROME}
			>
				<div class="flex w-full items-center gap-3 p-3">
					<Show when={props.icon}>
						{(icon) => (
							<Icon
								icon={icon()}
								width={18}
								height={18}
								aria-hidden="true"
								class="shrink-0 text-muted-foreground"
							/>
						)}
					</Show>
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span data-slot="option-card-title" class="font-medium leading-snug">
							{props.title}
						</span>
						<Show when={props.description}>
							{(description) => (
								<span
									data-slot="option-card-description"
									class="text-muted-foreground text-xs leading-normal"
								>
									{description()}
								</span>
							)}
						</Show>
					</div>
					<Icon
						icon="lucide:check"
						width={16}
						height={16}
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
