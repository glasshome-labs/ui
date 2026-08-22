import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLegend,
	FieldSubGroup,
	FieldTitle,
} from "../../src/solid/field.js";

afterEach(cleanup);

describe("FieldLegend", () => {
	it("reads at the sub-heading rung, not as an eyebrow", () => {
		const { container } = render(() => <FieldLegend>Control</FieldLegend>);
		const legend = container.querySelector<HTMLElement>('[data-slot="field-legend"]');
		expect(legend?.tagName).toBe("LEGEND");
		expect(legend?.className).toContain("data-[variant=legend]:text-base");
		expect(legend?.className).toContain("data-[variant=legend]:font-semibold");
	});

	it("carries no bottom margin, so the FieldSet gap is the only space under it", () => {
		const { container } = render(() => <FieldLegend>Control</FieldLegend>);
		const legend = container.querySelector<HTMLElement>('[data-slot="field-legend"]');
		expect(legend?.className).not.toContain("mb-3");
	});

	it("drops to the label rung on request", () => {
		const { container } = render(() => <FieldLegend variant="label">Rooms</FieldLegend>);
		const legend = container.querySelector<HTMLElement>('[data-slot="field-legend"]');
		expect(legend?.getAttribute("data-variant")).toBe("label");
	});
});

describe("FieldDescription", () => {
	it("dims with its title when the field is disabled", () => {
		const { container } = render(() => (
			<Field orientation="horizontal" data-disabled="true">
				<FieldContent>
					<FieldTitle>Door locks</FieldTitle>
					<FieldDescription>Off until you turn it on.</FieldDescription>
				</FieldContent>
			</Field>
		));

		const title = container.querySelector<HTMLElement>('[data-slot="field-label"]');
		const description = container.querySelector<HTMLElement>('[data-slot="field-description"]');
		expect(title?.className).toContain("group-data-[disabled=true]/field:opacity-50");
		expect(description?.className).toContain("group-data-[disabled=true]/field:opacity-50");
	});
});

describe("FieldSubGroup", () => {
	it("hangs its rows off an indented hairline", () => {
		const { container } = render(() => (
			<FieldSubGroup>
				<span>Door locks</span>
			</FieldSubGroup>
		));

		const group = container.querySelector<HTMLElement>('[data-slot="field-sub-group"]');
		expect(group?.className).toContain("border-l");
		expect(group?.className).toContain("pl-4");
		expect(group?.textContent).toBe("Door locks");
	});

	it("merges a caller class last", () => {
		const { container } = render(() => <FieldSubGroup class="gap-3" />);
		expect(
			container.querySelector<HTMLElement>('[data-slot="field-sub-group"]')?.className,
		).toContain("gap-3");
	});
});
