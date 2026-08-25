/* SchemaForm renderer contract:
 * - controlled form: parent-driven data changes (revert/reset/widget-switch)
 *   reach the visible controls (audit finding #33),
 * - one recursive dispatch: entity/area fields nested in groups render their
 *   real pickers instead of downgrading to text inputs,
 * - unknown formType renders a read-only notice, never a broken control,
 * - formType "list" and "variants" branches per sdk-2.md D.3. */
import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

// The real iconify-icon custom element schedules render timers that can fire
// after this file's happy-dom window is torn down (unhandled "document is not
// defined"); nothing here asserts icon internals.
vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { type EntityDataAdapter, EntityDataContext } from "../../src/solid/entity-data.js";
import { ImageStoreContext } from "../../src/solid/image-store.js";
import { dragTargetIndex } from "../../src/solid/list-reorder.js";
import {
	type ExtendedJSONSchema,
	extractItemDefaults,
	SchemaForm,
	switchVariantValue,
} from "../../src/solid/schema-form.js";

const stubEntityData: EntityDataAdapter = {
	entityIdsByDomain: () => ({ sensor: ["sensor.a"] }),
	useEntities: () => () => [],
	getEntityView: () => undefined,
	useAreas: () => () => [],
};

const powerEntities: ExtendedJSONSchema = {
	default: [],
	domain: "sensor",
	deviceClass: "power",
	title: "Entities",
	type: "array",
	items: { type: "string" },
};

const inputBranch: ExtendedJSONSchema = {
	type: "object",
	properties: {
		label: { title: "Label", type: "string" },
		entities: powerEntities,
		kind: { type: "string", const: "input" },
	},
	required: ["entities", "kind"],
};

const outputBranch: ExtendedJSONSchema = {
	type: "object",
	properties: {
		label: { title: "Label", type: "string" },
		entities: powerEntities,
		remainder: { default: false, title: "Remainder node", type: "boolean" },
		kind: { type: "string", const: "output" },
	},
	required: ["entities", "remainder", "kind"],
};

/** Wire shape of a field.variants item (spec D.2), as field.list serializes it. */
const nodeItemSchema: ExtendedJSONSchema = {
	oneOf: [inputBranch, outputBranch],
	default: { kind: "input", entities: [] },
	formType: "variants",
	discriminator: "kind",
	title: "Type",
	labels: { input: "Input", output: "Output" },
};

const nodesList: ExtendedJSONSchema = {
	minItems: 2,
	maxItems: 3,
	type: "array",
	items: nodeItemSchema,
	default: [],
	formType: "list",
	title: "Flow nodes",
	addLabel: "Add node",
	labelField: "label",
};

const listSchema: ExtendedJSONSchema = {
	type: "object",
	properties: { nodes: nodesList },
};

describe("SchemaForm is controlled", () => {
	it("parent data changes (revert/reset) reach the visible form", () => {
		const [data, setData] = createSignal<Record<string, unknown>>({ name: "Alpha" });
		const { getByLabelText } = render(() => (
			<SchemaForm
				schema={{ type: "object", properties: { name: { type: "string", title: "Name" } } }}
				data={data()}
				onChange={setData}
			/>
		));
		const input = getByLabelText("Name") as HTMLInputElement;
		expect(input.value).toBe("Alpha");
		setData({ name: "Beta" });
		expect(input.value).toBe("Beta");
	});

	it("edits lift through onChange without local state", () => {
		const onChange = vi.fn();
		const { getByLabelText } = render(() => (
			<SchemaForm
				schema={{ type: "object", properties: { name: { type: "string", title: "Name" } } }}
				data={{ name: "Alpha" }}
				onChange={onChange}
			/>
		));
		fireEvent.input(getByLabelText("Name"), { target: { value: "Gamma" } });
		expect(onChange).toHaveBeenCalledWith({ name: "Gamma" });
	});

	it("passes a probe class through to the DOM", () => {
		const { container } = render(() => (
			<SchemaForm
				class="probe"
				schema={{ type: "object", properties: {} }}
				data={{}}
				onChange={() => {}}
			/>
		));
		expect(container.querySelector(".probe")).toBeTruthy();
		expect(container.querySelector('[data-slot="schema-form"]')).toBeTruthy();
	});
});

describe("recursive dispatch", () => {
	it("renders entity pickers inside nested objects instead of text inputs", () => {
		const schema: ExtendedJSONSchema = {
			type: "object",
			properties: {
				group: {
					type: "object",
					title: "Group",
					properties: { entities: powerEntities },
				},
			},
		};
		const { container } = render(() => (
			<EntityDataContext.Provider value={stubEntityData}>
				<SchemaForm schema={schema} data={{}} onChange={() => {}} />
			</EntityDataContext.Provider>
		));
		expect(container.querySelector('input[id="group.entities"]')).toBeNull();
		const combobox = container.querySelector('[role="combobox"]');
		expect(combobox?.textContent).toContain("Select sensor entities");
	});
});

describe("unknown formType fallback", () => {
	it("renders a read-only notice, not a broken control", () => {
		const future: ExtendedJSONSchema = {
			type: "object",
			formType: "hologram",
			title: "Future setting",
		};
		const schema: ExtendedJSONSchema = { type: "object", properties: { future } };
		const { container } = render(() => (
			<SchemaForm schema={schema} data={{}} onChange={() => {}} />
		));
		expect(container.textContent).toContain("This setting needs a newer dashboard");
		expect(container.querySelector('[data-slot="schema-form-unknown"]')).toBeTruthy();
		expect(container.querySelector("input")).toBeNull();
	});
});

describe("formType list", () => {
	const twoNodes = [
		{ kind: "input", label: "Solar", entities: [] },
		{ kind: "output", label: "", entities: [], remainder: false },
	];

	it("captions rows by labelField, then variant label, then Item N", () => {
		const { container } = render(() => (
			<SchemaForm schema={listSchema} data={{ nodes: [...twoNodes, {}] }} onChange={() => {}} />
		));
		const rows = Array.from(container.querySelectorAll('[data-slot="schema-form-list-item"]'));
		expect(rows).toHaveLength(3);
		expect(rows[0]?.textContent).toContain("Solar");
		// Empty labelField value falls back to the variant label from `labels`.
		expect(rows[1]?.textContent).toContain("Output");
		// No labelField value and no kind: positional fallback.
		expect(rows[2]?.textContent).toContain("Item 3");
	});

	it("add appends the item defaults and is disabled at maxItems", () => {
		const onChange = vi.fn();
		const { getByRole, unmount } = render(() => (
			<SchemaForm schema={listSchema} data={{ nodes: twoNodes }} onChange={onChange} />
		));
		const add = getByRole("button", { name: "Add node" }) as HTMLButtonElement;
		expect(add.disabled).toBe(false);
		fireEvent.click(add);
		expect(onChange).toHaveBeenCalledWith({
			nodes: [...twoNodes, { kind: "input", entities: [] }],
		});
		unmount();

		const { getByRole: getByRoleFull } = render(() => (
			<SchemaForm
				schema={listSchema}
				data={{ nodes: [...twoNodes, { kind: "input", entities: [] }] }}
				onChange={onChange}
			/>
		));
		expect((getByRoleFull("button", { name: "Add node" }) as HTMLButtonElement).disabled).toBe(
			true,
		);
	});

	it("remove drops the item but is disabled at minItems", () => {
		const onChange = vi.fn();
		const three = [...twoNodes, { kind: "input", label: "Grid", entities: [] }];
		const { getByRole, unmount } = render(() => (
			<SchemaForm schema={listSchema} data={{ nodes: three }} onChange={onChange} />
		));
		fireEvent.click(getByRole("button", { name: "Remove Solar" }));
		expect(onChange).toHaveBeenCalledWith({ nodes: three.slice(1) });
		unmount();

		const { getByRole: atMin } = render(() => (
			<SchemaForm schema={listSchema} data={{ nodes: twoNodes }} onChange={onChange} />
		));
		expect((atMin("button", { name: "Remove Solar" }) as HTMLButtonElement).disabled).toBe(true);
	});

	it("reorders items from the grip handle via arrow keys", () => {
		const onChange = vi.fn();
		const { getAllByRole } = render(() => (
			<SchemaForm schema={listSchema} data={{ nodes: twoNodes }} onChange={onChange} />
		));
		const handles = getAllByRole("button", { name: /^Reorder / }) as HTMLButtonElement[];
		expect(handles).toHaveLength(2);
		fireEvent.keyDown(handles[0] as HTMLButtonElement, { key: "ArrowDown" });
		expect(onChange).toHaveBeenCalledWith({ nodes: [twoNodes[1], twoNodes[0]] });
		onChange.mockClear();
		fireEvent.keyDown(handles[0] as HTMLButtonElement, { key: "ArrowUp" });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("dragTargetIndex crosses a neighbor at half its height", () => {
		const heights = [40, 40, 120, 40];
		expect(dragTargetIndex(heights, 0, 0)).toBe(0);
		expect(dragTargetIndex(heights, 0, 21)).toBe(1);
		expect(dragTargetIndex(heights, 0, 19)).toBe(0);
		expect(dragTargetIndex(heights, 0, 40 + 61)).toBe(2);
		expect(dragTargetIndex(heights, 3, -(120 / 2 + 1))).toBe(2);
		expect(dragTargetIndex(heights, 1, -21)).toBe(0);
		expect(dragTargetIndex(heights, 0, -50)).toBe(0);
		expect(dragTargetIndex(heights, 3, 999)).toBe(3);
	});

	it("expands a row to the recursive item editor", () => {
		const { container, getByRole } = render(() => (
			<EntityDataContext.Provider value={stubEntityData}>
				<SchemaForm schema={listSchema} data={{ nodes: twoNodes }} onChange={() => {}} />
			</EntityDataContext.Provider>
		));
		expect(container.querySelector('[data-slot="schema-form-variants"]')).toBeNull();
		fireEvent.click(getByRole("button", { name: "Solar", expanded: false }));
		expect(container.querySelector('[data-slot="schema-form-variants"]')).toBeTruthy();
	});
});

describe("formType variants", () => {
	it("renders the discriminator select and the active branch's fields", () => {
		const schema: ExtendedJSONSchema = { type: "object", properties: { node: nodeItemSchema } };
		const { container } = render(() => (
			<EntityDataContext.Provider value={stubEntityData}>
				<SchemaForm
					schema={schema}
					data={{ node: { kind: "output", label: "Main", entities: [], remainder: true } }}
					onChange={() => {}}
				/>
			</EntityDataContext.Provider>
		));
		const variants = container.querySelector('[data-slot="schema-form-variants"]');
		expect(variants).toBeTruthy();
		expect(variants?.textContent).toContain("Output");
		// The output branch's own field renders; the discriminator is not a field row.
		expect(variants?.textContent).toContain("Remainder node");
		const labels = Array.from(variants?.querySelectorAll("label") ?? []).map((l) => l.textContent);
		expect(labels).not.toContain("kind");
	});

	it("switching kind keeps same-named values and drops branch-only ones", () => {
		const current = { kind: "output", label: "Main", entities: ["sensor.a"], remainder: true };
		expect(switchVariantValue(inputBranch, "kind", "input", current)).toEqual({
			kind: "input",
			label: "Main",
			entities: ["sensor.a"],
		});
		// Back the other way: remainder reappears with its branch default.
		expect(
			switchVariantValue(outputBranch, "kind", "output", { kind: "input", entities: ["sensor.a"] }),
		).toEqual({ kind: "output", entities: ["sensor.a"], remainder: false });
	});
});

describe("extractItemDefaults", () => {
	it("prefers the serialized default (field.variants always provides one)", () => {
		expect(extractItemDefaults(nodeItemSchema)).toEqual({ kind: "input", entities: [] });
	});

	it("falls back to the first branch seeded by its discriminator const", () => {
		const { default: _omitted, ...withoutDefault } = nodeItemSchema;
		expect(extractItemDefaults(withoutDefault)).toEqual({ kind: "input", entities: [] });
	});

	it("collects plain-object property defaults", () => {
		expect(
			extractItemDefaults({
				type: "object",
				properties: {
					name: { type: "string" },
					count: { type: "number", default: 3 },
				},
			}),
		).toEqual({ count: 3 });
	});
});

describe("formType image-picker", () => {
	it("renders an ImagePicker for formType image-picker", () => {
		const stubImageStore = {
			index: async () => ({
				images: [],
				usage: { bytes: 0, limitBytes: 1024, files: 0, limitFiles: 10 },
			}),
			upload: async () => ({
				id: "test",
				width: 100,
				height: 100,
				size: 1000,
				usedBy: 0,
			}),
			remove: async () => {},
			url: (id: string) => `/api/images/${id}`,
		};
		const { container } = render(() => (
			<ImageStoreContext.Provider value={stubImageStore}>
				<SchemaForm
					schema={{
						type: "object",
						properties: { art: { type: "string", formType: "image-picker", title: "Art" } },
					}}
					data={{}}
					onChange={() => {}}
				/>
			</ImageStoreContext.Provider>
		));
		expect(container.querySelector('[data-slot="image-picker"]')).toBeTruthy();
		expect(container.querySelector('[data-slot="schema-form-unknown"]')).toBeNull();
	});
});
