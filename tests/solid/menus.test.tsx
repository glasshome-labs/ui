/* DropdownMenu and ContextMenu share one Kobalte engine, so their Content,
 * Item, Sub* and Checkbox/Radio parts are built once in menu-parts.tsx.
 * These tests pin the shared surface (FLOATING_PANEL classes, one
 * SlidingIndicator per content) and the destructive tone fix (no `!`, tone
 * flows through --glass-tone instead of a variant color axis). */
import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

// The real iconify-icon custom element schedules render timers that fire
// after this file's happy-dom window is torn down; nothing here asserts icons.
vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { FLOATING_PANEL } from "../../src/lib/overlay-classes.js";
import { Button } from "../../src/solid/button.js";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../../src/solid/context-menu.js";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../../src/solid/dropdown-menu.js";

afterEach(() => {
	cleanup();
	document.body.innerHTML = "";
});

const FLOATING_PANEL_TOKENS = FLOATING_PANEL.split(" ").filter(Boolean);

function expectFloatingPanel(el: Element | null) {
	if (!el) throw new Error("element not found");
	for (const token of FLOATING_PANEL_TOKENS) {
		expect(el.className).toContain(token);
	}
}

function slidingIndicatorOf(el: Element | null) {
	return el?.querySelector(".relative.isolate") ?? null;
}

describe("DropdownMenuContent", () => {
	it("wears FLOATING_PANEL and wraps its items in one SlidingIndicator", () => {
		const { container } = render(() => (
			<DropdownMenu>
				<DropdownMenuTrigger as={Button}>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>One</DropdownMenuItem>
					<DropdownMenuItem>Two</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		));

		fireEvent.pointerDown(container.querySelector("button") as HTMLElement, {
			pointerType: "mouse",
			button: 0,
		});

		const content = document.querySelector('[data-slot="dropdown-menu-content"]');
		expectFloatingPanel(content);
		const indicator = slidingIndicatorOf(content);
		expect(indicator).not.toBeNull();
		expect(indicator?.querySelectorAll('[data-slot="dropdown-menu-item"]')).toHaveLength(2);
	});

	it("gives DropdownMenuSub a SubContent that wraps its items in an indicator", () => {
		const { container } = render(() => (
			<DropdownMenu>
				<DropdownMenuTrigger as={Button}>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Nested</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</DropdownMenu>
		));

		fireEvent.pointerDown(container.querySelector("button") as HTMLElement, {
			pointerType: "mouse",
			button: 0,
		});
		const subTrigger = document.querySelector<HTMLElement>(
			'[data-slot="dropdown-menu-sub-trigger"]',
		);
		if (!subTrigger) throw new Error("no sub trigger rendered");
		fireEvent.click(subTrigger);

		const subContent = document.querySelector('[data-slot="dropdown-menu-sub-content"]');
		expectFloatingPanel(subContent);
		const indicator = slidingIndicatorOf(subContent);
		expect(indicator).not.toBeNull();
		expect(indicator?.querySelector('[data-slot="dropdown-menu-item"]')?.textContent).toBe(
			"Nested",
		);
	});

	it("renders a checkbox item with a data-slot and a toggleable indicator", () => {
		const [checked, setChecked] = createSignal(false);
		const { container } = render(() => (
			<DropdownMenu>
				<DropdownMenuTrigger as={Button}>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuCheckboxItem checked={checked()} onChange={setChecked}>
						Show archived
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		));

		fireEvent.pointerDown(container.querySelector("button") as HTMLElement, {
			pointerType: "mouse",
			button: 0,
		});
		const item = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-checkbox-item"]');
		if (!item) throw new Error("no checkbox item rendered");
		fireEvent.pointerDown(item, { pointerType: "mouse", button: 0 });
		fireEvent.pointerUp(item, { pointerType: "mouse", button: 0 });
		expect(checked()).toBe(true);
	});
});

describe("ContextMenuContent", () => {
	it("wears FLOATING_PANEL and wraps its items in one SlidingIndicator", () => {
		const { container } = render(() => (
			<ContextMenu>
				<ContextMenuTrigger class="block h-8 w-8">Right-click</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem>One</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		));

		fireEvent.contextMenu(container.querySelector('[data-slot="context-menu-trigger"]') as Element);

		const content = document.querySelector('[data-slot="context-menu-content"]');
		expectFloatingPanel(content);
		expect(slidingIndicatorOf(content)).not.toBeNull();
	});

	it("gives a destructive item a tone through --glass-tone, with no `!` in its class", () => {
		const { container } = render(() => (
			<ContextMenu>
				<ContextMenuTrigger class="block h-8 w-8">Right-click</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem tone="var(--destructive)">Delete</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		));

		fireEvent.contextMenu(container.querySelector('[data-slot="context-menu-trigger"]') as Element);

		const item = document.querySelector<HTMLElement>('[data-slot="context-menu-item"]');
		if (!item) throw new Error("no item rendered");
		expect(item.style.getPropertyValue("--glass-tone")).toBe("var(--destructive)");
		expect(item.className).not.toContain("!");
	});
});
