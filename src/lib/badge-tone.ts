import { NEUTRAL_KNOBS } from "./glass-tone.js";

export const BADGE_DEFAULT_TONE = "var(--primary)";

/* The neutral chip also drops the tint sheen: at chip size it reads as a
 * milky cap over the text. */
export const BADGE_NEUTRAL_KNOBS = `${NEUTRAL_KNOBS} [--glass-light:0.08]`;
