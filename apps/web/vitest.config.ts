import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Build checks read dist/ and run via `pnpm test:build`.
		exclude: [...configDefaults.exclude, 'tests/build/**'],
	},
});
