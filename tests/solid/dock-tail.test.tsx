import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Dock } from "../../src/solid/dock.js";

vi.mock("@iconify-icon/solid", () => ({ Icon: () => null }));

const item = (id: string) => ({ id, icon: <span />, label: id, onClick: () => {} });

describe("Dock tail", () => {
	it("renders the tail after the strip, outside the scrollable bar", () => {
		const { container } = render(() => (
			<Dock items={[item("a"), item("b")]} tail={[item("pencil")]} />
		));
		const bar = container.querySelector('[data-slot="dock-bar"]');
		const tail = container.querySelector('[data-slot="dock-tail"]');
		expect(tail).toBeTruthy();
		expect(bar?.contains(tail)).toBe(false);
		expect(tail?.querySelectorAll('[data-slot="dock-item"]')).toHaveLength(1);
	});

	it("renders no tail and no divider when tail is empty", () => {
		const { container } = render(() => <Dock items={[item("a")]} tail={[]} />);
		expect(container.querySelector('[data-slot="dock-tail"]')).toBeNull();
		expect(container.querySelector('[data-slot="dock-divider"]')).toBeNull();
	});
});
