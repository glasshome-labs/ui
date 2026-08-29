import { NEUTRAL_KNOBS } from "./glass-tone.js";
import { CHIP } from "./pill-classes.js";

export const BADGE_DEFAULT_TONE = "var(--primary)";

/** @deprecated CHIP from lib/pill-classes.ts */
export const BADGE_TONE_CLASS = CHIP;

/* The neutral chip also drops the tint sheen: at chip size it reads as a
 * milky cap over the text. */
export const BADGE_NEUTRAL_KNOBS = `${NEUTRAL_KNOBS} [--glass-light:0.08]`;
