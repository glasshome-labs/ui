import { Icon } from "@iconify-icon/solid";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
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
import { Popover, PopoverAnchor, PopoverContent } from "./popover.js";
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
	const [error, setError] = createSignal<ImageStoreError>();
	const [pendingDelete, setPendingDelete] = createSignal<StoredImage>();
	const [thumbBroken, setThumbBroken] = createSignal(false);
	let fileInput: HTMLInputElement | undefined;

	const [images, { refetch }] = createResource(() => store.list());
	const [usage, { refetch: refetchUsage }] = createResource(() => store.usage());
	const sorted = createMemo(() => sortImages(images() ?? []));
	const deleteDescription = createMemo(() => {
		const used = pendingDelete()?.usedBy ?? 0;
		return used === 0
			? "This image isn't used by any widget."
			: `This image is used in ${used} widget${used === 1 ? "" : "s"}. Deleting it will leave those widgets without an image.`;
	});

	const handleUpload = async (file: File) => {
		setError(undefined);
		try {
			const uploaded = await store.upload(file);
			await Promise.all([refetch(), refetchUsage()]);
			props.onChange(uploaded.id);
		} catch (cause) {
			if (cause instanceof ImageStoreError) setError(cause);
			else throw cause;
		}
	};

	const confirmDelete = async () => {
		const target = pendingDelete();
		if (!target) return;
		await store.remove(target.id);
		setPendingDelete(undefined);
		await Promise.all([refetch(), refetchUsage()]);
	};

	return (
		<div data-slot="image-picker" class={cn(props.class)}>
			<Popover open={open()} onOpenChange={setOpen}>
				<PopoverAnchor as="div">
					<Button type="button" variant="outline" onClick={() => setOpen(!open())}>
						<Show
							when={!thumbBroken() && props.value}
							fallback={<span class="size-6 shrink-0 rounded bg-muted" />}
						>
							<img
								src={store.url(props.value)}
								alt=""
								class="size-6 shrink-0 rounded object-cover"
								onError={() => setThumbBroken(true)}
							/>
						</Show>
						Choose image
					</Button>
				</PopoverAnchor>
				<PopoverContent class="flex w-80 flex-col gap-3" onInteractOutside={() => setOpen(false)}>
					<Show when={error()}>
						{(err) => (
							<Alert tone="destructive" role="alert">
								{ERROR_COPY[err().kind](err().usage)}
							</Alert>
						)}
					</Show>
					<Show
						when={!images.loading}
						fallback={
							<div class="grid grid-cols-3 gap-2">
								<For each={[0, 1, 2, 3, 4, 5]}>{() => <Skeleton class="aspect-square" />}</For>
							</div>
						}
					>
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
													"relative aspect-square overflow-hidden rounded-md border border-border/60",
													props.value === image.id && "ring-2 ring-primary",
												)}
												onClick={() => {
													props.onChange(image.id);
													setThumbBroken(false);
													setOpen(false);
												}}
											>
												<img
													src={image.url}
													alt={`Stored ${image.id}`}
													class="size-full object-cover"
												/>
											</button>
											<div class="flex items-center justify-between gap-1">
												<span data-testid="image-usage" class="text-muted-foreground text-xs">
													{usageLabel(image.usedBy)}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
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
						<Show when={usage()}>
							{(u) => (
								<SectionMeta>
									{formatBytes(u().bytes)} of {formatBytes(u().limitBytes)} · {u().files} of{" "}
									{u().limitFiles} images
								</SectionMeta>
							)}
						</Show>
					</Show>
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
