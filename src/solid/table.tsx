import { type Component, type ComponentProps, splitProps } from "solid-js";
import { cn } from "../lib/utils.js";

/* The one cell inset for the real <table> element family (TableHead/TableCell);
 * data-table.tsx's flex-row family paddings its own row and reuses this same
 * class for its header label text. */
export const TABLE_CELL_INSET = "px-3 py-2";
export const TABLE_HEAD_CELL_CLASS = `${TABLE_CELL_INSET} text-left font-medium text-muted-foreground text-xs`;

const Table: Component<ComponentProps<"table">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div data-slot="table-container" class="relative w-full overflow-x-auto">
			<table data-slot="table" class={cn("w-full caption-bottom text-sm", local.class)} {...rest} />
		</div>
	);
};

const TableHeader: Component<ComponentProps<"thead">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <thead data-slot="table-header" class={cn("[&_tr]:border-b", local.class)} {...rest} />;
};

const TableBody: Component<ComponentProps<"tbody">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<tbody data-slot="table-body" class={cn("[&_tr:last-child]:border-0", local.class)} {...rest} />
	);
};

const TableFooter: Component<ComponentProps<"tfoot">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<tfoot
			data-slot="table-footer"
			class={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", local.class)}
			{...rest}
		/>
	);
};

const TableRow: Component<ComponentProps<"tr">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<tr
			data-slot="table-row"
			class={cn(
				"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
				local.class,
			)}
			{...rest}
		/>
	);
};

const TableHead: Component<ComponentProps<"th">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<th
			data-slot="table-head"
			class={cn(
				TABLE_HEAD_CELL_CLASS,
				"h-10 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				local.class,
			)}
			{...rest}
		/>
	);
};

const TableCell: Component<ComponentProps<"td">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<td
			data-slot="table-cell"
			class={cn(
				TABLE_CELL_INSET,
				"whitespace-nowrap align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				local.class,
			)}
			{...rest}
		/>
	);
};

const TableCaption: Component<ComponentProps<"caption">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<caption
			data-slot="table-caption"
			class={cn("mt-4 text-muted-foreground text-sm", local.class)}
			{...rest}
		/>
	);
};

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
