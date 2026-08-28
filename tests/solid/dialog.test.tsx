import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal, Show } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogTitle,
} from "../../src/solid/alert-dialog.js";
import { Button } from "../../src/solid/button.js";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../src/solid/dialog.js";
import { Sheet, SheetBody, SheetContent, SheetTitle } from "../../src/solid/sheet.js";

afterEach(cleanup);

const panel = () => {
	const el = document.querySelector<HTMLElement>('[data-slot="dialog-content"]');
	if (!el) throw new Error("no dialog panel rendered");
	return el;
};

const scrollers = (root: HTMLElement) =>
	Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) =>
		el.className.includes("overflow-y-auto"),
	);

const pageLocked = () =>
	document.body.style.overflow === "hidden" || document.body.style.position === "fixed";

describe("Dialog scroll contract", () => {
	it("scrolls in Body only; the panel clips", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
					</DialogHeader>
					<DialogBody>body</DialogBody>
					<DialogFooter>footer</DialogFooter>
				</DialogContent>
			</Dialog>
		));

		const content = panel();
		expect(content.className).toContain("overflow-hidden");
		expect(content.className).not.toContain("overflow-y-auto");
		const found = scrollers(content);
		expect(found).toHaveLength(1);
		expect(found[0]?.getAttribute("data-slot")).toBe("dialog-body");
		expect(found[0]?.className).toContain("overscroll-contain");
		expect(found[0]?.className).toContain("gh-scroll");
	});

	it("pins Header and Footer as siblings of Body, never inside it", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
					</DialogHeader>
					<DialogBody>body</DialogBody>
					<DialogFooter>footer</DialogFooter>
				</DialogContent>
			</Dialog>
		));

		const content = panel();
		const slots = Array.from(content.children)
			.map((el) => el.getAttribute("data-slot"))
			.filter(Boolean);
		expect(slots).toEqual(["dialog-header", "dialog-body", "dialog-footer"]);
		const body = content.querySelector<HTMLElement>('[data-slot="dialog-body"]');
		expect(body?.querySelector('[data-slot="dialog-header"]')).toBeNull();
		expect(body?.querySelector('[data-slot="dialog-footer"]')).toBeNull();
		const header = content.querySelector<HTMLElement>('[data-slot="dialog-header"]');
		expect(header?.className).toContain("shrink-0");
		const footer = content.querySelector<HTMLElement>('[data-slot="dialog-footer"]');
		expect(footer?.className).toContain("shrink-0");
	});

	it("puts the inset padding on the parts, never on the panel", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogBody>body</DialogBody>
				</DialogContent>
			</Dialog>
		));

		const content = panel();
		expect(content.className).not.toMatch(/(^|\s)p-\d/);
		expect(content.querySelector('[data-slot="dialog-body"]')?.className).toContain("px-6");
	});
});

describe("Dialog header action", () => {
	it("renders the action beside the title column", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogHeader action={<Button>Reset</Button>}>
						<DialogTitle>Title</DialogTitle>
						<DialogDescription>Description</DialogDescription>
					</DialogHeader>
					<DialogBody>body</DialogBody>
				</DialogContent>
			</Dialog>
		));

		const header = panel().querySelector<HTMLElement>('[data-slot="dialog-header"]');
		if (!header) throw new Error("no header");
		expect(header.className).toContain("justify-between");
		const parts = Array.from(header.children).map((el) => el.getAttribute("data-slot"));
		expect(parts).toEqual(["dialog-header-text", "dialog-header-action"]);
		expect(header.querySelector('[data-slot="dialog-header-action"]')?.textContent).toBe("Reset");
	});

	it("omits the action node when no action is passed", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		));

		expect(document.querySelector('[data-slot="dialog-header-action"]')).toBeNull();
	});
});

describe("Dialog size", () => {
	it("maps size to a max width and lets a caller class win", () => {
		render(() => (
			<Dialog open>
				<DialogContent size="sm">a</DialogContent>
			</Dialog>
		));
		expect(panel().className).toContain("max-w-sm");
		cleanup();

		render(() => (
			<Dialog open>
				<DialogContent>b</DialogContent>
			</Dialog>
		));
		expect(panel().className).toContain("max-w-lg");
		cleanup();

		render(() => (
			<Dialog open>
				<DialogContent size="lg" class="max-w-2xl">
					c
				</DialogContent>
			</Dialog>
		));
		expect(panel().className).toContain("max-w-2xl");
		expect(panel().className).not.toContain("max-w-lg");
	});
});

describe("Dialog labelling", () => {
	it("points aria-labelledby at the Title and aria-describedby at the Description", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename dashboard</DialogTitle>
						<DialogDescription>Pick a new name.</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		));

		const dialog = panel();
		const labelId = dialog.getAttribute("aria-labelledby");
		const describeId = dialog.getAttribute("aria-describedby");
		expect(labelId).toBeTruthy();
		expect(document.getElementById(String(labelId))?.textContent).toBe("Rename dashboard");
		expect(document.getElementById(String(describeId))?.textContent).toBe("Pick a new name.");
	});

	it("falls back to ariaLabel when there is no Title", () => {
		render(() => (
			<Dialog open>
				<DialogContent ariaLabel="Quick actions">a</DialogContent>
			</Dialog>
		));

		expect(panel().getAttribute("aria-labelledby")).toBeNull();
		expect(panel().getAttribute("aria-label")).toBe("Quick actions");
	});
});

describe("Dialog trigger", () => {
	it("renders one button for Trigger as={Button} and opens on click", () => {
		render(() => (
			<Dialog>
				<DialogTrigger as={Button}>Open</DialogTrigger>
				<DialogContent>
					<DialogTitle>Opened</DialogTitle>
				</DialogContent>
			</Dialog>
		));

		const buttons = document.querySelectorAll("button");
		expect(buttons).toHaveLength(1);
		fireEvent.click(buttons[0] as HTMLButtonElement);
		expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull();
	});
});

describe("one page-scroll lock", () => {
	it("holds the lock until the last nested modal is gone", () => {
		const [inner, setInner] = createSignal(false);

		const { unmount } = render(() => (
			<Dialog open>
				<DialogContent>
					<DialogTitle>Outer</DialogTitle>
					<Show when={inner()}>
						<AlertDialog open>
							<AlertDialogContent>
								<AlertDialogTitle>Inner</AlertDialogTitle>
								<AlertDialogBody>sure?</AlertDialogBody>
							</AlertDialogContent>
						</AlertDialog>
					</Show>
				</DialogContent>
			</Dialog>
		));

		expect(pageLocked()).toBe(true);

		setInner(true);
		expect(document.querySelector('[data-slot="alert-dialog-content"]')).not.toBeNull();
		expect(pageLocked()).toBe(true);

		setInner(false);
		expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeNull();
		expect(pageLocked()).toBe(true);

		unmount();
		expect(pageLocked()).toBe(false);
	});
});

describe("Sheet", () => {
	it("gives the side sheet the same Body scroller", () => {
		render(() => (
			<Sheet open>
				<SheetContent side="right">
					<SheetTitle>Settings</SheetTitle>
					<SheetBody>rows</SheetBody>
				</SheetContent>
			</Sheet>
		));

		const content = document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
		if (!content) throw new Error("no sheet content");
		expect(content.className).toContain("overflow-hidden");
		const found = scrollers(content);
		expect(found).toHaveLength(1);
		expect(found[0]?.getAttribute("data-slot")).toBe("sheet-body");
	});

	it("renders side=bottom as a bottom sheet", () => {
		render(() => (
			<Sheet open>
				<SheetContent side="bottom">
					<SheetTitle>Filters</SheetTitle>
					<SheetBody>rows</SheetBody>
				</SheetContent>
			</Sheet>
		));

		expect(document.querySelector("[data-sheet-content]")).not.toBeNull();
		expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
	});
});
