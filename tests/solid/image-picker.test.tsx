import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/solid", () => ({
	Icon: (props: { class?: string }) => <span class={props.class} data-icon-stub="" />,
}));

import { ImagePicker } from "../../src/solid/image-picker.jsx";
import {
	type ImageIndex,
	type ImageStore,
	ImageStoreContext,
	ImageStoreError,
	type StoredImage,
} from "../../src/solid/image-store.js";

const image = (id: string, usedBy = 0): StoredImage => ({
	id,
	width: 100,
	height: 80,
	size: 1234,
	usedBy,
});

const indexOf = (images: StoredImage[]): ImageIndex => ({
	images,
	usage: { bytes: 104_857_600, limitBytes: 524_288_000, files: 3, limitFiles: 50 },
});

function storeWith(overrides: Partial<ImageStore> = {}): ImageStore {
	return {
		index: async () => indexOf([image("a", 2), image("b")]),
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

const openGallery = () => fireEvent.click(screen.getByRole("button", { name: /choose image/i }));

const uploadFile = () => {
	const input = screen.getByTestId("image-upload-input") as HTMLInputElement;
	Object.defineProperty(input, "files", {
		value: [new File(["x"], "x.png", { type: "image/png" })],
	});
	fireEvent.change(input);
};

afterEach(cleanup);

describe("ImagePicker", () => {
	it("renders a notice when no store is available", () => {
		render(() => <ImagePicker value="" onChange={() => {}} />);
		expect(screen.getByText(/dashboard cannot store images/i)).toBeTruthy();
	});

	it("queries the index once, and only after the gallery is opened", async () => {
		const index = vi.fn(async () => indexOf([image("a", 2), image("b")]));
		withStore(storeWith({ index }), () => <ImagePicker value="" onChange={() => {}} />);
		expect(index).not.toHaveBeenCalled();

		openGallery();
		await waitFor(() => expect(screen.getAllByTestId("image-tile").length).toBe(2));
		expect(index).toHaveBeenCalledTimes(1);
	});

	it("lists images once opened, unused first", async () => {
		withStore(storeWith(), () => <ImagePicker value="" onChange={() => {}} />);
		openGallery();
		await waitFor(() => expect(screen.getAllByRole("img").length).toBeGreaterThan(0));
		const captions = screen.getAllByTestId("image-usage").map((n) => n.textContent);
		expect(captions[0]).toMatch(/not used/i);
		expect(captions[1]).toMatch(/used in 2 widgets/i);
	});

	it("resolves tile sources through the store, not a server-sent url", async () => {
		withStore(storeWith({ url: (id) => `http://host:3123/api/images/${id}` }), () => (
			<ImagePicker value="" onChange={() => {}} />
		));
		openGallery();
		await waitFor(() => screen.getAllByTestId("image-tile"));
		const tile = screen.getAllByTestId("image-tile")[0].querySelector("img");
		expect(tile?.getAttribute("src")).toBe("http://host:3123/api/images/b");
	});

	it("falls back when a tile's file is gone", async () => {
		withStore(storeWith(), () => <ImagePicker value="" onChange={() => {}} />);
		openGallery();
		await waitFor(() => screen.getAllByTestId("image-tile"));
		const tile = screen.getAllByTestId("image-tile")[0];
		const img = tile.querySelector("img") as HTMLImageElement;
		fireEvent.error(img);
		await waitFor(() => expect(tile.querySelector("img")).toBeNull());
	});

	it("reports the chosen id", async () => {
		const onChange = vi.fn();
		withStore(storeWith(), () => <ImagePicker value="" onChange={onChange} />);
		openGallery();
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
		openGallery();
		await waitFor(() => screen.getByTestId("image-upload-input"));
		uploadFile();
		await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/238 MB of 250 MB/i));
	});

	it("templates an upload_failed refusal, distinct from the file-too-large copy", async () => {
		const store = storeWith({
			upload: async () => {
				throw new ImageStoreError("upload_failed");
			},
		});
		withStore(store, () => <ImagePicker value="" onChange={() => {}} />);
		openGallery();
		await waitFor(() => screen.getByTestId("image-upload-input"));
		uploadFile();
		await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/sign in again/i));
		expect(screen.getByRole("alert").textContent).not.toMatch(/too large to upload/i);
	});

	it("renders the server-provided quota limits and refetches them after an upload", async () => {
		const index = vi.fn(async () => indexOf([image("a")]));
		const store = storeWith({
			index,
			upload: async () => {
				index.mockResolvedValueOnce({
					images: [image("a"), image("c")],
					usage: { bytes: 209_715_200, limitBytes: 524_288_000, files: 4, limitFiles: 50 },
				});
				return image("c");
			},
		});
		withStore(store, () => <ImagePicker value="" onChange={() => {}} />);
		openGallery();
		await waitFor(() => expect(screen.getByText(/100 MB of 500 MB/i)).toBeTruthy());
		uploadFile();
		await waitFor(() => expect(screen.getByText(/200 MB of 500 MB/i)).toBeTruthy());
	});

	it("refetches the gallery after a delete", async () => {
		const index = vi.fn(async () => indexOf([image("a")]));
		const store = storeWith({ index, remove: async () => {} });
		withStore(store, () => <ImagePicker value="a" onChange={() => {}} />);
		openGallery();
		await waitFor(() => screen.getAllByTestId("image-tile"));
		fireEvent.click(screen.getAllByRole("button", { name: /delete image/i })[0]);
		fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
		await waitFor(() => expect(index.mock.calls.length).toBeGreaterThan(1));
	});

	it("surfaces a rejecting remove and closes the confirmation", async () => {
		const store = storeWith({
			remove: async () => {
				throw new ImageStoreError("upload_failed");
			},
		});
		withStore(store, () => <ImagePicker value="a" onChange={() => {}} />);
		openGallery();
		await waitFor(() => screen.getAllByTestId("image-tile"));
		fireEvent.click(screen.getAllByRole("button", { name: /delete image/i })[0]);
		fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

		await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/didn't work/i));
		// Kobalte keeps the closed dialog mounted for its exit animation, so presence isn't the signal.
		await waitFor(() =>
			expect(
				document.querySelector('[data-slot="alert-dialog-content"][data-expanded]'),
			).toBeNull(),
		);
	});
});
