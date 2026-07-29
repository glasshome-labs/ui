import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { Button } from "./button.js";
import { IconPicker, type IconPickerProps } from "./icon-picker.js";
import { Input } from "./input.js";
import { Switch } from "./switch.js";

/**
 * Generic settings/list row primitives, shared by dash settings and any list UI.
 * Presentational only — no app data or routing.
 */

export function SectionAddButton(props: { onClick: () => void }) {
	return (
		<Button variant="outline" size="sm" onClick={props.onClick}>
			<Icon icon="lucide:plus" width={14} height={14} />
			Add
		</Button>
	);
}

export function SectionEmpty(props: { children: JSX.Element }) {
	return <p class="py-4 text-center text-muted-foreground text-sm">{props.children}</p>;
}

export function RowActions(props: {
	onEdit: () => void;
	onDelete: () => void;
	deleteDisabled?: boolean;
	deleteTitle?: string;
	showDelete?: boolean;
}) {
	return (
		<div class="flex items-center gap-1">
			<Button variant="ghost" size="icon" class="size-8" onClick={props.onEdit}>
				<Icon icon="lucide:pencil" width={14} height={14} />
			</Button>
			<Show when={props.showDelete ?? true}>
				<Button
					variant="ghost"
					size="icon"
					class="size-8 text-destructive hover:text-destructive"
					onClick={props.onDelete}
					disabled={props.deleteDisabled}
					title={props.deleteTitle}
				>
					<Icon icon="lucide:trash-2" width={14} height={14} />
				</Button>
			</Show>
		</div>
	);
}

export function LabeledField(props: { label: string; children: JSX.Element }) {
	return (
		<div>
			<p class="mb-1 font-medium text-sm">{props.label}</p>
			{props.children}
		</div>
	);
}

export function LabeledIconPicker(props: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	searchIcons?: IconPickerProps["searchIcons"];
}) {
	return (
		<LabeledField label={props.label}>
			<IconPicker
				value={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
				searchIcons={props.searchIcons}
			/>
		</LabeledField>
	);
}

export function LabeledInput(props: {
	label: string;
	value: string;
	onInput: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<LabeledField label={props.label}>
			<Input
				value={props.value}
				onInput={(e) => props.onInput(e.currentTarget.value)}
				placeholder={props.placeholder}
			/>
		</LabeledField>
	);
}

export function SwitchRow(props: {
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<div class="flex items-center justify-between py-2">
			<p class="font-medium text-sm">{props.label}</p>
			<Switch checked={props.checked} onChange={props.onChange} />
		</div>
	);
}
