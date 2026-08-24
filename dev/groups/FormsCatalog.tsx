import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";
import type { ExtendedJSONSchema } from "../../src/solid";
import {
	Checkbox,
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldSubGroup,
	FieldTitle,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	Label,
	NumberField,
	OptionCard,
	OptionCardGroup,
	RadioGroup,
	RadioGroupItem,
	SchemaForm,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Slider,
	Switch,
	SwitchRow,
	Textarea,
} from "../../src/solid";
import { CatalogGroup, CatalogItem, CatalogNote } from "../CatalogKit";

/* Wire shape the SDK's field.list(field.variants(...)) serializes to. */
const flowNodesSchema: ExtendedJSONSchema = {
	type: "array",
	title: "Flow nodes",
	minItems: 2,
	maxItems: 4,
	formType: "list",
	addLabel: "Add node",
	labelField: "label",
	items: {
		formType: "variants",
		discriminator: "kind",
		title: "Type",
		labels: { input: "Input", output: "Output" },
		default: { kind: "input", weight: 1 },
		oneOf: [
			{
				type: "object",
				properties: {
					kind: { type: "string", const: "input" },
					label: { type: "string", title: "Label" },
					weight: { type: "number", title: "Weight", default: 1 },
				},
			},
			{
				type: "object",
				properties: {
					kind: { type: "string", const: "output" },
					label: { type: "string", title: "Label" },
					remainder: { type: "boolean", title: "Remainder node", default: false },
				},
			},
		],
	} satisfies ExtendedJSONSchema,
};

export function FormsCatalog() {
	const [checked, setChecked] = createSignal(true);
	const [radio, setRadio] = createSignal("comfortable");
	const [door, setDoor] = createSignal<string | null>("invite");
	const [switchOn, setSwitchOn] = createSignal(true);
	const [fieldSwitch, setFieldSwitch] = createSignal(true);
	const [slider, setSlider] = createSignal([60]);
	const [range, setRange] = createSignal([35, 72]);
	const [setpoints, setSetpoints] = createSignal([12, 30]);
	const [boilerTarget, setBoilerTarget] = createSignal([52]);
	const [otp, setOtp] = createSignal("12");
	const [fruit, setFruit] = createSignal<string | null>("Banana");
	const [schemaData, setSchemaData] = createSignal<Record<string, unknown>>({
		name: "Living Room",
		brightness: 80,
		mode: "auto",
		enabled: true,
	});
	const [listData, setListData] = createSignal<Record<string, unknown>>({
		nodes: [
			{ kind: "input", label: "Solar", weight: 2 },
			{ kind: "output", label: "House", remainder: true },
		],
	});

	return (
		<CatalogGroup id="cat-forms" title="Forms & Inputs">
			<CatalogItem name="Input" hint="text field">
				<Input placeholder="you@example.com" />
				<Input value="disabled" disabled />
				<Input aria-invalid="true" value="invalid" />
			</CatalogItem>

			<CatalogItem name="NumberField" hint="themed stepper, no native spinner">
				<NumberField value={3} min={0} max={10} />
				<NumberField value={1.5} step="any" />
			</CatalogItem>

			<CatalogItem name="Textarea" hint="multiline">
				<Textarea placeholder="Write a message..." class="w-full" />
			</CatalogItem>

			<CatalogItem name="Label" hint="control caption">
				<div class="flex flex-col gap-1.5">
					<Label for="lbl-demo">Display name</Label>
					<Input id="lbl-demo" placeholder="Ada Lovelace" />
				</div>
			</CatalogItem>

			<CatalogItem name="Field" hint="Field / FieldSet / FieldGroup …" span={2}>
				<FieldSet class="w-full">
					<FieldLegend>Profile</FieldLegend>
					<FieldGroup>
						<Field>
							<FieldLabel for="fld-name">Name</FieldLabel>
							<Input id="fld-name" placeholder="Ada Lovelace" />
							<FieldDescription>Shown on your public profile.</FieldDescription>
						</Field>
						<FieldSeparator>then</FieldSeparator>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldTitle>Notifications</FieldTitle>
								<FieldDescription>Email me about account activity.</FieldDescription>
							</FieldContent>
							<Switch checked={fieldSwitch()} onChange={setFieldSwitch} />
						</Field>
						<Field data-invalid="true">
							<FieldLabel for="fld-email">Email</FieldLabel>
							<Input id="fld-email" aria-invalid="true" value="not-an-email" />
							<FieldError errors={[{ message: "Enter a valid email address." }]} />
						</Field>
					</FieldGroup>
				</FieldSet>
			</CatalogItem>

			<CatalogItem name="FieldSubGroup" hint="rows owned by the row above" span={2}>
				<FieldSet class="w-full">
					<FieldLegend>Control</FieldLegend>
					<SwitchRow
						label="Can control devices"
						description="Off = can only watch"
						checked={fieldSwitch()}
						onChange={setFieldSwitch}
					/>
					<FieldSubGroup>
						<SwitchRow
							icon="lucide:lock"
							label="Door locks"
							checked={false}
							disabled={!fieldSwitch()}
							onChange={() => {}}
						/>
						<SwitchRow
							icon="lucide:video"
							label="Cameras"
							checked={false}
							disabled={!fieldSwitch()}
							onChange={() => {}}
						/>
						<FieldDescription>Sensitive things stay off until you turn them on.</FieldDescription>
					</FieldSubGroup>
				</FieldSet>
			</CatalogItem>

			<CatalogItem name="InputGroup" hint="addons + buttons" span={2}>
				<InputGroup>
					<InputGroupAddon>
						<Icon icon="lucide:search" width={16} height={16} />
					</InputGroupAddon>
					<InputGroupInput placeholder="Search…" />
					<InputGroupAddon align="inline-end">
						<InputGroupButton>Go</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
				<InputGroup>
					<InputGroupAddon>
						<InputGroupText>https://</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput placeholder="glasshome.app" />
				</InputGroup>
				<CatalogNote>textarea variant, block-end addon</CatalogNote>
				<InputGroup>
					<InputGroupTextarea placeholder="Leave a note…" />
					<InputGroupAddon align="block-end">
						<InputGroupText>0 / 280</InputGroupText>
						<InputGroupButton class="ml-auto">
							Send
							<Icon icon="lucide:arrow-right" width={16} height={16} />
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</CatalogItem>

			<CatalogItem name="InputOTP" hint={`value: "${otp()}"`}>
				<InputOTP maxLength={6} value={otp()} onValueChange={setOtp}>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
			</CatalogItem>

			<CatalogItem name="Checkbox" hint={checked() ? "checked" : "unchecked"}>
				<Checkbox checked={checked()} onChange={setChecked}>
					Accept terms
				</Checkbox>
				<Checkbox disabled>Disabled</Checkbox>
			</CatalogItem>

			<CatalogItem name="RadioGroup" hint={`value: ${radio()}`}>
				<RadioGroup value={radio()} onChange={setRadio}>
					<RadioGroupItem value="default">Default</RadioGroupItem>
					<RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
					<RadioGroupItem value="compact">Compact</RadioGroupItem>
				</RadioGroup>
			</CatalogItem>

			<CatalogItem name="OptionCard" hint={`value: ${door() ?? "none"}`}>
				<OptionCardGroup value={door()} onChange={setDoor} aria-label="How they sign in">
					<OptionCard
						value="invite"
						icon="lucide:mail"
						title="Send an invite"
						description="They set their own password from a link."
					/>
					<OptionCard
						value="code"
						icon="lucide:key-round"
						title="Share a code"
						description="Good for someone standing next to you."
					>
						<Select
							options={["Six digits", "Eight digits"]}
							placeholder="Code length"
							itemComponent={(itemProps) => (
								<SelectItem item={itemProps.item}>{itemProps.item.rawValue}</SelectItem>
							)}
						>
							<SelectTrigger>
								<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
							</SelectTrigger>
							<SelectContent />
						</Select>
					</OptionCard>
					<OptionCard
						value="managed"
						icon="lucide:lock"
						title="Managed elsewhere"
						description="Not available on this home."
						disabled
					/>
				</OptionCardGroup>
			</CatalogItem>

			<CatalogItem name="Switch" hint={switchOn() ? "on" : "off"}>
				<Switch checked={switchOn()} onChange={setSwitchOn} />
				<Switch checked={false} disabled />
			</CatalogItem>

			<CatalogItem name="Slider" hint={`value: ${slider()[0]}`}>
				<Slider value={slider()} onChange={setSlider} min={0} max={100} aria-label="Brightness" />
			</CatalogItem>

			<CatalogItem name="Slider, range" hint={`value: ${range()[0]} to ${range()[1]}`}>
				<Slider
					value={range()}
					onChange={setRange}
					min={0}
					max={100}
					aria-label="Temperature range"
				/>
			</CatalogItem>

			<CatalogItem
				name="Slider, setpoints"
				hint="thumbColors + fillTone pair + markers + minStepsBetweenThumbs"
			>
				<Slider
					value={setpoints()}
					fillTone={["oklch(0.68 0.15 235)", "oklch(0.66 0.19 40)"]}
					onChange={setSetpoints}
					min={7}
					max={35}
					step={0.5}
					minStepsBetweenThumbs={1}
					thumbColors={["oklch(0.68 0.15 235)", "oklch(0.66 0.19 40)"]}
					markers={[21.5]}
					aria-label="Heat and cool setpoints"
				/>
				<CatalogNote>
					Marker is the current reading. Fill stays the glass material; only colors change.
				</CatalogNote>
			</CatalogItem>

			<CatalogItem name="Slider, tinted fill" hint={`fillTone, value: ${boilerTarget()[0]}`}>
				<Slider
					value={boilerTarget()}
					onChange={setBoilerTarget}
					min={43}
					max={60}
					fillTone="oklch(0.66 0.19 40)"
					thumbColors={["oklch(0.66 0.19 40)"]}
					markers={[48]}
					aria-label="Water heater target"
				/>
			</CatalogItem>

			<CatalogItem name="Select" hint={`value: ${fruit()}`}>
				<Select
					value={fruit()}
					onChange={setFruit}
					options={["Apple", "Banana", "Cherry", "Elderberry"]}
					placeholder="Pick a fruit…"
					itemComponent={(itemProps) => (
						<SelectItem item={itemProps.item}>{itemProps.item.rawValue}</SelectItem>
					)}
				>
					<SelectTrigger class="w-[180px]">
						<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</CatalogItem>

			<CatalogItem name="Form" hint="context + error wiring" span={2}>
				<Form class="w-full" errors={{ email: "Email is required." }}>
					<FormField name="email">
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" placeholder="you@example.com" />
							</FormControl>
							<FormDescription>We only use it for account recovery.</FormDescription>
							<FormMessage />
						</FormItem>
					</FormField>
				</Form>
				<CatalogNote>
					Form is headless: errors come from the parent (validation lib) via the `errors` prop; the
					label, control aria-invalid, and message all react to it.
				</CatalogNote>
			</CatalogItem>

			<CatalogItem name="SchemaForm" hint="JSON Schema → controls" span={2}>
				<SchemaForm
					schema={{
						type: "object",
						properties: {
							name: { type: "string", title: "Name", description: "Display name for this scene." },
							brightness: {
								type: "integer",
								title: "Brightness",
								minimum: 0,
								maximum: 100,
							},
							mode: { type: "string", title: "Mode", enum: ["auto", "manual", "off"] },
							enabled: { type: "boolean", title: "Enabled" },
						},
					}}
					data={schemaData()}
					onChange={setSchemaData}
				/>
				<CatalogNote>
					Renders inputs from a JSON Schema (string → Input, integer → number, enum → Select,
					boolean → Switch). Entity/area branches need HA context, so they are omitted here.
				</CatalogNote>
			</CatalogItem>

			<CatalogItem name="SchemaForm: list + variants" hint="array of union items" span={2}>
				<SchemaForm
					schema={{ type: "object", properties: { nodes: flowNodesSchema } }}
					data={listData()}
					onChange={setListData}
				/>
				<CatalogNote>
					formType "list": card per item, captioned by labelField (fallback: variant label, then
					Item N), reorder/remove, add appends item defaults and disables at maxItems. formType
					"variants": Select over the discriminator; switching kind keeps same-named values. Unknown
					formTypes render a read-only "needs a newer dashboard" notice.
				</CatalogNote>
			</CatalogItem>
		</CatalogGroup>
	);
}
