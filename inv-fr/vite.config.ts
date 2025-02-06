import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
    server:{
        allowedHosts: [import.meta.env.ALLOWED_HOST as string],
        warmup: {
            clientFiles: ["./src/components/*.vue", "./src/views/*.vue"],
        },
    }
});
