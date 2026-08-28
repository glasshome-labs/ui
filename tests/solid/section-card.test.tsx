import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../../src/solid/empty.js";
import { HeroAction } from "../../src/solid/hero-action.js";
import { PageHeader } from "../../src/solid/page-header.js";
import {
	SectionCard,
	SectionIcon,
	SectionLabel,
	SectionRow,
	SectionRowSkeletons,
	SectionTitle,
} from "../../src/solid/section-card.js";

afterEach(cleanup);

const full = () =>
	render(() => (
		<SectionCard
			icon="lucide:layout-grid"
			title="Section title"
			subtitle="Muted meta line"
			count={3}
			action={<span data-testid="action-child">act</span>}
			toolbar={<span data-testid="toolbar-child">bar</span>}
		>
			<span data-testid="body-child">rows</span>
		</SectionCard>
	));

const slot = (root: HTMLElement, name: string) => {
	const el = root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
	if (!el) throw new Error(`no [data-slot="${name}"]`);
	return el;
};

describe("SectionCard spacing owner", () => {
	it("stacks its parts with a gap on the section itself", () => {
		const { container } = full();
		const section = slot(container, "section-card");
		expect(section.className).toContain("flex-col");
		expect(section.className).toMatch(/\bgap-3\b/);
		expect(section.className).toMatch(/\bp-3\b/);
	});

	it("gives no part a margin or a padding aimed at its sibling", () => {
		const { container } = full();
		for (const name of ["section-card-header", "section-card-toolbar", "section-card-body"]) {
			const cls = slot(container, name).className;
			expect(cls, name).not.toMatch(/(^|\s)-?m[trblxy]?-/);
			expect(cls, name).not.toMatch(/(^|\s)pb-/);
			expect(cls, name).not.toContain("pt-0");
			expect(cls, name).not.toMatch(/(^|\s)space-y-/);
		}
	});

	it("keeps the toolbar rule only when a header sits above it", () => {
		const withHeader = render(() => (
			<SectionCard title="t" toolbar={<span>bar</span>}>
				body
			</SectionCard>
		));
		expect(slot(withHeader.container, "section-card-toolbar").className).toContain("border-t");

		const bare = render(() => <SectionCard toolbar={<span>bar</span>}>body</SectionCard>);
		expect(slot(bare.container, "section-card-toolbar").className).not.toContain("border-t");
	});

	it("names every part it renders with a data-slot", () => {
		const { container } = full();
		const section = slot(container, "section-card");
		const caller = Array.from(section.querySelectorAll("[data-testid], [data-icon-stub]"));
		const own = Array.from(section.querySelectorAll<HTMLElement>("*")).filter(
			(el) => !caller.some((c) => c === el || c.contains(el)),
		);
		expect(own.length).toBeGreaterThan(5);
		for (const el of own) {
			expect(el.getAttribute("data-slot"), el.outerHTML.slice(0, 80)).toBeTruthy();
		}
	});

	it("steps the title at one breakpoint", () => {
		const { container } = render(() => <SectionTitle>t</SectionTitle>);
		const title = slot(container, "section-title");
		expect(title.className).toContain("sm:text-xl");
		expect(title.className).not.toContain("md:text-2xl");
	});
});

describe("section kit material", () => {
	it("SectionRow is glass, not a flat card fill", () => {
		const { container } = render(() => <SectionRow>row</SectionRow>);
		const row = slot(container, "section-row");
		expect(row.className).toContain("glass");
		expect(row.className).not.toMatch(/(^|\s)bg-/);
		expect(row.className).not.toMatch(/(^|\s)border(\s|$)/);
	});

	it("skeleton rows compose the row surface and stack with a gap", () => {
		const { container } = render(() => <SectionRowSkeletons count={2} />);
		const list = slot(container, "section-row-skeletons");
		expect(list.className).not.toMatch(/(^|\s)space-y-/);
		expect(list.className).toMatch(/\bgap-2\b/);
		const rows = container.querySelectorAll('[data-slot="section-row-skeleton"]');
		expect(rows.length).toBe(2);
		expect(rows[0]?.className).toContain("glass");
	});

	it("SectionIcon defaults to the neutral glass well", () => {
		const { container } = render(() => <SectionIcon icon="lucide:cloud" />);
		const icon = slot(container, "section-icon");
		expect(icon.className).toContain("glass");
		expect(icon.className).not.toMatch(/(^|\s)bg-/);
		expect(icon.getAttribute("style") ?? "").not.toContain("--glass-tone");
	});

	it("SectionIcon takes a CSS color tone and still maps the old enum", () => {
		const css = render(() => <SectionIcon icon="a" tone="var(--warning)" />);
		expect(slot(css.container, "section-icon").getAttribute("style")).toContain("var(--warning)");

		const legacy = render(() => <SectionIcon icon="a" tone="primary" />);
		const el = slot(legacy.container, "section-icon");
		expect(el.getAttribute("style")).toContain("var(--primary)");
		expect(el.className).toContain("glass-tint");
	});

	it("SectionLabel is a meta line, not a tracked caps eyebrow", () => {
		const { container } = render(() => <SectionLabel>Devices</SectionLabel>);
		const label = slot(container, "section-meta");
		expect(label.className).not.toContain("uppercase");
		expect(label.className).not.toContain("tracking-wider");
		expect(label.className).toContain("font-medium");
	});
});

describe("Empty", () => {
	it("draws the dashed frame itself", () => {
		const { container } = render(() => (
			<Empty>
				<EmptyHeader>
					<EmptyMedia media="icon">
						<span />
					</EmptyMedia>
					<EmptyTitle>No devices yet</EmptyTitle>
				</EmptyHeader>
			</Empty>
		));
		const root = slot(container, "empty");
		expect(root.className).toMatch(/(^|\s)border(\s|$)/);
		expect(root.className).toContain("border-dashed");
	});

	it("lets the header own the gap under the media pill", () => {
		const { container } = render(() => (
			<EmptyMedia media="icon">
				<span />
			</EmptyMedia>
		));
		const media = slot(container, "empty-media");
		expect(media.className).not.toMatch(/(^|\s)mb-/);
		expect(media.className).toContain("glass");
	});
});

describe("HeroAction and PageHeader stop carrying app chrome", () => {
	it("HeroAction wears no app class", () => {
		const { container } = render(() => (
			<HeroAction
				icon="lucide:home"
				title="Home Assistant"
				description="Connect the hub"
				accentVar="var(--primary)"
				onClick={() => {}}
			/>
		));
		const root = slot(container, "hero-action");
		expect(root.className).not.toContain("onboard-card");
		expect(root.className).toMatch(/\bp-4\b/);
	});

	it("PageHeader wears the card surface and leaves its outer spacing to the caller", () => {
		const { container } = render(() => <PageHeader title="Widgets" count={12} />);
		const root = slot(container, "page-header");
		expect(root.className).toContain("glass");
		expect(root.className).not.toContain("glass-banner");
		expect(root.className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
		expect(root.className).not.toContain("white");
	});
});
