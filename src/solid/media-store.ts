import { createContext, useContext } from "solid-js";

export type StoredMedia = {
	id: string;
	mimeType: string;
	width?: number;
	height?: number;
	size: number;
	/** Server-computed count of live widget configs referencing this id. */
	usedBy: number;
};

export type MediaQuotaUsage = {
	bytes: number;
	limitBytes: number;
	files: number;
	limitFiles: number;
};

export type MediaStoreErrorKind =
	| "file_too_large"
	| "image_too_large"
	| "not_an_image"
	| "quota_bytes_exceeded"
	| "quota_files_exceeded"
	| "upload_rate_exceeded"
	| "server_storage_full"
	| "no_active_household"
	| "upload_failed";

export class MediaStoreError extends Error {
	readonly kind: MediaStoreErrorKind;
	readonly usage?: MediaQuotaUsage;

	constructor(kind: MediaStoreErrorKind, usage?: MediaQuotaUsage) {
		super(kind);
		this.name = "MediaStoreError";
		this.kind = kind;
		this.usage = usage;
	}
}

/** One gallery open, one query: the server counts usage in the same scan. */
export type MediaIndex = {
	images: StoredMedia[];
	usage: MediaQuotaUsage;
};

export interface MediaStore {
	index(): Promise<MediaIndex>;
	upload(file: File): Promise<StoredMedia>;
	remove(id: string): Promise<void>;
	url(id: string): string;
}

export const MediaStoreContext = createContext<MediaStore>();

let defaultStore: MediaStore | undefined;

/** Host apps call this once at startup; MediaStoreContext overrides it per-tree. */
export function provideMediaStore(store: MediaStore): void {
	defaultStore = store;
}

export function useMediaStore(): MediaStore | undefined {
	return useContext(MediaStoreContext) ?? defaultStore;
}

export function mediaUrl(id: string | null | undefined): string | undefined {
	if (!id) return undefined;
	return useMediaStore()?.url(id);
}

/** Reads better than mediaUrl in an image widget's source. */
export const imageUrl = mediaUrl;
