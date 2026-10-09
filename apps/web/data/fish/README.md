# Fish data

One file per fish. The filename is the fish's id and URL:
`clown-anemonefish.json` → `/fish/clown-anemonefish/`.

- Filenames: lowercase, words joined by `-`, ending in `.json`.
- Do not add an `id` field — the filename is the id.
- Required fields and allowed values are defined in `src/content.config.ts`;
  the build fails if a file is missing a field or has an invalid value.
