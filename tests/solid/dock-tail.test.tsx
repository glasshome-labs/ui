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

	it("overlays a leaver on the slot its successor takes", () => {
		const [tail, setTail] = createSignal([item("pencil")]);
		const { container } = render(() => <Dock items={[item("a")]} tail={tail()} />);

		setTail([item("add"), item("done")]);

		const slots = container.querySelectorAll('[data-slot="dock-tail-slot"]');
		expect(slots).toHaveLength(2);
		expect(slots[0]?.querySelector('[data-state="enter"] [aria-label="add"]')).toBeTruthy();
		expect(slots[0]?.querySelector('[data-state="leave"]')).toBeNull();
		const leaving = slots[1]?.querySelector('[data-state="leave"]');
		expect(leaving?.querySelector('[data-slot="dock-item"][aria-label="pencil"]')).toBeTruthy();
		expect((leaving as HTMLElement).className).toContain("absolute");
		expect(slots[1]?.querySelector('[data-state="enter"] [aria-label="done"]')).toBeTruthy();
	});

	it("overlays the same way on the way back", () => {
		const [tail, setTail] = createSignal([item("add"), item("done")]);
		const { container } = render(() => <Dock items={[item("a")]} tail={tail()} />);

		setTail([item("pencil")]);

		const slots = container.querySelectorAll('[data-slot="dock-tail-slot"]');
		expect(slots).toHaveLength(2);
		expect(slots[1]?.querySelector('[data-state="enter"] [aria-label="pencil"]')).toBeTruthy();
		expect(slots[1]?.querySelector('[data-state="leave"] [aria-label="done"]')).toBeTruthy();
		// No successor of its own: the extra leaver holds its column in flow.
		expect(slots[0]?.querySelector('[data-state="leave"] [aria-label="add"]')).toBeTruthy();
		expect(
			(slots[0]?.querySelector('[data-state="leave"]') as HTMLElement).className,
		).not.toContain("absolute");
	});

	it("survives the full edit cycle and mounts a fresh node per arriving occupant", () => {
		const [tail, setTail] = createSignal([item("edit")]);
		const { container } = render(() => <Dock items={[item("a")]} tail={tail()} />);

		const nodeFor = (label: string) =>
			container
				.querySelector(
					`[data-slot="dock-tail-slot"] [data-slot="dock-item"][aria-label="${label}"]`,
				)
				?.closest("[data-state]") ?? null;
		const settle = () => {
			for (const leaving of container.querySelectorAll('[data-state="leave"]')) {
				leaving.dispatchEvent(new Event("animationend", { bubbles: true }));
			}
		};

		const firstEdit = nodeFor("edit");
		expect(firstEdit).toBeTruthy();

		expect(() => {
			setTail([item("add"), item("done")]);
			settle();
			setTail([item("edit")]);
			settle();
		}).not.toThrow();

		const secondEdit = nodeFor("edit");
		expect(secondEdit).toBeTruthy();
		// A reused node would carry the leaver's ref and replay no entrance door.
		expect(secondEdit).not.toBe(firstEdit);
		expect(secondEdit?.getAttribute("data-state")).toBe("enter");
		expect(container.querySelectorAll('[data-slot="dock-tail-slot"]')).toHaveLength(1);
		expect(container.querySelector('[data-state="leave"]')).toBeNull();
	});
});
