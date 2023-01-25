import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: process.env.API_URL || 'http://127.0.0.1:3000',
				changeOrigin: true
			}
		}
	}
};

export default config;
