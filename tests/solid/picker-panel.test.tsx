/* One picker panel: every field-shaped picker opens the same way, an opaque
 * panel anchored over the trigger, one trigger recipe, one search row, and the
 * package's own controls inside the rows. */
import { cleanup, fireEvent, render, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { AreaPicker } from "../../src/solid/area-picker.js";
import {
	type AreaViewLike,
	type EntityDataAdapter,
	EntityDataContext,
	type EntityViewLike,
} from "../../src/solid/entity-data.js";
import { EntitySelector } from "../../src/solid/entity-selector.js";
import { IconPicker } from "../../src/solid/icon-picker.js";
import { ImagePicker } from "../../src/solid/image-picker.js";
import { type MediaStore, MediaStoreContext } from "../../src/solid/media-store.js";
import { PickerSearch } from "../../src/solid/picker-search.js";
import { Popover, PopoverAnchor, PopoverContent } from "../../src/solid/popover.js";

const AREAS: AreaViewLike[] = [
	{ id: "kitchen", name: "Kitchen", icon: "mdi:silverware", entityIds: ["light.counter"] },
	{ id: "bedroom", name: "Bedroom", icon: "mdi:bed", entityIds: ["light.nightstand"] },
];

const LIGHTS: EntityViewLike[] = [
	{
		id: "light.counter",
		state: "on",
		name: "Counter",
		friendlyName: "Counter Light",
		aliases: [],
		areaId: "kitchen",
		icon: "mdi:lightbulb",
		entityCategory: null,
		isHidden: false,
		isDisabled: false,
	},
];

const adapter: EntityDataAdapter = {
	entityIdsByDomain: () => ({ light: LIGHTS.map((l) => l.id) }),
	useEntities: () => () => LIGHTS,
	getEntityView: (id) => LIGHTS.find((l) => l.id === id),
	useAreas: () => () => AREAS,
};

const mediaStore: MediaStore = {
	index: async () => ({ media: [], usage: { bytes: 0, limitBytes: 1, files: 0, limitFiles: 1 } }),
	upload: async () => {
		throw new Error("unused");
	},
	remove: async () => {},
	url: (id) => `/api/images/${id}`,
};

const withData = (ui: () => never) =>
	render(() => <EntityDataContext.Provider value={adapter}>{ui()}</EntityDataContext.Provider>);

const panel = () => document.querySelector<HTMLElement>('[data-slot="popover-content"]');

const firstButton = (container: HTMLElement) => {
	const button = container.querySelector("button");
	if (!button) throw new Error("no trigger");
	return button;
};

// A picker's own padding lives on a part inside the panel, never on the panel,
// so the panel edge and the trigger edge stay the same rectangle.
const PADDING = /(^|\s)-?p[xytrbl]?-\S/;

afterEach(() => {
	cleanup();
	document.body.innerHTML = "";
});

describe("PopoverContent surface", () => {
	it('wears the opaque field surface and no padding when surface="field"', () => {
		render(() => (
			<Popover surface="field" defaultOpen>
				<PopoverAnchor as="div">anchor</PopoverAnchor>
				<PopoverContent>body</PopoverContent>
			</Popover>
		));
		const content = panel();
		expect(content).not.toBeNull();
		expect(content?.dataset.surface).toBe("field");
		expect(content?.className).toContain("glass-sink");
		expect(content?.className).toContain("w-[var(--kb-popper-anchor-width)]");
		expect(content?.className).not.toContain("backdrop-blur");
		expect(PADDING.test(content?.className ?? "")).toBe(false);
	});

	it("keeps the floating overlay panel and its padding by default", () => {
		render(() => (
			<Popover defaultOpen>
				<PopoverAnchor as="div">anchor</PopoverAnchor>
				<PopoverContent>body</PopoverContent>
			</Popover>
		));
		const content = panel();
		expect(content?.dataset.surface).toBe("overlay");
		expect(content?.className).toContain("backdrop-blur");
		expect(content?.className).toContain("p-4");
	});
});

describe("PickerSearch", () => {
	it("is one bare input with no glass ancestor inside the panel", () => {
		render(() => (
			<Popover surface="field" defaultOpen>
				<PopoverAnchor as="div">anchor</PopoverAnchor>
				<PopoverContent>
					<PickerSearch value="" onValueChange={() => {}} aria-label="Search areas" />
				</PopoverContent>
			</Popover>
		));
		const content = panel();
		if (!content) throw new Error("no panel");
		const inputs = content.querySelectorAll("input");
		expect(inputs.length).toBe(1);

		const row = content.querySelector<HTMLElement>('[data-slot="picker-search"]');
		expect(row?.className).toContain("border-b");
		expect(row?.className).toContain("h-9");

		for (let el = inputs[0]?.parentElement; el && el !== content; el = el.parentElement) {
			expect(el.className).not.toMatch(/(^|\s)glass(\s|$)/);
		}
	});
});

describe("picker triggers", () => {
	const cases: Array<[string, () => never]> = [
		["AreaPicker", () => (<AreaPicker value="" onChange={() => {}} />) as never],
		["IconPicker", () => (<IconPicker value="" onChange={() => {}} />) as never],
		[
			"EntitySelector",
			() =>
				(<EntitySelector domain="light" entityIds={[]} onEntityIdsChange={() => {}} />) as never,
		],
		[
			"ImagePicker",
			() =>
				(
					<MediaStoreContext.Provider value={mediaStore}>
						<ImagePicker value="" onChange={() => {}} />
					</MediaStoreContext.Provider>
				) as never,
		],
	];

	for (const [name, ui] of cases) {
		it(`${name} wears the one field-trigger recipe`, () => {
			const { container } = withData(ui);
			const trigger = firstButton(container);
			expect(trigger.className).toContain("glass-sink");
			expect(trigger.className).toContain("h-9");
			expect(trigger.className).toContain("md:text-sm");
			expect(trigger.className).toContain("data-[expanded]:ring-0");
			// The retyped focus/invalid tail: the lib recipe moves the edge through
			// the glass knob, so a border utility here means a copy came back.
			expect(trigger.className).not.toContain("focus-visible:border-ring");
		});

		it(`${name} marks the trigger expanded while the panel covers it`, async () => {
			const { container } = withData(ui);
			const trigger = firstButton(container);
			expect(trigger.hasAttribute("data-expanded")).toBe(false);
			fireEvent.click(trigger);
			await waitFor(() => expect(trigger.hasAttribute("data-expanded")).toBe(true));
		});
	}
});

describe("EntitySelector rows", () => {
	it("uses the package Checkbox in multiple mode", async () => {
		const { container } = withData(
			() =>
				(<EntitySelector domain="light" entityIds={[]} onEntityIdsChange={() => {}} />) as never,
		);
		fireEvent.click(firstButton(container));
		await waitFor(() => expect(document.querySelector('[data-slot="checkbox"]')).not.toBeNull());
	});

	it("shows no checkbox in single mode", async () => {
		const { container } = withData(
			() =>
				(
					<EntitySelector
						domain="light"
						entityIds={[]}
						onEntityIdsChange={() => {}}
						multiple={false}
					/>
				) as never,
		);
		fireEvent.click(firstButton(container));
		await waitFor(() => expect(document.querySelector('[role="option"]')).not.toBeNull());
		expect(document.querySelector('[data-slot="checkbox"]')).toBeNull();
	});
});

describe("AreaPicker indicator", () => {
	it("rests on a selected row in multi mode", () => {
		const [values, setValues] = createSignal<string[]>(["bedroom"]);
		const { container } = render(() => (
			<EntityDataContext.Provider value={adapter}>
				<AreaPicker values={values()} onValuesChange={setValues} />
			</EntityDataContext.Provider>
		));
		fireEvent.click(firstButton(container));
		const highlighted = document.querySelector<HTMLElement>(
			'[data-slot="area-picker-row"][data-highlighted]',
		);
		expect(highlighted?.textContent).toContain("Bedroom");
	});

	it("rests on the selected row in single mode", () => {
		const [value, setValue] = createSignal("kitchen");
		const { container } = render(() => (
			<EntityDataContext.Provider value={adapter}>
				<AreaPicker value={value()} onChange={setValue} />
			</EntityDataContext.Provider>
		));
		fireEvent.click(firstButton(container));
		const highlighted = document.querySelector<HTMLElement>(
			'[data-slot="area-picker-row"][data-highlighted]',
		);
		expect(highlighted?.textContent).toContain("Kitchen");
	});
});
