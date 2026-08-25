import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import {
	ImageStoreContext,
	type ImageStore,
	imageUrl,
	provideImageStore,
	useImageStore,
} from "../../src/solid/image-store.js";

function stubStore(prefix: string): ImageStore {
	return {
		list: async () => [],
		upload: async () => {
			throw new Error("not used");
		},
		remove: async () => {},
		url: (id) => `${prefix}/${id}`,
	};
}

describe("image store singleton", () => {
	it("returns undefined for an absent id", () => {
		provideImageStore(stubStore("/api/images"));
		expect(imageUrl(undefined)).toBeUndefined();
		expect(imageUrl(null)).toBeUndefined();
		expect(imageUrl("")).toBeUndefined();
	});

	it("resolves through the registered store outside any component", () => {
		provideImageStore(stubStore("/api/images"));
		expect(imageUrl("abc")).toBe("/api/images/abc");
	});

	it("prefers a context store over the singleton", () => {
		provideImageStore(stubStore("/singleton"));
		let seen: string | undefined;
		render(() => (
			<ImageStoreContext.Provider value={stubStore("/context")}>
				{(() => {
					seen = imageUrl("abc");
					return null;
				})()}
			</ImageStoreContext.Provider>
		));
		expect(seen).toBe("/context/abc");
	});

	it("returns undefined when no store is registered", () => {
		provideImageStore(undefined as unknown as ImageStore);
		expect(useImageStore()).toBeUndefined();
		expect(imageUrl("abc")).toBeUndefined();
	});
});
