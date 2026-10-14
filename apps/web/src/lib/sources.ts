/** A short label for a source link: its host (without "www.") and whether it is a PDF. */
export function sourceLabel(url: string): { host: string; pdf: boolean } {
	const { hostname, pathname } = new URL(url);
	return { host: hostname.replace(/^www\./, ''), pdf: /\.pdf$/i.test(pathname) };
}
