/** Builds `photoFor(id, file)` over a map keyed like "/data/photos/<id>/<file>". */
export function makePhotoLookup<T>(modules: Record<string, T>): (id: string, file: string) => T {
	return (id, file) => {
		const photo = modules[`/data/photos/${id}/${file}`];
		if (photo === undefined) {
			throw new Error(`Missing photo data/photos/${id}/${file}, listed in data/fish/${id}.json`);
		}
		return photo;
	};
}
