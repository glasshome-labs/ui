import { Icon } from "@iconify-icon/solid";
import {
	type Component,
	type ComponentProps,
	createSignal,
	type JSX,
	Show,
	splitProps,
} from "solid-js";
import { cn } from "../lib/utils.js";
import { Input } from "./input.js";

/* Reveal toggle sits absolutely on the right so its icon swap never reprints
 * layout; the input keeps a fixed right-padding regardless of visibility state. */
const PasswordInput: Component<
	Omit<ComponentProps<typeof Input>, "type"> & {
		/** Rendered left-aligned inside the field (e.g. a lock glyph). */
		leading?: JSX.Element;
		showLabel?: string;
		hideLabel?: string;
	}
> = (props) => {
	const [local, rest] = splitProps(props, ["class", "leading", "showLabel", "hideLabel"]);
	const [visible, setVisible] = createSignal(false);

	return (
		<div data-slot="password-input" class="relative">
			<Show when={local.leading}>
				<span
					class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-primary/70"
					aria-hidden="true"
				>
					{local.leading}
				</span>
			</Show>
			<Input
				type={visible() ? "text" : "password"}
				// Caller class first, reveal-button padding last: a caller-supplied
				// px-* must never win the merge and reclaim the button's space.
				class={cn(local.class, local.leading && "pl-14", "pr-12")}
				{...rest}
			/>
			<button
				type="button"
				data-slot="password-input-toggle"
				aria-label={
					visible() ? (local.hideLabel ?? "Hide password") : (local.showLabel ?? "Show password")
				}
				onClick={() => setVisible((v) => !v)}
				class="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-muted-foreground/70 transition-colors hover:text-foreground"
			>
				<Icon icon={visible() ? "lucide:eye-off" : "lucide:eye"} width={20} aria-hidden="true" />
			</button>
		</div>
	);
};

export { PasswordInput };
