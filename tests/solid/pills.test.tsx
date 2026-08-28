import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { CHIP, ICON_PILL } from "../../src/lib/pill-classes.js";
import { Badge } from "../../src/solid/badge.js";
import { CopyButton } from "../../src/solid/copy-button.js";
import { CountPill } from "../../src/solid/count-pill.js";
import { Dock } from "../../src/solid/dock.js";
import { ItemMedia } from "../../src/solid/item.js";
import { Kbd } from "../../src/solid/kbd.js";
import { Progress } from "../../src/solid/progress.js";
import { ScopeIndicator } from "../../src/solid/scope-indicator.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../src/solid/tooltip.js";

afterEach(() => {
	cleanup();
	document.body.innerHTML = "";
});

const slot = (root: ParentNode, name: string) => {
	const el = root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
	if (!el) throw new Error(`no [data-slot="${name}"]`);
	return el;
};

describe("one tinted material", () => {
	it("Badge is the CHIP recipe", () => {
		const { container } = render(() => <Badge>Live</Badge>);
		expect(slot(container, "badge").className).toContain(CHIP);
	});

	it("CountPill is a neutral Badge, not a flat foreground fill", () => {
		const { container } = render(() => <CountPill>3</CountPill>);
		const pill = slot(container, "badge");
		expect(pill.className).toContain("glass");
		expect(pill.className).toContain("tabular-nums");
		expect(pill.className).not.toContain("bg-foreground/10");
		expect(pill.getAttribute("style")).toContain("var(--muted-foreground)");
	});

	it("ScopeIndicator is a mono Badge", () => {
		const { container } = render(() => <ScopeIndicator scope="ihsen" type="personal" />);
		const pill = slot(container, "badge");
		expect(pill.className).toContain("font-mono");
		expect(pill.className).not.toContain("bg-muted/50");
		expect(pill.textContent).toContain("@ihsen");
	});

	it("ItemMedia takes the icon well from a media prop and still accepts the old variant", () => {
		const byMedia = render(() => <ItemMedia media="icon" />);
		const media = slot(byMedia.container, "item-media");
		expect(media.className).toContain(ICON_PILL);
		expect(media.className).not.toContain("bg-foreground/10");
		expect(media.getAttribute("data-media")).toBe("icon");

		const byVariant = render(() => <ItemMedia variant="icon" />);
		expect(slot(byVariant.container, "item-media").className).toContain(ICON_PILL);
	});

	it("Progress rides a recessed rail with a tinted glass fill", () => {
		const { container } = render(() => <Progress value={60} tone="var(--success)" />);
		const track = slot(container, "progress");
		expect(track.className).toContain("glass-sink");
		expect(track.className).not.toContain("bg-primary/15");
		expect(track.getAttribute("style") ?? "").not.toContain("box-shadow");

		const fill = slot(container, "progress-indicator");
		expect(fill.className).toContain("glass glass-tint");
		expect(fill.getAttribute("style")).toContain("var(--success)");
	});
});

describe("Tooltip", () => {
	it("wears the floating glass panel, not an opaque primary plate", () => {
		render(() => (
			<Tooltip open>
				<TooltipTrigger>trigger</TooltipTrigger>
				<TooltipContent>Turn off lights</TooltipContent>
			</Tooltip>
		));
		const content = slot(document, "tooltip-content");
		expect(content.className).toContain("glass");
		expect(content.className).not.toContain("bg-primary");
		expect(content.className).toContain("px-3 py-1.5");
	});

	it("Kbd no longer re-skins itself inside a tooltip", () => {
		const { container } = render(() => <Kbd>Esc</Kbd>);
		expect(slot(container, "kbd").className).not.toContain("tooltip-content");
	});
});

describe("Dock", () => {
	const items = [
		{ id: "home", icon: <span />, label: "Home", isActive: true },
		{ id: "inbox", icon: <span />, label: "Inbox", badge: 12 },
	];

	it("counts pending work with a Badge", () => {
		const { container } = render(() => <Dock items={items} />);
		const badge = slot(container, "badge");
		expect(badge.textContent).toBe("9+");
		expect(badge.getAttribute("aria-label")).toBe("12 pending");
		expect(badge.className).not.toContain("bg-primary/15");
	});

	it("hands its label to Tooltip instead of an always-mounted span", () => {
		const { container } = render(() => <Dock items={items} />);
		expect(container.textContent).not.toContain("Inbox");
		const button = container.querySelector<HTMLElement>('button[aria-label="Inbox"]');
		expect(button).not.toBeNull();
	});

	it("wears the shared card surface", () => {
		const { container } = render(() => <Dock items={items} />);
		const bar = slot(container, "dock-bar");
		expect(bar.className).toContain("glass");
		expect(bar.className).not.toContain(
			"--glass-base:color-mix(in_srgb,var(--card)_80%,transparent)",
		);
	});
});

describe("CopyButton", () => {
	it("wears the shared icon button and lets the caller place it", () => {
		const { container } = render(() => <CopyButton text="npm run build" />);
		const button = slot(container, "copy-button");
		expect(button.className).toContain("rounded-full");
		expect(button.className).not.toContain("absolute");
		expect(button.className).not.toContain("bg-foreground/10");
	});
});
