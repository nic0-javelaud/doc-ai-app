import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			"@/*": "./src/lib/*",
		}, 
		adapter: adapter() 
	}
};

export default config;
