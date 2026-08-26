import { Icon } from "@iconify-icon/solid";
import { createMemo, createResource, createSignal, For, Match, Show, Switch } from "solid-js";
import { INPUT_CLASS } from "../lib/input-classes.js";
import { cn } from "../lib/utils.js";
import { Alert } from "./alert.js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog.js";
import { Button } from "./button.js";
import { formatBytes } from "./charts.js";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./empty.js";
import {
	type MediaQuotaUsage,
	MediaStoreError,
	type MediaStoreErrorKind,
	type StoredMedia,
	useMediaStore,
} from "./media-store.js";
import { MediaTile } from "./media-tile.js";
import { anchorToTriggerTop, Popover, PopoverAnchor, PopoverContent } from "./popover.js";
import { SectionMeta } from "./section-card.js";
import { Skeleton } from "./skeleton.js";

export interface ImagePickerProps {
	value: string;
	onChange: (id: string) => void;
	class?: string;
}

const ERROR_COPY: Record<MediaStoreErrorKind, (usage?: MediaQuotaUsage) => string> = {
	file_too_large: () => "That file is too large to upload.",
	image_too_large: () => "That image's dimensions are too large.",
	not_an_image: () => "That file isn't an image.",
	quota_bytes_exceeded: (usage) =>
		usage
			? `You've used ${formatBytes(usage.bytes)} of ${formatBytes(usage.limitBytes)} of image storage. Delete an image to free up space.`
			: "You're out of image storage. Delete an image to free up space.",
	quota_files_exceeded: (usage) =>
		usage
			? `You've stored ${usage.files} of ${usage.limitFiles} images. Delete one to add another.`
			: "You've reached the image limit. Delete one to add another.",
	upload_rate_exceeded: () => "Too many uploads at once. Wait a moment and try again.",
	server_storage_full: () =>
		"The dashboard's image storage is full. Whoever runs this dashboard needs to free up space on the server.",
	no_active_household: () => "No household is active, so images can't be uploaded right now.",
	upload_failed: () => "That didn't work. Try again, and sign in again if it keeps failing.",
};

const INDEX_ERROR_COPY: Partial<Record<MediaStoreErrorKind, string>> = {
	no_active_household: "No household is active, so your images can't be loaded right now.",
};

function indexErrorCopy(error: MediaStoreError): string {
	return (
		INDEX_ERROR_COPY[error.kind] ??
		"Your images couldn't be loaded. The dashboard may have lost the server."
	);
}

function toStoreError(cause: unknown): MediaStoreError {
	return cause instanceof MediaStoreError ? cause : new MediaStoreError("upload_failed");
}

/** A row whose mime is missing or not a string is not an image; a throw here would
 *  take the popover and its overlay down with the gallery. */
function isImageRow(item: StoredMedia): boolean {
	return typeof item.mimeType === "string" && item.mimeType.startsWith("image/");
}

function sortImages(images: StoredMedia[]): StoredMedia[] {
	return images.filter(isImageRow).sort((a, b) => {
		if ((a.usedBy === 0) !== (b.usedBy === 0)) return a.usedBy === 0 ? -1 : 1;
		return a.id.localeCompare(b.id);
	});
}

export function ImagePicker(props: ImagePickerProps) {
	const store = useMediaStore();

	if (!store) {
		return (
			<div data-slot="image-picker" class={cn(props.class)}>
				<Alert tone="info">This dashboard cannot store images.</Alert>
			</div>
		);
	}

	const [open, setOpen] = createSignal(false);
	const [everOpened, setEverOpened] = createSignal(false);
	const [error, setError] = createSignal<MediaStoreError>();
	const [pendingDelete, setPendingDelete] = createSignal<StoredMedia>();
	const [thumbBroken, setThumbBroken] = createSignal(false);
	const [brokenTiles, setBrokenTiles] = createSignal<Readonly<Record<string, string>>>({});
	let fileInput: HTMLInputElement | undefined;

	const [index, { refetch }] = createResource(everOpened, () => store.index());
	// Reading index() on a rejected resource rethrows, which crashes the popover's
	// portal and leaves its overlay swallowing clicks. Every read goes through this.
	const indexError = createMemo(() =>
		index.error === undefined ? undefined : toStoreError(index.error),
	);
	const loaded = () => (index.error === undefined ? index() : undefined);
	const sorted = createMemo(() => sortImages(loaded()?.media ?? []));
	const deleteDescription = createMemo(() => {
		const used = pendingDelete()?.usedBy ?? 0;
		return used === 0
			? "This image isn't used by any widget."
			: `This image is used in ${used} widget${used === 1 ? "" : "s"}. Deleting it will leave those widgets without an image.`;
	});

	const openGallery = (next: boolean) => {
		if (next) setEverOpened(true);
		setOpen(next);
	};

	// A store rejection is picker state, never an unhandled rejection escaping the tree.
	const fail = (cause: unknown) => setError(toStoreError(cause));

	const handleUpload = async (file: File) => {
		setError(undefined);
		try {
			const uploaded = await store.upload(file);
			await refetch();
			props.onChange(uploaded.id);
		} catch (cause) {
			fail(cause);
		}
	};

	const confirmDelete = async () => {
		const target = pendingDelete();
		if (!target) return;
		setError(undefined);
		try {
			await store.remove(target.id);
			await refetch();
		} catch (cause) {
			fail(cause);
		} finally {
			setPendingDelete(undefined);
		}
	};

	return (
		<div data-slot="image-picker" class={cn(props.class)}>
			<Popover
				open={open()}
				onOpenChange={openGallery}
				modal
				gutter={0}
				getAnchorRect={anchorToTriggerTop}
			>
				<PopoverAnchor as="div">
					<button
						type="button"
						data-slot="image-picker-trigger"
						class={cn(INPUT_CLASS, "items-center gap-2 text-sm")}
						onClick={() => openGallery(!open())}
					>
						<Show
							when={!thumbBroken() && props.value}
							fallback={
								<>
									<Icon
										icon={thumbBroken() ? "lucide:image-off" : "lucide:image"}
										width={18}
										height={18}
										class="shrink-0 text-muted-foreground"
									/>
									<span class="flex-1 truncate text-left text-muted-foreground">
										{thumbBroken() ? "Image unavailable" : "Choose image"}
									</span>
								</>
							}
						>
							<img
								src={store.url(props.value)}
								alt=""
								width={24}
								height={24}
								decoding="async"
								class="size-6 shrink-0 rounded-sm object-cover"
								onError={() => setThumbBroken(true)}
							/>
							<span class="flex-1 truncate text-left">Image selected</span>
						</Show>
						<Icon
							icon="lucide:chevron-down"
							width={16}
							height={16}
							class="shrink-0 text-muted-foreground"
						/>
					</button>
				</PopoverAnchor>
				<PopoverContent
					surface="field"
					class="flex w-[var(--kb-popper-anchor-width)] min-w-72 flex-col gap-3"
					onInteractOutside={() => setOpen(false)}
				>
					<Show when={error()}>
						{(err) => (
							<Alert tone="destructive" role="alert">
								{ERROR_COPY[err().kind](err().usage)}
							</Alert>
						)}
					</Show>
					<Switch
						fallback={
							<div data-slot="image-picker-loading" class="grid grid-cols-3 gap-2">
								<For each={[0, 1, 2, 3, 4, 5]}>{() => <Skeleton class="aspect-square" />}</For>
							</div>
						}
					>
						<Match when={indexError()}>
							{(failure) => (
								// role="status": the gallery is explaining itself, not raising an alarm.
								<Empty role="status">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<Icon icon="lucide:image-off" width={24} height={24} />
										</EmptyMedia>
										<EmptyTitle>Images unavailable</EmptyTitle>
										<EmptyDescription>{indexErrorCopy(failure())}</EmptyDescription>
									</EmptyHeader>
									<EmptyContent>
										<Button
											type="button"
											variant="outline"
											size="sm"
											data-slot="image-picker-retry"
											onClick={() => void refetch()}
										>
											Try again
										</Button>
									</EmptyContent>
								</Empty>
							)}
						</Match>
						<Match when={loaded()}>
							<Show
								when={sorted().length > 0}
								fallback={
									<Empty>
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Icon icon="lucide:image" width={24} height={24} />
											</EmptyMedia>
											<EmptyTitle>No images yet</EmptyTitle>
											<EmptyDescription>Upload one to use it here.</EmptyDescription>
										</EmptyHeader>
									</Empty>
								}
							>
								<div class="grid grid-cols-3 gap-2">
									<For each={sorted()}>
										{(image) => (
											<MediaTile
												item={image}
												thumbUrl={store.url(image.id, "thumb")}
												label={`Use ${image.id}`}
												broken={brokenTiles()[image.id] === store.url(image.id, "thumb")}
												markUnused
												selected={props.value === image.id}
												onSelect={() => {
													props.onChange(image.id);
													setThumbBroken(false);
													setOpen(false);
												}}
												onBroken={() =>
													setBrokenTiles((broken) => ({
														...broken,
														[image.id]: store.url(image.id, "thumb"),
													}))
												}
												onDelete={() => setPendingDelete(image)}
											/>
										)}
									</For>
								</div>
							</Show>
							<Show when={loaded()?.usage}>
								{(u) => (
									<SectionMeta>
										{formatBytes(u().bytes)} of {formatBytes(u().limitBytes)} · {u().files} of{" "}
										{u().limitFiles} images
									</SectionMeta>
								)}
							</Show>
						</Match>
					</Switch>
					<input
						ref={fileInput}
						type="file"
						accept="image/*"
						data-testid="image-upload-input"
						class="hidden"
						onChange={(e) => {
							const file = e.currentTarget.files?.[0];
							e.currentTarget.value = "";
							if (file) void handleUpload(file);
						}}
					/>
					<Button type="button" variant="outline" size="sm" onClick={() => fileInput?.click()}>
						<Icon icon="lucide:upload" width={14} height={14} />
						Upload
					</Button>
				</PopoverContent>
			</Popover>
			<AlertDialog
				open={pendingDelete() !== undefined}
				onOpenChange={(next) => {
					if (!next) setPendingDelete(undefined);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete image?</AlertDialogTitle>
						<AlertDialogDescription>{deleteDescription()}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel aria-label="Cancel">Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							aria-label="Delete"
							onClick={() => void confirmDelete()}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
