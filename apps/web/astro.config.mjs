// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	vite: { plugins: [tailwindcss()] },
	// Downloaded at build time and served from this site; visitors never contact Google.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Bricolage Grotesque',
			cssVariable: '--astro-font-bricolage',
			weights: ['400 800'],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Permanent Marker',
			cssVariable: '--astro-font-marker',
			weights: [400],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['cursive'],
		},
	],
});
