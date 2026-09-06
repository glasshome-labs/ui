import "iconify-icon";
import type { IconifyIconProperties } from "iconify-icon";
import type { JSX } from "solid-js";

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			"iconify-icon": HTMLAttributes<HTMLElement> &
				IconifyIconProperties & { rotate?: string | number };
		}
	}
}

export type IconProps = JSX.IntrinsicElements["iconify-icon"];

/* The host-registered <iconify-icon> element. Kept off the barrel: see the
 * import-order note in index.ts. */
export function Icon(props: IconProps) {
	return <iconify-icon {...props} />;
}
