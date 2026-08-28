/* toggle-group.tsx:89 used `!important` to beat toggleVariants' own
 * `hover:bg-muted`; both classes go through the same cn()/tailwind-merge
 * call, so the later class already wins without the escape hatch. */
import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "../../src/solid/toggle-group.js";

afterEach(cleanup);

type Rect = { left: number; top: number; width: number; height: number };

function stubRect(el: HTMLElement, rect: Rect) {
	el.getBoundingClientRect = () =>
		({
			...rect,
			right: rect.left + rect.width,
			bottom: rect.top + rect.height,
			x: rect.left,
			y: rect.top,
			toJSON: () => rect,
		}) as DOMRect;
}

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("ToggleGroup", () => {
	it("carries no !important escape hatch on its items", () => {
		const { container } = render(() => (
			<ToggleGroup value="left">
				<ToggleGroupItem value="left">Left</ToggleGroupItem>
				<ToggleGroupItem value="right">Right</ToggleGroupItem>
			</ToggleGroup>
		));
		for (const item of container.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]')) {
			expect(item.className).not.toContain("!");
		}
	});

	it("matches the item radius on the sliding indicator", async () => {
		const { container } = render(() => (
			<ToggleGroup value="left">
				<ToggleGroupItem value="left">Left</ToggleGroupItem>
				<ToggleGroupItem value="right">Right</ToggleGroupItem>
			</ToggleGroup>
		));
		const items = container.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
		// The sliding indicator measures against its OWN wrapper div, one level
		// inside the ToggleGroupPrimitive root, not the root itself.
		const root = items[0]?.parentElement;
		if (!root) throw new Error("no root");
		stubRect(root, { left: 0, top: 0, width: 160, height: 32 });
		stubRect(items[0] as HTMLElement, { left: 0, top: 0, width: 80, height: 32 });
		stubRect(items[1] as HTMLElement, { left: 80, top: 0, width: 80, height: 32 });
		Object.defineProperty(root, "clientWidth", { value: 160, configurable: true });
		Object.defineProperty(root, "clientHeight", { value: 32, configurable: true });
		await flush();

		const indicator = container.querySelector<HTMLElement>("[data-sliding-indicator]");
		expect(indicator?.className).toContain("rounded-md");
	});
});
