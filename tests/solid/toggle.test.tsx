/* The outline variant used to be shadcn's own border-input/bg-transparent
 * chrome, which the pressed state's `glass` class silently flattened
 * (`bg-*`/`border-*` are no-ops on a glass element, so `hover:bg-muted` went
 * dead the moment a toggle was pressed). Outline now wears the Button
 * outline material at rest, so there is nothing left for `glass` to fight. */
import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { Toggle } from "../../src/solid/toggle.js";

afterEach(cleanup);

function toggleEl(container: HTMLElement) {
	const el = container.querySelector<HTMLElement>('[data-slot="toggle"]');
	if (!el) throw new Error("toggle did not render");
	return el;
}

describe("Toggle", () => {
	it("wears the glass material for the outline variant, not border-input chrome", () => {
		const { container } = render(() => <Toggle variant="outline">Search</Toggle>);
		const el = toggleEl(container);
		expect(el.className).toMatch(/(^|\s)glass(\s|$)/);
		expect(el.className).not.toContain("border-input");
		expect(el.className).not.toContain("hover:bg-muted");
	});

	it("still applies the default variant without glass at rest", () => {
		const { container } = render(() => <Toggle>Notify</Toggle>);
		const el = toggleEl(container);
		expect(el.className).not.toMatch(/(^|\s)glass(\s|$)/);
	});
});
