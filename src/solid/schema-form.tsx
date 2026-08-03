import { Icon } from "@iconify-icon/solid";
import type { JSONSchema7 } from "json-schema";
import { createMemo, createSignal, For, Index, Match, Show, Switch as SwitchFlow } from "solid-js";
import { cn } from "../lib/utils.js";
import { Alert } from "./alert.js";
import { AreaPicker } from "./area-picker.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { Card } from "./card.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible.js";
import { EntitySelector } from "./entity-selector.js";
import { IconPicker, type IconPickerProps } from "./icon-picker.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import { createListReorder } from "./list-reorder.js";
import { NumberField } from "./number-field.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { Switch } from "./switch.js";

export interface ExtendedJSONSchema extends JSONSchema7 {
	/** Explicit control choice from the SDK's field.* helpers. */
	formType?: string;
	domain?: string;
	singleSelect?: boolean;
	deviceClass?: string;
	/** formType "variants": the property that selects the active branch. */
	discriminator?: string;
	/** formType "variants": kind → display name for the discriminator Select. */
	labels?: Record<string, string>;
	/** formType "list": add-button caption. */
	addLabel?: string;
	/** formType "list": item field whose value captions the collapsed row. */
	labelField?: string;
}

/**
 * formType values with a dedicated renderer branch. Any other formType renders
 * a read-only "needs a newer dashboard" notice instead of a broken control
 * (widgets auto-update independently of the host, so an old host WILL meet
 * schemas with formTypes it predates). Kept in lockstep with the SDK's field
 * helpers by dash's formType parity test.
 */
export const SCHEMA_FORM_FORM_TYPES = ["icon-picker", "area-picker", "list", "variants"] as const;

const warnedLegacyAreaKeys = new Set<string>();

/**
 * @deprecated Removed in the next major. Before the SDK had `field.area()`,
 * an area picker was inferred from the property name alone, so a field had to
 * be called `areaId` to get one and any other name silently rendered a text
 * input. Declare `field.area()` instead — it works under any name.
 */
function isLegacyAreaKey(key: string, prop: ExtendedJSONSchema): boolean {
	const lower = key.toLowerCase();
	if (prop.type !== "string" || (lower !== "areaid" && lower !== "area_id")) return false;
	const isDev = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
	if (isDev && !warnedLegacyAreaKeys.has(key)) {
		warnedLegacyAreaKeys.add(key);
		console.warn(
			`[SchemaForm] "${key}" renders an area picker because of its name. That fallback is removed in the next major; declare it with field.area() instead. https://glasshome.app/docs/widget-sdk/config`,
		);
	}
	return true;
}

function isKnownFormType(prop: ExtendedJSONSchema): boolean {
	return (
		prop.formType === undefined ||
		(SCHEMA_FORM_FORM_TYPES as readonly string[]).includes(prop.formType)
	);
}

function schemaOf(definition: unknown): ExtendedJSONSchema {
	return typeof definition === "object" && definition !== null
		? (definition as ExtendedJSONSchema)
		: {};
}

function itemsOf(prop: ExtendedJSONSchema): ExtendedJSONSchema {
	return Array.isArray(prop.items) ? {} : schemaOf(prop.items);
}

function propertiesOf(prop: ExtendedJSONSchema): Array<[string, ExtendedJSONSchema]> {
	return Object.entries(prop.properties ?? {}).map(([key, sub]) => [key, schemaOf(sub)]);
}

function isEntityArray(prop: ExtendedJSONSchema): boolean {
	return prop.type === "array" && itemsOf(prop).type === "string" && prop.domain !== undefined;
}

function isStringArray(prop: ExtendedJSONSchema): boolean {
	return prop.type === "array" && itemsOf(prop).type === "string";
}

function recordOf(value: unknown): Record<string, unknown> {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

/** Property defaults declared on the wire (`default`), plus `const` seeds
 * (a variant branch's discriminator literal serializes as `const`). */
function propertyDefaults(branch: ExtendedJSONSchema): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, sub] of propertiesOf(branch)) {
		if (sub.const !== undefined) out[key] = structuredClone(sub.const);
		else if (sub.default !== undefined) out[key] = structuredClone(sub.default);
	}
	return out;
}

/**
 * New-item defaults from the wire schema: the serialized `default` when the
 * SDK provided one (field.variants always does), else property defaults; for
 * a variants item without a default, the first branch seeded by its
 * discriminator const.
 */
export function extractItemDefaults(schema: ExtendedJSONSchema): Record<string, unknown> {
	if (schema.default !== undefined) return recordOf(structuredClone(schema.default));
	const branches = variantBranches(schema);
	const first = branches[0];
	if (first) return propertyDefaults(first);
	return propertyDefaults(schema);
}

function variantBranches(schema: ExtendedJSONSchema): ExtendedJSONSchema[] {
	const raw = schema.oneOf ?? schema.anyOf ?? [];
	return raw.map(schemaOf).filter((b) => b.properties !== undefined);
}

function branchKind(branch: ExtendedJSONSchema, discriminator: string): string {
	const disc = schemaOf(branch.properties?.[discriminator]);
	return typeof disc.const === "string" ? disc.const : "";
}

/**
 * Switching kind keeps current values for keys the new branch also declares
 * (matched by name) and drops the rest; missing keys take the branch defaults.
 */
export function switchVariantValue(
	branch: ExtendedJSONSchema,
	discriminator: string,
	kind: string,
	current: Record<string, unknown>,
): Record<string, unknown> {
	const next = propertyDefaults(branch);
	for (const [key] of propertiesOf(branch)) {
		if (key === discriminator) continue;
		if (key in current && current[key] !== undefined) next[key] = current[key];
	}
	next[discriminator] = kind;
	return next;
}

interface SchemaFormProps {
	schema: JSONSchema7;
	data: Record<string, unknown>;
	onChange: (data: Record<string, unknown>) => void;
	errors?: string[];
	/** Passed through to IconPicker for formType: "icon-picker" fields. */
	searchIcons?: IconPickerProps["searchIcons"];
	class?: string;
}

export function SchemaForm(props: SchemaFormProps) {
	const properties = () => {
		const schema = props.schema;
		if (schema.type !== "object" || !schema.properties) return [];
		return propertiesOf(schema as ExtendedJSONSchema);
	};

	// Controlled: props.data is the single source of truth, so parent-driven
	// revert/reset/widget-switch reaches the visible form (audit finding #33).
	const updateField = (key: string, value: unknown) => {
		props.onChange({ ...props.data, [key]: value });
	};

	return (
		<div class={cn("w-full min-w-0 space-y-5", props.class)} data-slot="schema-form">
			<For each={properties()}>
				{([key, prop]) => (
					<LabeledField
						id={key}
						name={key}
						prop={prop}
						value={props.data[key]}
						onChange={(value) => updateField(key, value)}
						searchIcons={props.searchIcons}
					/>
				)}
			</For>

			<Show when={props.errors && props.errors.length > 0}>
				<div class="rounded border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
					<p class="mb-2 font-semibold">Validation errors:</p>
					<ul class="list-inside list-disc space-y-1">
						<For each={props.errors}>{(err) => <li>{err}</li>}</For>
					</ul>
				</div>
			</Show>
		</div>
	);
}

interface FieldProps {
	/** Unique control id (dot-path for nested fields). */
	id: string;
	/** Property key: label fallback and the legacy areaId heuristic. */
	name: string;
	prop: ExtendedJSONSchema;
	value: unknown;
	onChange: (value: unknown) => void;
	searchIcons?: IconPickerProps["searchIcons"];
}

function LabeledField(props: FieldProps) {
	return (
		<div class="flex flex-col gap-1.5" data-slot="schema-form-field">
			<Label for={props.id}>{props.prop.title || props.name}</Label>
			<Show when={props.prop.description}>
				<p class="text-muted-foreground text-xs">{props.prop.description}</p>
			</Show>
			<FieldControl {...props} />
		</div>
	);
}

/** The one recursive dispatch: every nesting level renders through here. */
function FieldControl(props: FieldProps) {
	const current = () => props.value ?? props.prop.default;
	return (
		<SwitchFlow
			fallback={
				<Input
					id={props.id}
					type="text"
					value={String(current() ?? "")}
					onInput={(e) => props.onChange(e.currentTarget.value)}
				/>
			}
		>
			<Match when={!isKnownFormType(props.prop)}>
				<Alert tone="info" data-slot="schema-form-unknown">
					This setting needs a newer dashboard version to be edited here.
				</Alert>
			</Match>
			<Match when={props.prop.formType === "list"}>
				<ListControl {...props} />
			</Match>
			<Match when={props.prop.formType === "variants"}>
				<VariantsControl {...props} />
			</Match>
			<Match when={isEntityArray(props.prop)}>
				<EntitySelector
					entityIds={(current() as string[]) ?? []}
					onEntityIdsChange={(ids) => props.onChange(ids)}
					domain={props.prop.domain ?? ""}
					deviceClass={props.prop.deviceClass}
					multiple={props.prop.singleSelect !== true}
				/>
			</Match>
			<Match when={props.prop.formType === "icon-picker"}>
				<IconPicker
					value={String(current() ?? "")}
					onChange={(val) => props.onChange(val)}
					searchIcons={props.searchIcons}
				/>
			</Match>
			<Match
				when={props.prop.formType === "area-picker" || isLegacyAreaKey(props.name, props.prop)}
			>
				<AreaPicker value={String(current() ?? "")} onChange={(val) => props.onChange(val)} />
			</Match>
			<Match when={props.prop.enum}>
				<Select
					value={String(current() ?? "")}
					onChange={(val) => {
						if (val != null) props.onChange(val);
					}}
					options={(props.prop.enum ?? []).map(String)}
					itemComponent={(itemProps) => (
						<SelectItem item={itemProps.item}>{String(itemProps.item.rawValue)}</SelectItem>
					)}
				>
					<SelectTrigger class="w-full">
						<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</Match>
			<Match when={props.prop.type === "boolean"}>
				<div class="flex items-center gap-3">
					<Switch
						checked={Boolean(current() ?? false)}
						onChange={(checked) => props.onChange(checked)}
					/>
					<span class="text-sm">{current() ? "Enabled" : "Disabled"}</span>
				</div>
			</Match>
			<Match when={props.prop.type === "number" || props.prop.type === "integer"}>
				<NumberField
					id={props.id}
					value={Number(current() ?? 0)}
					min={props.prop.minimum}
					max={props.prop.maximum}
					step={props.prop.type === "integer" ? 1 : "any"}
					onInput={(e) => props.onChange(Number(e.currentTarget.value))}
				/>
			</Match>
			<Match when={isStringArray(props.prop)}>
				<StringListField
					value={(current() as string[]) ?? []}
					onChange={(val) => props.onChange(val)}
				/>
			</Match>
			<Match when={props.prop.type === "object" && props.prop.properties}>
				<div
					class="flex flex-col gap-3 rounded-lg border border-border p-3"
					data-slot="schema-form-object"
				>
					<For each={propertiesOf(props.prop)}>
						{([subKey, subProp]) => (
							<LabeledField
								id={`${props.id}.${subKey}`}
								name={subKey}
								prop={subProp}
								value={recordOf(current())[subKey]}
								onChange={(value) => props.onChange({ ...recordOf(current()), [subKey]: value })}
								searchIcons={props.searchIcons}
							/>
						)}
					</For>
				</div>
			</Match>
		</SwitchFlow>
	);
}

function ListControl(props: FieldProps) {
	const itemSchema = () => itemsOf(props.prop);
	const items = () => {
		const value = props.value ?? props.prop.default;
		return Array.isArray(value) ? (value as unknown[]) : [];
	};
	const minItems = () => props.prop.minItems ?? 0;
	const atMax = () => props.prop.maxItems !== undefined && items().length >= props.prop.maxItems;
	const [openIndex, setOpenIndex] = createSignal(-1);

	const kindLabel = (item: unknown) => {
		const schema = itemSchema();
		if (schema.formType !== "variants" || schema.discriminator === undefined) return undefined;
		const kind = recordOf(item)[schema.discriminator];
		if (typeof kind !== "string") return undefined;
		return schema.labels?.[kind] ?? kind;
	};

	// The kind badge carries the variant label, so the caption never repeats it:
	// labelField value, else "Item N".
	const caption = (item: unknown, index: number) => {
		const record = recordOf(item);
		const labelField = props.prop.labelField;
		if (labelField !== undefined) {
			const value = record[labelField];
			if (typeof value === "string" && value.trim() !== "") return value;
			if (typeof value === "number") return String(value);
		}
		return `Item ${index + 1}`;
	};

	const replaceAt = (index: number, value: unknown) => {
		props.onChange(items().map((item, i) => (i === index ? value : item)));
	};
	const removeAt = (index: number) => {
		props.onChange(items().filter((_, i) => i !== index));
		if (openIndex() === index) setOpenIndex(-1);
		else if (openIndex() > index) setOpenIndex(openIndex() - 1);
	};
	const reorder = (from: number, to: number) => {
		if (to === from || to < 0 || to >= items().length) return;
		const next = [...items()];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		props.onChange(next);
		const open = openIndex();
		if (open === from) setOpenIndex(to);
		else if (open !== -1) {
			if (from < open && to >= open) setOpenIndex(open - 1);
			else if (from > open && to <= open) setOpenIndex(open + 1);
		}
	};

	// gapPx mirrors the container's gap-2 so the drop slot reads visually.
	const listDrag = createListReorder({
		count: () => items().length,
		gapPx: 8,
		onReorder: reorder,
		onDragStart: (index) => {
			if (openIndex() === index) setOpenIndex(-1);
		},
	});
	const add = () => {
		const next = [...items(), extractItemDefaults(itemSchema())];
		props.onChange(next);
		setOpenIndex(next.length - 1);
	};

	return (
		<div class="flex w-full min-w-0 flex-col gap-2" data-slot="schema-form-list">
			<Index each={items()}>
				{(item, index) => (
					<Card
						ref={(el: HTMLElement) => listDrag.setRowEl(index, el)}
						class={cn(
							"w-full min-w-0 overflow-hidden transition-transform duration-(--duration-state)",
							listDrag.draggingIndex() === index && "relative shadow-lg",
						)}
						style={listDrag.rowStyle(index)}
						data-slot="schema-form-list-item"
					>
						<Collapsible
							open={openIndex() === index}
							onOpenChange={(open) => {
								if (listDrag.isToggleSuppressed()) return;
								setOpenIndex(open ? index : -1);
							}}
						>
							<div
								class={cn(
									"relative flex min-h-11 select-none items-center gap-0.5 py-1 pr-1.5 pl-2",
									"transition-colors duration-(--duration-micro) hover:bg-muted/40",
								)}
								onPointerDown={(e: PointerEvent) => {
									const btn = (e.target as HTMLElement).closest("button");
									if (btn && btn.dataset.slot !== "collapsible-trigger") return;
									listDrag.startDrag(index, e, false);
								}}
							>
								{/* Invisible layer over the whole bar: clicking anywhere toggles;
								    the action buttons sit above it and win their own clicks. */}
								<CollapsibleTrigger
									class="absolute inset-0 rounded-[inherit] py-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
									aria-label={caption(item(), index)}
								/>
								<Icon
									icon="lucide:chevron-right"
									width={16}
									height={16}
									class={cn(
										"pointer-events-none relative shrink-0 text-muted-foreground transition-transform duration-(--duration-state)",
										openIndex() === index && "rotate-90",
									)}
									aria-hidden="true"
								/>
								<span class="pointer-events-none relative ml-2 min-w-0 flex-1 truncate text-left text-sm">
									{caption(item(), index)}
								</span>
								<Show when={kindLabel(item())}>
									{(label) => (
										<Badge class="pointer-events-none relative mr-1 shrink-0">{label()}</Badge>
									)}
								</Show>
								<Button
									variant="ghost"
									size="icon"
									class="relative cursor-grab touch-none active:cursor-grabbing"
									aria-label={`Reorder ${caption(item(), index)}`}
									onPointerDown={(e: PointerEvent) => listDrag.startDrag(index, e, true)}
									onKeyDown={(e: KeyboardEvent) => {
										if (e.key === "ArrowUp") {
											e.preventDefault();
											reorder(index, index - 1);
										} else if (e.key === "ArrowDown") {
											e.preventDefault();
											reorder(index, index + 1);
										}
									}}
								>
									<Icon icon="lucide:grip-vertical" width={16} height={16} aria-hidden="true" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="relative"
									aria-label={`Remove ${caption(item(), index)}`}
									disabled={items().length <= minItems()}
									onClick={() => removeAt(index)}
								>
									<Icon icon="lucide:x" width={16} height={16} aria-hidden="true" />
								</Button>
							</div>
							<CollapsibleContent>
								<div class="border-border border-t p-3">
									<LabeledField
										id={`${props.id}.${index}`}
										name={props.name}
										prop={itemSchema()}
										value={item()}
										onChange={(value) => replaceAt(index, value)}
										searchIcons={props.searchIcons}
									/>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</Card>
				)}
			</Index>
			<Show when={items().length < minItems()}>
				<p class="text-muted-foreground text-xs">
					Add at least {minItems()} {minItems() === 1 ? "item" : "items"}.
				</p>
			</Show>
			<Button
				variant="outline"
				class="self-start"
				disabled={atMax()}
				onClick={add}
				data-slot="schema-form-list-add"
			>
				<Icon icon="lucide:plus" width={16} height={16} aria-hidden="true" />
				{props.prop.addLabel ?? "Add item"}
			</Button>
		</div>
	);
}

function VariantsControl(props: FieldProps) {
	const branches = () => variantBranches(props.prop);
	const discriminator = () => props.prop.discriminator ?? "";
	const kinds = () => branches().map((b) => branchKind(b, discriminator()));
	const value = () => recordOf(props.value ?? props.prop.default);
	// Memos with default === equality: typing in a field changes value() but not
	// the kind string, so the branch tuples keep their identity and the field
	// subtree is NOT remounted (a remount would drop focus on every keystroke).
	const currentKind = createMemo(() => {
		const kind = value()[discriminator()];
		if (typeof kind === "string" && kinds().includes(kind)) return kind;
		return kinds()[0] ?? "";
	});
	const currentBranch = createMemo(() =>
		branches().find((b) => branchKind(b, discriminator()) === currentKind()),
	);
	const labelFor = (kind: string) => props.prop.labels?.[kind] ?? kind;

	const switchKind = (kind: string) => {
		if (kind === currentKind()) return;
		const branch = branches().find((b) => branchKind(b, discriminator()) === kind);
		if (!branch) return;
		props.onChange(switchVariantValue(branch, discriminator(), kind, value()));
	};

	const branchFields = createMemo(() => {
		const branch = currentBranch();
		if (!branch) return [];
		return propertiesOf(branch).filter(([key]) => key !== discriminator());
	});

	return (
		<div class="flex w-full min-w-0 flex-col gap-3" data-slot="schema-form-variants">
			<Select
				value={currentKind()}
				onChange={(val) => {
					if (val != null) switchKind(val);
				}}
				options={kinds()}
				itemComponent={(itemProps) => (
					<SelectItem item={itemProps.item}>{labelFor(String(itemProps.item.rawValue))}</SelectItem>
				)}
			>
				<SelectTrigger class="w-full" aria-label={props.prop.title}>
					<SelectValue<string>>{(state) => labelFor(state.selectedOption())}</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</Select>
			<Show when={currentKind()} keyed>
				{(_kind) => (
					<div class="fade-in-0 flex animate-in flex-col gap-3 duration-(--duration-state)">
						<For each={branchFields()}>
							{([subKey, subProp]) => (
								<LabeledField
									id={`${props.id}.${subKey}`}
									name={subKey}
									prop={subProp}
									value={value()[subKey]}
									onChange={(fieldValue) => props.onChange({ ...value(), [subKey]: fieldValue })}
									searchIcons={props.searchIcons}
								/>
							)}
						</For>
					</div>
				)}
			</Show>
		</div>
	);
}

function StringListField(props: { value: string[]; onChange: (value: string[]) => void }) {
	const [input, setInput] = createSignal("");

	const addItem = (item: string) => {
		const trimmed = item.trim();
		if (!trimmed || props.value.includes(trimmed)) return;
		props.onChange([...props.value, trimmed]);
		setInput("");
	};

	return (
		<div class="flex flex-col gap-2">
			<Show when={props.value.length > 0}>
				<div class="flex flex-wrap gap-1.5">
					<For each={props.value}>
						{(item) => (
							<span class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-secondary-foreground text-xs">
								{item}
								<button
									type="button"
									aria-label={`Remove ${item}`}
									onClick={() => props.onChange(props.value.filter((v) => v !== item))}
									class="ml-0.5 rounded-sm hover:text-destructive"
								>
									<svg
										class="h-3 w-3"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</span>
						)}
					</For>
				</div>
			</Show>
			<Input
				type="text"
				placeholder="Type and press Enter to add"
				value={input()}
				onInput={(e) => setInput(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						addItem(input());
					}
				}}
			/>
		</div>
	);
}
