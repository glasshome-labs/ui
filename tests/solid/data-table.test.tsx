/* data-table.tsx's empty/loading states used to hand-roll their own markup
 * (a second Empty, a third Skeleton family with inline widths); these pin
 * that they now compose the package's own Empty/Skeleton, and that the
 * scroll recipe keeps its default bound (real hub call sites pass it bare,
 * with no height of their own) while gaining the shared scrollbar. */
import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { TABLE_SCROLL_CLASS, TableEmpty, TableSkeleton } from "../../src/solid/data-table.js";

afterEach(cleanup);

describe("TableSkeleton", () => {
	it("composes Skeleton rows with no inline widths", () => {
		const { container } = render(() => <TableSkeleton count={2} />);
		const skeletons = container.querySelectorAll<HTMLElement>('[data-slot="skeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
		for (const el of Array.from(skeletons)) {
			expect(el.getAttribute("style") ?? "").not.toContain("width");
		}
	});
});

describe("TableEmpty", () => {
	it("composes Empty", () => {
		const { container } = render(() => <TableEmpty message="No rows" />);
		expect(container.querySelector('[data-slot="empty"]')).not.toBeNull();
	});

	it("asks for the icon pill through the current prop", () => {
		const { container } = render(() => <TableEmpty icon="lucide:inbox" message="No rows" />);
		const media = container.querySelector<HTMLElement>('[data-slot="empty-media"]');
		expect(media?.dataset.media).toBe("icon");
	});
});

describe("TABLE_SCROLL_CLASS", () => {
	it("carries the shared scrollbar and keeps its default max height", () => {
		expect(TABLE_SCROLL_CLASS).toContain("gh-scroll");
		expect(TABLE_SCROLL_CLASS).toContain("max-h-[600px]");
	});
});
