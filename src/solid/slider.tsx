import { Slider as KSlider } from "@kobalte/core/slider";
import type { Component } from "solid-js";
import { Index, splitProps } from "solid-js";
import { INPUT_SURFACE } from "../lib/input-classes.js";
import { cn } from "../lib/utils.js";

const THUMB_SIZE = 28;
const HALF_THUMB = THUMB_SIZE / 2;

interface SliderProps {
	value?: number[];
	defaultValue?: number[];
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	onChange?: (values: number[]) => void;
	onChangeEnd?: (values: number[]) => void;
	class?: string;
	trackClass?: string;
	thumbClass?: string;
	/** Per-thumb background color, index-matched to value[]. Color only; the thumb keeps its material. */
	thumbColors?: string[];
	/**
	 * Fill tint. A single color swaps --glass-tone; a pair runs a horizontal
	 * two-tone wash via the glass tone-2 knobs. The fill stays the one glass
	 * material either way.
	 */
	fillTone?: string | [string, string];
	/** Value-positioned tick annotations on the track (e.g. a current-temperature reading). */
	markers?: number[];
	minStepsBetweenThumbs?: number;
	"aria-label"?: string;
	"aria-labelledby"?: string;
}

const Slider: Component<SliderProps> = (props) => {
	const [local] = splitProps(props, [
		"value",
		"defaultValue",
		"min",
		"max",
		"step",
		"disabled",
		"onChange",
		"onChangeEnd",
		"class",
		"trackClass",
		"thumbClass",
		"thumbColors",
		"fillTone",
		"markers",
		"minStepsBetweenThumbs",
		"aria-label",
		"aria-labelledby",
	]);

	const markerPct = (v: number) => {
		const min = local.min ?? 0;
		const max = local.max ?? 100;
		return max === min ? 0 : ((v - min) / (max - min)) * 100;
	};

	return (
		<KSlider
			value={local.value}
			defaultValue={local.defaultValue}
			minValue={local.min ?? 0}
			maxValue={local.max ?? 100}
			step={local.step ?? 1}
			minStepsBetweenThumbs={local.minStepsBetweenThumbs}
			disabled={local.disabled}
			onChange={local.onChange}
			onChangeEnd={local.onChangeEnd}
			class={cn(
				// The rail wears the shared recessed input surface, so the track reads
				// as the same dug-out glass as every Input/Select field.
				"relative flex w-full touch-none select-none items-center rounded-xl",
				INPUT_SURFACE,
				local.disabled && "cursor-not-allowed opacity-50",
				local.class,
			)}
			style={{
				"padding-left": `${HALF_THUMB}px`,
				"padding-right": `${HALF_THUMB}px`,
			}}
		>
			<KSlider.Track
				class={cn("relative w-full", local.trackClass)}
				style={{
					height: `${THUMB_SIZE}px`,
					cursor: local.disabled ? "not-allowed" : "pointer",
				}}
			>
				<KSlider.Fill
					class={cn("glass glass-tint", Array.isArray(local.fillTone) && "glass-edge-gradient")}
					style={{
						position: "absolute",
						top: "0",
						bottom: "0",
						"margin-left": `${-HALF_THUMB}px`,
						"margin-right": `${-HALF_THUMB}px`,
						"border-radius": "var(--radius-xl)",
						// The fill sits sunk inside the recessed rail: the tinted-surface
						// outer drop shadow would read as a halo leaking out of the groove.
						"--glass-drop": "0%",
						...(Array.isArray(local.fillTone)
							? {
									"--glass-tone": local.fillTone[0],
									"--glass-tone-2": local.fillTone[1],
									"--glass-wash-2": "var(--glass-wash)",
									"--glass-wash-angle": "90deg",
								}
							: { "--glass-tone": local.fillTone ?? "var(--primary)" }),
					}}
				/>
				<Index each={local.markers ?? []}>
					{(marker) => (
						<span
							data-slot="slider-marker"
							class="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
							style={{
								left: `${markerPct(marker())}%`,
								background: "color-mix(in oklab, var(--foreground) 60%, transparent)",
							}}
						/>
					)}
				</Index>
				<Index each={local.value ?? local.defaultValue ?? [0]}>
					{(_, thumbIndex) => (
						<KSlider.Thumb
							class={cn(
								"absolute top-0 block rounded-xl transition-transform duration-200 ease-out hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-110",
								local.disabled && "cursor-not-allowed",
								local.thumbClass,
							)}
							aria-label={local["aria-label"]}
							aria-labelledby={local["aria-labelledby"]}
							style={{
								width: `${THUMB_SIZE}px`,
								height: `${THUMB_SIZE}px`,
								background: local.thumbColors?.[thumbIndex] ?? "var(--primary)",
								"box-shadow":
									"0 2px 5px oklch(0 0 0 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.35), inset 0 -2px 3px oklch(0 0 0 / 0.2)",
							}}
						>
							<KSlider.Input />
						</KSlider.Thumb>
					)}
				</Index>
			</KSlider.Track>
		</KSlider>
	);
};

export { Slider };
