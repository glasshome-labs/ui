/* The switch's whole job is to say on or off at a glance, and the track surface
 * carries all of it from state rather than from a stylesheet a caller can
 * inspect, so it gets asserted here along with the knob staying one material. */
import { readFileSync } from "node:fs";
import path from "node:path";
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
	it("dims the knob when off and lights it when on", () => {
		const off = render(() => <Switch checked={false} />);
		const on = render(() => <Switch checked />);
		expect(parts(off.container).thumb.style.background).toBe("var(--thumb-face-off)");
		expect(parts(on.container).thumb.style.background).toBe("var(--thumb-face-on)");
	});

	// The bug this file exists for: an off knob that competes with the on knob.
	// Lightness cannot express it in both themes (light reads lit by going
	// darker, dark by going lighter), so the invariant is the hue: on carries
	// --primary's chroma, off stays neutral metal.
	it("tints the on knob and keeps the off knob neutral in both themes", () => {
		const css = readFileSync(
			path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../src/styles/theme.css"),
			"utf-8",
		);
		const chroma = (block: string, token: string) => {
			const match = block.match(new RegExp(`${token}:\\s*oklch\\([0-9.]+\\s+([0-9.]+)`));
			if (!match?.[1]) throw new Error(`no ${token} in block`);
			return Number.parseFloat(match[1]);
		};
		const darkStart = css.indexOf(".dark {");
		for (const block of [css.slice(0, darkStart), css.slice(darkStart)]) {
			expect(chroma(block, "--thumb-face-on")).toBeGreaterThan(0.05);
			expect(chroma(block, "--thumb-face-off")).toBeLessThan(0.05);
		}
	});

	it("resolves the thumb face in both themes", () => {
		const css = readFileSync(
			path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../src/styles/theme.css"),
			"utf-8",
		);
		const light = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
		const dark = css.slice(css.indexOf(".dark"));
		expect(light).toMatch(/--thumb-face-on:\s*[^;]+;/);
		expect(dark).toMatch(/--thumb-face-on:\s*[^;]+;/);
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
		expect(parts(off.container).root.hasAttribute("data-checked")).toBe(false);

		const on = render(() => <Switch checked />);
		expect(parts(on.container).root.getAttribute("aria-checked")).toBe("true");
		// The thumb travels one thumb width, driven by the track's data-checked.
		expect(parts(on.container).root.hasAttribute("data-checked")).toBe(true);
		expect(parts(on.container).thumb.className).toContain(
			"group-data-[checked]/switch:translate-x-full",
		);
	});

	it("carries an accessible name through to the role=switch element", () => {
		const labelled = render(() => <Switch checked aria-label="Away mode" />);
		expect(parts(labelled.container).root.getAttribute("aria-label")).toBe("Away mode");

		const described = render(() => <Switch checked aria-labelledby="away-mode-title" />);
		expect(parts(described.container).root.getAttribute("aria-labelledby")).toBe("away-mode-title");
	});

	it("repaints track and knob together when the controlled value flips", () => {
		const [checked, setChecked] = createSignal(false);
		const { container } = render(() => (
			<Switch checked={checked()} onChange={(next) => setChecked(next)} />
		));
		expect(parts(container).thumb.style.background).toBe("var(--thumb-face-off)");
		expect(parts(container).root.className).not.toContain("glass-tint");

		fireEvent.click(parts(container).root);
		expect(checked()).toBe(true);
		expect(parts(container).root.className).toContain("glass-tint");
		expect(parts(container).thumb.style.background).toBe("var(--thumb-face-on)");
	});
});
