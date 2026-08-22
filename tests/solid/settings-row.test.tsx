/* SwitchRow is the one door for a labelled toggle row, so the two things a
 * caller cannot rebuild without forking it get asserted: the muted sub-line and
 * the disabled state, which must both dim the row and refuse the toggle. */
import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { SwitchRow } from "../../src/solid/settings-row.js";

afterEach(cleanup);

function toggle(container: HTMLElement) {
	const found = container.querySelector<HTMLElement>('[data-slot="switch"]');
	if (!found) throw new Error("switch row rendered no switch");
	return found;
}

describe("SwitchRow", () => {
	it("renders the description as a muted line under the label", () => {
		const { container } = render(() => (
			<SwitchRow
				label="Weekly digest"
				description="One summary of everything that happened at home."
				checked={false}
				onChange={() => {}}
			/>
		));

		const description = container.querySelector<HTMLElement>('[data-slot="field-description"]');
		expect(description?.textContent).toBe("One summary of everything that happened at home.");
		expect(description?.className).toContain("text-muted-foreground");
	});

	it("omits the description line when none is given", () => {
		const { container } = render(() => (
			<SwitchRow label="Show in Dock" checked onChange={() => {}} />
		));

		expect(container.querySelector('[data-slot="field-description"]')).toBeNull();
	});

	it("names the switch by its label", () => {
		const { container } = render(() => (
			<SwitchRow label="Show in Dock" checked onChange={() => {}} />
		));

		expect(toggle(container).getAttribute("aria-label")).toBe("Show in Dock");
	});

	it("marks the row disabled and blocks the toggle", () => {
		const [checked, setChecked] = createSignal(true);
		const { container } = render(() => (
			<SwitchRow label="Away mode" disabled checked={checked()} onChange={setChecked} />
		));

		const row = container.querySelector<HTMLElement>('[data-slot="field"]');
		expect(row?.getAttribute("data-disabled")).toBe("true");
		expect(toggle(container).hasAttribute("disabled")).toBe(true);

		fireEvent.click(toggle(container));
		expect(checked()).toBe(true);
	});
});
