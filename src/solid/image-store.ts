import { createContext, useContext } from "solid-js";

export type StoredImage = {
	id: string;
	url: string;
	width: number;
	height: number;
	size: number;
	/** Server-computed count of live widget configs referencing this id. */
	usedBy: number;
};

export type ImageQuotaUsage = {
	bytes: number;
	limitBytes: number;
	files: number;
	limitFiles: number;
};

export type ImageStoreErrorKind =
	| "file_too_large"
	| "image_too_large"
	| "not_an_image"
	| "quota_bytes_exceeded"
	| "quota_files_exceeded"
	| "upload_rate_exceeded"
	| "server_storage_full"
	| "no_active_household"
	| "upload_failed";

export class ImageStoreError extends Error {
	readonly kind: ImageStoreErrorKind;
	readonly usage?: ImageQuotaUsage;

	constructor(kind: ImageStoreErrorKind, usage?: ImageQuotaUsage) {
		super(kind);
		this.name = "ImageStoreError";
		this.kind = kind;
		this.usage = usage;
	}
}

export interface ImageStore {
	list(): Promise<StoredImage[]>;
	usage(): Promise<ImageQuotaUsage>;
	upload(file: File): Promise<StoredImage>;
	remove(id: string): Promise<void>;
	url(id: string): string;
}

export const ImageStoreContext = createContext<ImageStore>();

let defaultStore: ImageStore | undefined;

/** Host apps call this once at startup; ImageStoreContext overrides it per-tree. */
export function provideImageStore(store: ImageStore): void {
	defaultStore = store;
}

export function useImageStore(): ImageStore | undefined {
	return useContext(ImageStoreContext) ?? defaultStore;
}

export function imageUrl(id: string | null | undefined): string | undefined {
	if (!id) return undefined;
	return useImageStore()?.url(id);
}
