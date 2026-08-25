import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { ImagePicker } from "../../src/solid/image-picker.jsx";
import {
	type ImageStore,
	ImageStoreContext,
	ImageStoreError,
	type StoredImage,
} from "../../src/solid/image-store.js";

const image = (id: string, usedBy = 0): StoredImage => ({
	id,
	url: `/api/images/${id}`,
	width: 100,
	height: 80,
	size: 1234,
	usedBy,
});

function storeWith(overrides: Partial<ImageStore> = {}): ImageStore {
	return {
		list: async () => [image("a", 2), image("b")],
		usage: async () => ({ bytes: 104_857_600, limitBytes: 524_288_000, files: 3, limitFiles: 50 }),
		upload: async () => image("c"),
		remove: async () => {},
		url: (id) => `/api/images/${id}`,
		...overrides,
	};
}

const withStore = (store: ImageStore, ui: () => unknown) =>
	render(() => (
		<ImageStoreContext.Provider value={store}>{ui() as never}</ImageStoreContext.Provider>
	));

afterEach(cleanup);

describe("ImagePicker", () => {
	it("renders a notice when no store is available", () => {
		render(() => <ImagePicker value="" onChange={() => {}} />);
		expect(screen.getByText(/dashboard cannot store images/i)).toBeTruthy();
	});

	it("lists images once opened, unused first", async () => {
		withStore(storeWith(), () => <ImagePicker value="" onChange={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /choose image/i }));
		await waitFor(() => expect(screen.getAllByRole("img").length).toBeGreaterThan(0));
		const captions = screen.getAllByTestId("image-usage").map((n) => n.textContent);
		expect(captions[0]).toMatch(/not used/i);
		expect(captions[1]).toMatch(/used in 2 widgets/i);
	});

	it("reports the chosen id", async () => {
		const onChange = vi.fn();
		withStore(storeWith(), () => <ImagePicker value="" onChange={onChange} />);
		fireEvent.click(screen.getByRole("button", { name: /choose image/i }));
		await waitFor(() => screen.getAllByTestId("image-tile"));
		fireEvent.click(screen.getAllByTestId("image-tile")[0]);
		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("templates a quota refusal from the error kind, not its message", async () => {
		const store = storeWith({
			upload: async () => {
				throw new ImageStoreError("quota_bytes_exceeded", {
					bytes: 250_000_000,
					limitBytes: 262_144_000,
					files: 12,
					limitFiles: 500,
				});
			},
		});
		withStore(store, () => <ImagePicker value="" onChange={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /choose image/i }));
		await waitFor(() => screen.getByTestId("image-upload-input"));
		const input = screen.getByTestId("image-upload-input") as HTMLInputElement;
		Object.defineProperty(input, "files", {
			value: [new File(["x"], "x.png", { type: "image/png" })],
		});
		fireEvent.change(input);
		await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/238 MB of 250 MB/i));
	});

	it("renders the server-provided quota limits and refetches them after an upload", async () => {
		const usage = vi.fn(async () => ({
			bytes: 104_857_600,
			limitBytes: 524_288_000,
			files: 3,
			limitFiles: 50,
		}));
		const store = storeWith({
			usage,
			upload: async () => {
				usage.mockResolvedValueOnce({
					bytes: 209_715_200,
					limitBytes: 524_288_000,
					files: 4,
					limitFiles: 50,
				});
				return image("c");
			},
		});
		withStore(store, () => <ImagePicker value="" onChange={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /choose image/i }));
		await waitFor(() => expect(screen.getByText(/100 MB of 500 MB/i)).toBeTruthy());
		const input = screen.getByTestId("image-upload-input") as HTMLInputElement;
		Object.defineProperty(input, "files", {
			value: [new File(["x"], "x.png", { type: "image/png" })],
		});
		fireEvent.change(input);
		await waitFor(() => expect(screen.getByText(/200 MB of 500 MB/i)).toBeTruthy());
	});

	it("refetches the gallery after a delete", async () => {
		const list = vi.fn(async () => [image("a")]);
		const store = storeWith({ list, remove: async () => {} });
		withStore(store, () => <ImagePicker value="a" onChange={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /choose image/i }));
		await waitFor(() => screen.getAllByTestId("image-tile"));
		fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
		fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
		await waitFor(() => expect(list.mock.calls.length).toBeGreaterThan(1));
	});
});
