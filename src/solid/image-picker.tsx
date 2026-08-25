import { Icon } from "@iconify-icon/solid";
import { createMemo, createResource, createSignal, For, Match, Show, Switch } from "solid-js";
import { FIELD_CHROME, INPUT_CLASS } from "../lib/input-classes.js";
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty.js";
import {
	type ImageQuotaUsage,
	ImageStoreError,
	type ImageStoreErrorKind,
	type StoredImage,
	useImageStore,
} from "./image-store.js";
import { anchorToTriggerTop, Popover, PopoverAnchor, PopoverContent } from "./popover.js";
import { SectionMeta } from "./section-card.js";
import { Skeleton } from "./skeleton.js";

export interface ImagePickerProps {
	value: string;
	onChange: (id: string) => void;
	class?: string;
}

const ERROR_COPY: Record<ImageStoreErrorKind, (usage?: ImageQuotaUsage) => string> = {
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

const INDEX_ERROR_COPY: Partial<Record<ImageStoreErrorKind, string>> = {
	no_active_household: "No household is active, so your images can't be loaded right now.",
};

function indexErrorCopy(error: ImageStoreError): string {
	return (
		INDEX_ERROR_COPY[error.kind] ??
		"Your images couldn't be loaded. The dashboard may have lost the server."
	);
}

function toStoreError(cause: unknown): ImageStoreError {
	return cause instanceof ImageStoreError ? cause : new ImageStoreError("upload_failed");
}

function usageLabel(usedBy: number): string {
	return usedBy === 0 ? "not used" : `used in ${usedBy} widget${usedBy === 1 ? "" : "s"}`;
}

function sortImages(images: StoredImage[]): StoredImage[] {
	return [...images].sort((a, b) => {
		if ((a.usedBy === 0) !== (b.usedBy === 0)) return a.usedBy === 0 ? -1 : 1;
		return a.id.localeCompare(b.id);
	});
}

export function ImagePicker(props: ImagePickerProps) {
	const store = useImageStore();

	if (!store) {
		return (
			<div data-slot="image-picker" class={cn(props.class)}>
				<Alert tone="info">This dashboard cannot store images.</Alert>
			</div>
		);
	}

	const [open, setOpen] = createSignal(false);
	const [everOpened, setEverOpened] = createSignal(false);
	const [error, setError] = createSignal<ImageStoreError>();
	const [pendingDelete, setPendingDelete] = createSignal<StoredImage>();
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
	const sorted = createMemo(() => sortImages(loaded()?.images ?? []));
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
							icon="mdi:chevron-down"
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
								<Alert
									tone="destructive"
									action={
										<Button
											type="button"
											variant="outline"
											size="sm"
											data-slot="image-picker-retry"
											onClick={() => void refetch()}
										>
											Try again
										</Button>
									}
								>
									{indexErrorCopy(failure())}
								</Alert>
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
											<div class="flex flex-col gap-1">
												<button
													type="button"
													data-testid="image-tile"
													class={cn(
														FIELD_CHROME,
														"relative aspect-square w-full overflow-hidden rounded-md",
														props.value === image.id && "ring-2 ring-primary",
													)}
													onClick={() => {
														props.onChange(image.id);
														setThumbBroken(false);
														setOpen(false);
													}}
												>
													<Show
														when={brokenTiles()[image.id] !== store.url(image.id)}
														fallback={
															<span
																data-testid="image-tile-broken"
																class="absolute inset-0 flex items-center justify-center text-muted-foreground"
															>
																<Icon icon="lucide:image-off" width={20} height={20} />
															</span>
														}
													>
														<img
															src={store.url(image.id)}
															alt={`Stored ${image.id}`}
															width={image.width}
															height={image.height}
															loading="lazy"
															decoding="async"
															class="absolute inset-0 h-full w-full object-cover"
															onError={() =>
																setBrokenTiles((broken) => ({
																	...broken,
																	[image.id]: store.url(image.id),
																}))
															}
														/>
													</Show>
												</button>
												<div class="flex items-center justify-between gap-1">
													<span
														data-testid="image-usage"
														class="min-w-0 truncate text-muted-foreground text-xs"
													>
														{usageLabel(image.usedBy)}
													</span>
													<Button
														type="button"
														variant="ghost"
														size="none"
														class="size-6"
														aria-label="Delete image"
														onClick={() => setPendingDelete(image)}
													>
														<Icon icon="lucide:trash-2" width={16} height={16} />
													</Button>
												</div>
											</div>
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
					<Button type="button" variant="outline" onClick={() => fileInput?.click()}>
						Upload image
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
