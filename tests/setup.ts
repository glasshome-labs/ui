// iconify-icon fetches any icon it does not already hold from the Iconify API,
// so rendering a component in a test reaches the network. Those requests are
// still in flight when vitest tears the window down, and happy-dom aborting
// them surfaces as an unhandled DOMException that fails the run even though
// every test passed. Answer them here instead: a component library's tests
// have no business depending on api.iconify.design being up.
const realFetch = globalThis.fetch;

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input instanceof Request ? input.url : input);
	if (url.includes("iconify")) {
		return Promise.resolve(new Response("", { status: 404 }));
	}
	return realFetch(input as RequestInfo, init);
}) as typeof fetch;
