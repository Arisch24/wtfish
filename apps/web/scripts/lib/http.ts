export const HEADERS = { 'User-Agent': 'wtfish-data-import/0.1', Accept: 'application/json' };
export type Fetcher = typeof fetch;

export async function getJson<T>(url: string, fetcher: Fetcher = fetch): Promise<T> {
	const response = await fetcher(url, { headers: HEADERS, signal: AbortSignal.timeout(30_000) });
	if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${url}`);
	return response.json() as Promise<T>;
}
