import { For } from "solid-js";
import { DOT, DOT_ACTIVE } from "../lib/dot-classes.js";
import { cn } from "../lib/utils.js";

/**
 * Position inside a multi-step flow: dots for the eye, one spoken line for
 * screen readers. The dots carry no text of their own, so the sr-only line is
 * the only place the position is readable.
 */
export function StepIndicator(props: { count: number; index: number; class?: string }) {
	const steps = () => Array.from({ length: Math.max(props.count, 0) }, (_, step) => step);

	return (
		<div
			data-slot="step-indicator"
			class={cn("flex items-center justify-center gap-1.5", props.class)}
		>
			<span class="sr-only">{`Step ${props.index + 1} of ${props.count}`}</span>
			<For each={steps()}>
				{(step) => (
					<span
						data-slot="step-indicator-dot"
						aria-current={step === props.index ? "step" : undefined}
						class={cn(DOT, step === props.index && DOT_ACTIVE)}
					/>
				)}
			</For>
		</div>
	);
}
