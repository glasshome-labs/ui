import { Icon } from "@iconify-icon/solid";
import { createSignal, For } from "solid-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	BottomSheet,
	BottomSheetBody,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetFooter,
	BottomSheetHandle,
	BottomSheetHeader,
	BottomSheetOverlay,
	BottomSheetPortal,
	BottomSheetTitle,
	BottomSheetTrigger,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ResponsiveDialog,
	ResponsiveDialogBody,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../../src/solid";
import { CatalogGroup, CatalogItem } from "../CatalogKit";

/* Dev-only: keeps a specimen open across HMR full-reloads (any edit to a
 * shared lib constant like OVERLAY_SURFACE reloads the whole gallery, which
 * would otherwise close every open overlay and lose scroll position). */
function usePersistentOpen(key: string) {
	const storageKey = `impeccable-open:${key}`;
	const [open, setOpenSignal] = createSignal(sessionStorage.getItem(storageKey) === "1");
	const setOpen = (value: boolean) => {
		setOpenSignal(value);
		sessionStorage.setItem(storageKey, value ? "1" : "0");
	};
	return [open, setOpen] as const;
}

/* 30 rows: the specimen only proves the scroll contract (bar inside the panel
 * edge, header and footer pinned) if the body actually overflows. */
function DemoRows(props: { count?: number }) {
	return (
		<For each={Array.from({ length: props.count ?? 30 }, (_, i) => i + 1)}>
			{(i) => (
				<div class="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
					<span class="text-foreground text-sm">Living room lamp {i}</span>
					<span class="text-muted-foreground text-xs">on</span>
				</div>
			)}
		</For>
	);
}

function HeaderAction() {
	return (
		<Button variant="ghost" size="sm">
			<Icon icon="lucide:rotate-ccw" width={16} height={16} /> Reset
		</Button>
	);
}

export function OverlaysCatalog() {
	const [dialogOpen, setDialogOpen] = usePersistentOpen("dialog");
	const [sheetOpen, setSheetOpen] = usePersistentOpen("sheet");
	return (
		<CatalogGroup id="cat-overlays" title="Overlays">
			<CatalogItem name="Dialog" hint="modal · click to open">
				<Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
					<DialogTrigger as={Button} variant="outline">
						Open dialog
					</DialogTrigger>
					<DialogContent>
						<DialogHeader action={<HeaderAction />}>
							<DialogTitle>Package dialog</DialogTitle>
							<DialogDescription>Confirm actions, edit records, link devices.</DialogDescription>
						</DialogHeader>
						<DialogBody>
							<DemoRows />
						</DialogBody>
						<DialogFooter>
							<DialogClose>Cancel</DialogClose>
							<Button>Confirm</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CatalogItem>

			<CatalogItem name="AlertDialog" hint="confirm · click to open">
				<AlertDialog>
					<AlertDialogTrigger as={Button} variant="destructive">
						Delete widget
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this widget?</AlertDialogTitle>
							<AlertDialogDescription>
								This removes it from every dashboard. This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogBody>
							<p class="text-muted-foreground text-sm">
								Three dashboards still show it. They will fall back to an empty cell.
							</p>
						</AlertDialogBody>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Delete</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CatalogItem>

			<CatalogItem name="Sheet" hint="side panel · click to open">
				<Sheet open={sheetOpen()} onOpenChange={setSheetOpen}>
					<SheetTrigger as={Button} variant="outline">
						Open sheet
					</SheetTrigger>
					<SheetContent side="right">
						<SheetHeader action={<HeaderAction />}>
							<SheetTitle>Widget settings</SheetTitle>
							<SheetDescription>Edit-in-place panel that slides from the edge.</SheetDescription>
						</SheetHeader>
						<SheetBody>
							<DemoRows />
						</SheetBody>
						<SheetFooter>
							<SheetClose>Cancel</SheetClose>
							<Button>Save</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</CatalogItem>

			<CatalogItem name="BottomSheet" hint="drag-to-dismiss · click to open">
				<BottomSheet>
					<BottomSheetTrigger as={Button} variant="outline">
						Open bottom sheet
					</BottomSheetTrigger>
					<BottomSheetPortal>
						<BottomSheetOverlay />
						<BottomSheetContent>
							<BottomSheetHandle />
							<BottomSheetHeader action={<HeaderAction />}>
								<BottomSheetTitle>Bottom sheet</BottomSheetTitle>
								<BottomSheetDescription>
									Drag-to-dismiss panel with snap points, the mobile-native surface.
								</BottomSheetDescription>
							</BottomSheetHeader>
							<BottomSheetBody>
								<DemoRows />
							</BottomSheetBody>
							<BottomSheetFooter>
								<Button variant="outline">Cancel</Button>
								<Button>Save</Button>
							</BottomSheetFooter>
						</BottomSheetContent>
					</BottomSheetPortal>
				</BottomSheet>
			</CatalogItem>

			<CatalogItem name="Popover" hint="anchored · click to open">
				<Popover>
					<PopoverTrigger as={Button} variant="outline">
						Open popover
					</PopoverTrigger>
					<PopoverContent class="w-56">
						<p class="font-medium text-foreground text-sm">Quick note</p>
						<p class="mt-1 text-muted-foreground text-sm">
							Lightweight anchored surface for extra context.
						</p>
					</PopoverContent>
				</Popover>
			</CatalogItem>

			<CatalogItem name="DropdownMenu" hint="menu · click to open">
				<DropdownMenu>
					<DropdownMenuTrigger as={Button} variant="outline">
						Actions
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuLabel>Widget</DropdownMenuLabel>
							<DropdownMenuItem>
								<Icon icon="lucide:pencil" width={16} height={16} /> Edit
								<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Icon icon="lucide:copy" width={16} height={16} /> Duplicate
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="text-destructive">
								<Icon icon="lucide:trash-2" width={16} height={16} /> Delete
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</CatalogItem>

			<CatalogItem name="ContextMenu" hint="right-click">
				<ContextMenu>
					<ContextMenuTrigger class="flex h-16 w-full items-center justify-center rounded-md border border-border/60 border-dashed bg-muted/20 text-muted-foreground text-xs">
						Right-click me
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuGroup>
							<ContextMenuLabel>Widget</ContextMenuLabel>
							<ContextMenuItem>
								<Icon icon="lucide:pencil" width={16} height={16} /> Edit
								<ContextMenuShortcut>⌘E</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem>
								<Icon icon="lucide:copy" width={16} height={16} /> Duplicate
							</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem variant="destructive">
								<Icon icon="lucide:trash-2" width={16} height={16} /> Delete
							</ContextMenuItem>
						</ContextMenuGroup>
					</ContextMenuContent>
				</ContextMenu>
			</CatalogItem>

			<CatalogItem name="Collapsible" hint="expand/collapse" span={2}>
				<Collapsible class="w-full">
					<CollapsibleTrigger class="flex w-full items-center justify-between gap-2 text-foreground text-sm">
						<span class="inline-flex items-center gap-2">
							<Icon icon="lucide:search" width={16} height={16} class="size-4" /> Advanced filters
						</span>
						<Icon
							icon="lucide:chevron-down"
							width={16}
							height={16}
							class="size-4 text-muted-foreground"
						/>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div class="rounded-md border border-border/50 bg-muted/20 p-3 text-muted-foreground text-sm">
							Extra options revealed on demand, animated open and closed.
						</div>
					</CollapsibleContent>
				</Collapsible>
			</CatalogItem>

			<CatalogItem name="ResponsiveDialog" hint="adaptive · click to open">
				<ResponsiveDialog>
					<ResponsiveDialogTrigger as={Button} variant="outline">
						Open responsive
					</ResponsiveDialogTrigger>
					<ResponsiveDialogContent>
						<ResponsiveDialogHeader action={<HeaderAction />}>
							<ResponsiveDialogTitle>Adaptive dialog</ResponsiveDialogTitle>
							<ResponsiveDialogDescription>
								Centered modal on desktop, drag-to-dismiss bottom sheet on mobile.
							</ResponsiveDialogDescription>
						</ResponsiveDialogHeader>
						<ResponsiveDialogBody>
							<DemoRows />
						</ResponsiveDialogBody>
						<ResponsiveDialogFooter>
							<ResponsiveDialogClose>Close</ResponsiveDialogClose>
							<Button>Save</Button>
						</ResponsiveDialogFooter>
					</ResponsiveDialogContent>
				</ResponsiveDialog>
			</CatalogItem>
		</CatalogGroup>
	);
}
