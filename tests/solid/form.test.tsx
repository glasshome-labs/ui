/* Form* is the second name for the field stack: same parts, same order, plus
 * the id and aria wiring the context knows. The wiring is the whole point, so
 * it is asserted on the control element itself, not on a wrapper. */
import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../src/solid/form.js";

afterEach(cleanup);

function renderForm(errors: Record<string, string> = {}) {
	return render(() => (
		<Form errors={errors}>
			<FormField name="email">
				<FormItem>
					<FormLabel>Email</FormLabel>
					<FormControl type="email" placeholder="you@example.com" />
					<FormDescription>We only use it for account recovery.</FormDescription>
					<FormMessage />
				</FormItem>
			</FormField>
		</Form>
	));
}

describe("Form", () => {
	it("renders the field stack, not a second one", () => {
		const { container } = renderForm();
		const field = container.querySelector<HTMLElement>('[data-slot="field"]');
		if (!field) throw new Error("FormItem did not render a Field");
		expect(field.className).toContain("gap-2");
		expect(Array.from(field.children).map((c) => c.getAttribute("data-slot"))).toEqual([
			"field-label",
			"input",
			"field-description",
		]);
	});

	it("puts the id and aria-describedby on the control, not on a wrapper", () => {
		const { container } = renderForm();
		const input = container.querySelector<HTMLInputElement>("input");
		const label = container.querySelector<HTMLLabelElement>('[data-slot="field-label"]');
		const description = container.querySelector<HTMLElement>('[data-slot="field-description"]');
		if (!input || !label || !description) throw new Error("form parts missing");

		expect(input.id).not.toBe("");
		expect(label.getAttribute("for")).toBe(input.id);
		expect(input.getAttribute("aria-describedby")).toBe(description.id);
		expect(container.querySelector('[data-slot="form-control"]')).toBeNull();
	});

	it("adds the message to aria-describedby and marks the control invalid", () => {
		const { container } = renderForm({ email: "Email is required." });
		const input = container.querySelector<HTMLInputElement>("input");
		const message = container.querySelector<HTMLElement>('[data-slot="field-error"]');
		if (!input || !message) throw new Error("form parts missing");

		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(message.id);
		expect(message.textContent).toBe("Email is required.");
		expect(message.getAttribute("role")).toBe("alert");
	});

	it("routes the control through a caller-named component", () => {
		const { container } = render(() => (
			<Form>
				<FormField name="note">
					<FormItem>
						<FormControl as="textarea" rows={3} />
					</FormItem>
				</FormField>
			</Form>
		));
		const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
		expect(textarea?.id).not.toBe("");
		expect(textarea?.getAttribute("rows")).toBe("3");
	});
});
