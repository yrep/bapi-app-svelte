import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { copy } from 'vite-plugin-copy';
import { resolve } from 'path';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson(),
		copy({
			patterns: [
				{
					src: resolve(__dirname, 'node_modules/@shoelace-style/shoelace/dist/assets'),
					dest: resolve(__dirname, 'static/shoelace')
				}
			]
		}),
	commonjs()],
	optimizeDeps: {
		include: ['@shoelace-style/shoelace'],
		//exclude: ['sqlite3']
	},
	ssr: {
		//noExternal: ['sqlite3']
	},
	resolve: {
		alias: {
		//'@shoelace-style/shoelace': '/node_modules/@shoelace-style/shoelace/dist',
		//'qr-creator': resolve('./src/lib/stubs/qr-creator.js')
		}
	},
	build: {
		sourcemap: true  // ← Важно для DevTools
	}
});
