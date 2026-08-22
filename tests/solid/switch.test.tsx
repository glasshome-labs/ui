/* The switch's whole job is to say on or off at a glance, and both halves of
 * that (the track surface and the thumb color) are set from state rather than
 * from a stylesheet a caller can inspect, so they get asserted here. */
import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { FIELD_CHROME } from "../../src/lib/input-classes.js";
import { Switch } from "../../src/solid/switch.js";

function parts(container: HTMLElement) {
	const root = container.querySelector<HTMLElement>('[data-slot="switch"]');
	const thumb = container.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
	if (!root || !thumb) throw new Error("switch did not render its parts");
	return { root, thumb };
}

describe("Switch", () => {
	it("paints the thumb neutral when off and accented when on", () => {
		const off = render(() => <Switch checked={false} />);
		expect(parts(off.container).thumb.style.background).toBe("var(--muted-foreground)");

		const on = render(() => <Switch checked />);
		expect(parts(on.container).thumb.style.background).toBe("var(--primary)");
	});

	it("wears the empty-well chrome when off and the tinted glass when on", () => {
		const off = render(() => <Switch checked={false} />);
		const offClass = parts(off.container).root.className;
		for (const token of FIELD_CHROME.split(" ")) expect(offClass, token).toContain(token);
		expect(offClass).not.toContain("glass-tint");

		const on = render(() => <Switch checked />);
		expect(parts(on.container).root.className).toContain("glass-tint");
	});

	it("moves the thumb and reports state through aria-checked", () => {
		const off = render(() => <Switch checked={false} />);
		expect(parts(off.container).root.getAttribute("aria-checked")).toBe("false");
		expect(parts(off.container).thumb.style.transform).toBe("translateX(0px)");

		const on = render(() => <Switch checked />);
		expect(parts(on.container).root.getAttribute("aria-checked")).toBe("true");
		expect(parts(on.container).thumb.style.transform).not.toBe("translateX(0px)");
	});

	it("carries an accessible name through to the role=switch element", () => {
		const labelled = render(() => <Switch checked aria-label="Away mode" />);
		expect(parts(labelled.container).root.getAttribute("aria-label")).toBe("Away mode");

		const described = render(() => <Switch checked aria-labelledby="away-mode-title" />);
		expect(parts(described.container).root.getAttribute("aria-labelledby")).toBe("away-mode-title");
	});

	it("repaints the thumb when the controlled value flips", () => {
		const [checked, setChecked] = createSignal(false);
		const { container } = render(() => (
			<Switch checked={checked()} onChange={(next) => setChecked(next)} />
		));
		expect(parts(container).thumb.style.background).toBe("var(--muted-foreground)");

		fireEvent.click(parts(container).root);
		expect(checked()).toBe(true);
		expect(parts(container).thumb.style.background).toBe("var(--primary)");
	});
});
