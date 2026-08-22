/* A stepper's position is a visual pattern (dots) plus a spoken one ("Step 2 of
 * 4"); both halves are asserted here because either alone leaves a group of
 * users without the position. */
import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { StepIndicator } from "../../src/solid/step-indicator.js";

afterEach(cleanup);

function dots(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>('[data-slot="step-indicator-dot"]'));
}

describe("StepIndicator", () => {
	it("renders one dot per step and flags the current one", () => {
		const { container } = render(() => <StepIndicator count={4} index={1} />);
		const rendered = dots(container);
		expect(rendered).toHaveLength(4);
		expect(rendered.map((d) => d.getAttribute("aria-current"))).toEqual([null, "step", null, null]);
	});

	it("speaks the position for screen readers", () => {
		const { container } = render(() => <StepIndicator count={4} index={1} />);
		const label = container.querySelector<HTMLElement>(".sr-only");
		expect(label?.textContent).toBe("Step 2 of 4");
	});

	it("passes its class through and paints the current dot with the accent", () => {
		const { container } = render(() => <StepIndicator count={2} index={0} class="probe" />);
		const root = container.querySelector<HTMLElement>('[data-slot="step-indicator"]');
		expect(root?.className).toContain("probe");
		const [current, rest] = dots(container);
		expect(current?.className).toContain("bg-primary");
		expect(rest?.className).not.toContain("bg-primary");
	});
});
