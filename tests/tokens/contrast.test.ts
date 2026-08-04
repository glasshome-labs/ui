/* WCAG floors for the semantic roles, read straight out of styles/theme.css (the
 * palette's source of truth; check-tokens.ts keeps presets.ts equal to it).
 *
 * These roles are one value per role used as BOTH a fill and as text — consumers
 * render money in --success and failures in --destructive — so each has to clear
 * 4.5:1 against every ground it lands on. --ring is a focus indicator, so 3:1.
 * The dark theme has always cleared this; the light theme did not until the
 * values were relit against its L=0.975 ground. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { oklchToHex } from "../../src/tokens/hex.js";

const css = readFileSync(
	path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../src/styles/theme.css"),
	"utf8",
);

function themeVars(block: string): Record<string, string> {
	const match = css.match(new RegExp(`${block}\\s*\\{([^}]*)\\}`));
	if (!match) throw new Error(`block not found in theme.css: ${block}`);
	const vars: Record<string, string> = {};
	for (const line of (match[1] ?? "").split("\n")) {
		const m = line.match(/^\s*(--[\w-]+):\s*(oklch\([^)]*\));\s*$/);
		const [, name, value] = m ?? [];
		if (name && value) vars[name] = value;
	}
	return vars;
}

/** Throws rather than silently comparing `undefined`, which reads as pure white. */
function role(vars: Record<string, string>, name: string): string {
	const value = vars[name];
	if (!value) throw new Error(`theme.css does not declare ${name} as a literal oklch()`);
	return value;
}

function luminance(oklch: string): number {
	const hex = oklchToHex(oklch);
	const [r, g, b] = [1, 3, 5]
		.map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
		number,
		number,
		number,
	];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [x, y] = [luminance(a), luminance(b)];
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const TEXT_FLOOR = 4.5;
const INDICATOR_FLOOR = 3;

describe.each([
	["light", ":root"],
	["dark", ".dark"],
])("%s theme semantic roles", (_mode, block) => {
	const vars = themeVars(block);
	const grounds = ["--background", "--card", "--popover", "--muted"] as const;

	it.each([
		"--success",
		"--warning",
		"--destructive",
		"--muted-foreground",
	])("%s reads as text on every ground", (name) => {
		for (const ground of grounds) {
			expect(
				contrast(role(vars, name), role(vars, ground)),
				`${name} on ${ground}`,
			).toBeGreaterThanOrEqual(TEXT_FLOOR);
		}
	});

	it("--ring clears the focus-indicator floor", () => {
		for (const ground of grounds) {
			expect(
				contrast(role(vars, "--ring"), role(vars, ground)),
				`--ring on ${ground}`,
			).toBeGreaterThanOrEqual(INDICATOR_FLOOR);
		}
	});
});

/* Light only: --destructive is also worn as a filled surface with
 * --destructive-foreground (white) on it. The dark theme's destructive is a
 * high-lightness red that white cannot sit on (2.8:1); nothing in this package
 * pairs them that way (the destructive Button is a tinted glass pill with
 * glassToneText), so that pairing is a consumer's own call there. */
it("white sits on the light-theme destructive fill", () => {
	const vars = themeVars(":root");
	expect(
		contrast(role(vars, "--destructive-foreground"), role(vars, "--destructive")),
	).toBeGreaterThanOrEqual(TEXT_FLOOR);
});
