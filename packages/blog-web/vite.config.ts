import dayjs from "dayjs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import { createViteProxy, setupVitePlugins } from "./build";

export default defineConfig((configEnv) => {
	const viteEnv = loadEnv(configEnv.mode, process.cwd()) as Env.ImportMeta;

	console.log("=== Vite Environment ===");
	console.log("Mode:", configEnv.mode);
	console.log("Environment Variables:", viteEnv);

	const buildTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

	return {
		base: viteEnv.VITE_BASE_URL,
		resolve: {
			alias: {
				"~": fileURLToPath(new URL("./", import.meta.url)),
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		define: {
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
			BUILD_TIME: JSON.stringify(buildTime),
		},
		plugins: setupVitePlugins(viteEnv),
		server: {
			host: "0.0.0.0",
			port: 3333,
			open: true,
			proxy: {
				...createViteProxy(viteEnv),
				"/api": {
					target: "http://localhost:3300",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
					//忽略警告提示
					silenceDeprecations: ["legacy-js-api", "import"],
				},
			},
		},
		build: {
			reportCompressedSize: false,
			minify: "esbuild",
			sourcemap: false,
			outDir: viteEnv.VITE_DIST_NAME,
			commonjsOptions: {
				ignoreTryCatch: false,
			},
			rollupOptions: {
				external: [
					"APlayer",
					"APlayer/dist/APlayer.min.css",
					"APlayer/dist/APlayer.min.js",
				],
				output: {
					globals: {
						APlayer: "APlayer",
						"APlayer/dist/APlayer.min.css": "APlayer",
						"APlayer/dist/APlayer.min.js": "APlayer",
					},
				},
			},
		},
	};
});
