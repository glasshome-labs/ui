import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal, Show } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogTitle,
} from "../../src/solid/alert-dialog.js";
import { BottomSheet, BottomSheetContent } from "../../src/solid/bottom-sheet/index.js";
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

/* happy-dom runs no animations, so kobalte's exit presence never resolves on its
 * own; the browser's animationend is supplied by hand. Both the panel and the
 * scrim have to finish, because kobalte keeps the portal (and everything in it)
 * mounted until the last of the two is gone. */
function endExitAnimations() {
	const nodes = Array.from(
		document.querySelectorAll('[data-slot$="-content"], [data-slot$="-overlay"]'),
	);
	for (const el of nodes) {
		const event = new Event("animationend");
		Object.defineProperty(event, "animationName", { value: "" });
		el.dispatchEvent(event);
	}
}

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

	it("keeps two-finger zoom over the scrolling region", () => {
		render(() => (
			<Dialog open>
				<DialogContent>
					<DialogBody>body</DialogBody>
				</DialogContent>
			</Dialog>
		));

		const body = panel().querySelector<HTMLElement>('[data-slot="dialog-body"]');
		expect(body?.className).toContain("pinch-zoom");
		expect(body?.className).not.toContain("touch-pan-y");
	});

	it("shortens the Body inset from its Header and Footer siblings, not from its position", () => {
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

		const body = panel().querySelector<HTMLElement>('[data-slot="dialog-body"]');
		expect(body?.className).toContain("[[data-slot$='-header']~&]:pt-3");
		expect(body?.className).toContain("[&:has(~[data-slot$='-footer'])]:pb-3");
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
		expect(content.querySelector('[data-slot="dialog-body"]')?.className).toContain("pl-6");
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
		expect(
			panel()
				.className.split(/\s+/)
				.filter((t) => t.startsWith("max-w-")),
		).toEqual(["max-w-2xl"]);
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

describe("modal role", () => {
	it("states the role per family, never inheriting the primitive's default", () => {
		render(() => (
			<Dialog open>
				<DialogContent ariaLabel="a">a</DialogContent>
			</Dialog>
		));
		expect(panel().getAttribute("role")).toBe("dialog");
		cleanup();

		render(() => (
			<Sheet open>
				<SheetContent ariaLabel="b">b</SheetContent>
			</Sheet>
		));
		expect(document.querySelector('[data-slot="sheet-content"]')?.getAttribute("role")).toBe(
			"dialog",
		);
		cleanup();

		render(() => (
			<AlertDialog open>
				<AlertDialogContent ariaLabel="c">c</AlertDialogContent>
			</AlertDialog>
		));
		expect(document.querySelector('[data-slot="alert-dialog-content"]')?.getAttribute("role")).toBe(
			"alertdialog",
		);
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

	it("does not lock the page for a closed kobalte-family modal", () => {
		const { unmount } = render(() => (
			<>
				<Dialog>
					<DialogContent ariaLabel="d">d</DialogContent>
				</Dialog>
				<AlertDialog>
					<AlertDialogContent ariaLabel="a">a</AlertDialogContent>
				</AlertDialog>
				<Sheet>
					<SheetContent ariaLabel="s">s</SheetContent>
				</Sheet>
			</>
		));

		expect(pageLocked()).toBe(false);
		unmount();
		expect(pageLocked()).toBe(false);
	});

	it("releases the lock when a Dialog closes", () => {
		const [open, setOpen] = createSignal(true);
		render(() => (
			<Dialog open={open()} onOpenChange={setOpen}>
				<DialogContent ariaLabel="d">d</DialogContent>
			</Dialog>
		));

		expect(pageLocked()).toBe(true);
		setOpen(false);
		endExitAnimations();
		expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
		expect(pageLocked()).toBe(false);
	});

	it("releases the lock when an AlertDialog closes", () => {
		const [open, setOpen] = createSignal(true);
		render(() => (
			<AlertDialog open={open()} onOpenChange={setOpen}>
				<AlertDialogContent ariaLabel="a">a</AlertDialogContent>
			</AlertDialog>
		));

		expect(pageLocked()).toBe(true);
		setOpen(false);
		endExitAnimations();
		expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeNull();
		expect(pageLocked()).toBe(false);
	});

	it("releases the lock when a Sheet closes", () => {
		const [open, setOpen] = createSignal(true);
		render(() => (
			<Sheet open={open()} onOpenChange={setOpen}>
				<SheetContent ariaLabel="s">s</SheetContent>
			</Sheet>
		));

		expect(pageLocked()).toBe(true);
		setOpen(false);
		endExitAnimations();
		expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
		expect(pageLocked()).toBe(false);
	});

	it("does not lock the page for a bottom sheet that is mounted but closed", () => {
		const { unmount } = render(() => (
			<BottomSheet>
				<BottomSheetContent ariaLabel="Filters">rows</BottomSheetContent>
			</BottomSheet>
		));

		expect(pageLocked()).toBe(false);
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

	it("keeps the Body's own inset when an `above` node precedes it", () => {
		render(() => (
			<Sheet open>
				<SheetContent side="right" above={<span>toolbar</span>}>
					<SheetBody>rows</SheetBody>
				</SheetContent>
			</Sheet>
		));

		const content = document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
		const slots = Array.from(content?.children ?? [])
			.map((el) => el.getAttribute("data-slot"))
			.filter(Boolean);
		expect(slots).toEqual(["sheet-content-above", "sheet-body"]);
		const body = content?.querySelector<HTMLElement>('[data-slot="sheet-body"]');
		expect(body?.className).toContain("pt-6");
		expect(body?.className).toContain("pb-6");
		expect(body?.className).not.toContain("first-of-type");
	});

	it("carries `above` and the rest of the props into the deprecated bottom variant", () => {
		render(() => (
			<Sheet open>
				<SheetContent side="bottom" above={<span>toolbar</span>} id="filters">
					<SheetBody>rows</SheetBody>
				</SheetContent>
			</Sheet>
		));

		const sheet = document.querySelector<HTMLElement>("[data-sheet-content]");
		expect(sheet?.getAttribute("id")).toBe("filters");
		expect(sheet?.querySelector('[data-slot="sheet-content-above"]')?.textContent).toBe("toolbar");
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
