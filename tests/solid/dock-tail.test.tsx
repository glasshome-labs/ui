import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
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

	it("keeps a leaving tail item mounted through its door, then drops it on animationend", () => {
		const [tail, setTail] = createSignal([item("pencil")]);
		const { container } = render(() => <Dock items={[item("a")]} tail={tail()} />);

		setTail([]);

		const leaving = container.querySelector('[data-slot="dock-tail"] [data-state="leave"]');
		expect(leaving).toBeTruthy();
		expect(leaving?.querySelector('[data-slot="dock-item"]')).toBeTruthy();

		leaving?.dispatchEvent(new Event("animationend", { bubbles: true }));

		expect(container.querySelector('[data-slot="dock-tail"] [data-state="leave"]')).toBeNull();
		expect(container.querySelector('[data-slot="dock-item"][aria-label="pencil"]')).toBeNull();
	});

	it("does not throw computing overflow once the tail sits inside the surface", async () => {
		const items = Array.from({ length: 8 }, (_, i) => item(`item-${i}`));
		const { container } = render(() => <Dock items={items} tail={[item("pencil")]} />);

		// checkOverflow runs on a mount timeout; happy-dom reports zero for all
		// layout metrics, so this only proves the padding/sibling math never throws.
		await new Promise((resolve) => setTimeout(resolve, 160));

		expect(container.querySelector('[data-slot="dock-bar"]')).toBeTruthy();
	});

	it("makes a leaving tail row inert: no click, aria-hidden", () => {
		const onClick = vi.fn();
		const [tail, setTail] = createSignal([
			{ id: "pencil", icon: <span />, label: "pencil", onClick },
		]);
		const { container } = render(() => <Dock items={[item("a")]} tail={tail()} />);

		setTail([]);

		const leaving = container.querySelector('[data-slot="dock-tail"] [data-state="leave"]');
		expect(leaving).toBeTruthy();
		expect(leaving?.getAttribute("aria-hidden")).toBe("true");

		const button = leaving?.querySelector('[data-slot="dock-item"]');
		expect(button).toBeTruthy();
		button?.dispatchEvent(new Event("pointerup", { bubbles: true }));
		button?.dispatchEvent(new Event("click", { bubbles: true }));

		expect(onClick).not.toHaveBeenCalled();
	});
});
