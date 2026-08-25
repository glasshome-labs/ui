// Original components

// Deliberately NOT re-exported here: `Icon` from @iconify-icon/solid. A barrel
// re-export makes every ui import eagerly evaluate iconify-icon, which then
// claims the <iconify-icon> element before the host registers its bundled icon
// data — every icon silently falls back to a network fetch (see apps/dash
// main.tsx import-order comment). One door for icons has to wait for the ui
// import to stop carrying an iconify copy at all.
// Color helpers for ColorWheel/ColorSlider consumers, re-exported so they
// don't need a direct @kobalte/core dependency.
export { type Color, parseColor } from "@kobalte/core/colors";
// Floating glass panel + its shared surface token.
export { OVERLAY_SURFACE } from "../lib/overlay-classes.js";
// Section tokens re-exported from the Solid entry for convenience.
export {
	SECTION_INNER_RADIUS,
	SECTION_OUTER_RADIUS,
	SECTION_PADDING,
	SECTION_ROW_CLASS,
} from "../lib/section-tokens.js";
// Wave 2: Simple Kobalte Components
export {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./accordion.js";
// Wave 1: Pure HTML+CSS Components
export { Alert, AlertDescription, AlertTitle, type AlertTone } from "./alert.js";
export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog.js";
export { AreaPicker } from "./area-picker.js";
export { AspectRatio } from "./aspect-ratio.js";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";
export { Badge, TierBadge } from "./badge.js";
export {
	BottomSheet,
	BottomSheetBody,
	BottomSheetClose,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetFooter,
	BottomSheetHandle,
	BottomSheetHeader,
	BottomSheetOverlay,
	BottomSheetPortal,
	BottomSheetTitle,
	BottomSheetTrigger,
} from "./bottom-sheet/index.js";
export {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./breadcrumb.js";
export { Button, buttonVariants } from "./button.js";
export {
	ButtonGroup,
	ButtonGroupSeparator,
	ButtonGroupText,
	buttonGroupVariants,
} from "./button-group.js";
export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card.js";
export type { CarouselApi, CarouselTransition } from "./carousel.js";
// Wave 5: React-Library Alternatives - Complex
export {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./carousel.js";
export {
	AreaChart,
	BarList,
	formatBytes,
	formatCompact,
	RangeToggle,
	StackedBar,
} from "./charts.js";
export { Checkbox } from "./checkbox.js";
export {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./collapsible.js";
export { ColorSlider } from "./color-slider.js";
export { ColorWheel } from "./color-wheel.js";
export {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "./context-menu.js";
export { CopyButton } from "./copy-button.js";
export { CountPill } from "./count-pill.js";
export {
	type SortDirection,
	TABLE_BLEED,
	TABLE_CELL_X,
	TABLE_HEAD_CELL_CLASS,
	TABLE_HEAD_CLASS,
	TABLE_NUM_CELL_CLASS,
	TABLE_ROW_CLASS,
	TABLE_SCROLL_CLASS,
	TableBulkBar,
	TableEmpty,
	TableError,
	TableFilterSelect,
	TableSearchInput,
	TableSkeleton,
	TableSortHeader,
} from "./data-table.js";
export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog.js";
export type { DockIconButtonProps, DockItem, DockProps } from "./dock.js";
export { Dock } from "./dock.js";
export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuTrigger,
} from "./dropdown-menu.js";
export {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./empty.js";
// Host-provided data source for the smart-home pickers (AreaPicker,
// EntitySelector): ui owns only these structural types; the host app wires a
// live adapter (dash: sync-layer) into EntityDataContext.
export {
	type AreaViewLike,
	type EntityDataAdapter,
	EntityDataContext,
	type EntityViewLike,
	provideEntityData,
	useEntityData,
} from "./entity-data.js";
export { EntitySelector } from "./entity-selector.js";
export {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "./field.js";
export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from "./form.js";
export {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "./hover-card.js";
export { IconPicker, type IconPickerProps } from "./icon-picker.js";
export { ImagePicker, type ImagePickerProps } from "./image-picker.js";
export { Input } from "./input.js";
export {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "./input-group.js";
export {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "./input-otp.js";
export {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemHeader,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "./item.js";
export { Kbd, KbdGroup } from "./kbd.js";
export { Label } from "./label.js";
export {
	createListReorder,
	dragTargetIndex,
	type ListReorder,
	type ListReorderOptions,
} from "./list-reorder.js";
export { Logo } from "./logo.js";
export {
	imageUrl,
	type MediaIndex,
	type MediaQuotaUsage,
	type MediaStore,
	MediaStoreContext,
	MediaStoreError,
	type MediaStoreErrorKind,
	mediaUrl,
	provideMediaStore,
	type StoredMedia,
	useMediaStore,
} from "./media-store.js";
export { NumberField } from "./number-field.js";
export { Overlay } from "./overlay.js";
export { PageHeader } from "./page-header.js";
export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./pagination.js";
export {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
} from "./popover.js";
export { Progress } from "./progress.js";
export { RadioGroup, RadioGroupItem } from "./radio-group.js";
export {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./resizable.js";
// Wave 6: Compound Components
export {
	ResponsiveDialog,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "./responsive-dialog.js";
export {
	type ExtendedJSONSchema,
	SCHEMA_FORM_FORM_TYPES,
	SchemaForm,
} from "./schema-form.js";
export { ScopeIndicator } from "./scope-indicator.js";
export { ScrollArea, ScrollBar } from "./scroll-area.js";
export {
	type GlassSurface,
	SectionCard,
	SectionIcon,
	SectionLabel,
	SectionMeta,
	SectionRow,
	SectionRowSkeleton,
	SectionRowSkeletons,
	SectionSubtitle,
	SectionTitle,
} from "./section-card.js";
// Wave 3: Complex Kobalte Components
export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "./select.js";
export { Separator } from "./separator.js";
export {
	LabeledField,
	LabeledIconPicker,
	LabeledInput,
	RowActions,
	SectionAddButton,
	SectionEmpty,
	SwitchRow,
} from "./settings-row.js";
export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./sheet.js";
export { Skeleton } from "./skeleton.js";
export { Slider } from "./slider.js";
export { SlidingIndicator } from "./sliding-indicator.js";
// Wave 4: React-Library Alternatives - Simpler
export { GlassToast, Toaster, toast } from "./sonner.js";
export { Spinner } from "./spinner.js";
export { Switch } from "./switch.js";
export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./table.js";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";
export { Textarea } from "./textarea.js";
export { Toggle, toggleVariants } from "./toggle.js";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group.js";
export { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js";
export { WidgetCard } from "./widget-card.js";
export {
	formatWidgetCount,
	WidgetIdentity,
	WidgetMeta,
	type WidgetSummary,
	widgetHref,
} from "./widget-identity.js";
export { WidgetTrustBadge } from "./widget-trust-badge.js";
