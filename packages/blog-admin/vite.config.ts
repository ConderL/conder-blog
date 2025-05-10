import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
// import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { prismjsPlugin } from "vite-plugin-prismjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载.env文件
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      // visualizer({ open: false, gzipSize: true, brotliSize: true }),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
      prismjsPlugin({
        languages: ["java", "python", "go", "html", "json"],
        plugins: ["copy-to-clipboard"],
        theme: "okaidia",
        css: true,
      }),
    ],
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js",
        "@": path.resolve(__dirname, "src"),
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
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 4000, // 警告阈值4000KiB
      sourcemap: false, // 生产环境关闭sourcemap以提高构建速度
      minify: false, // 确保使用可调试的压缩方式
      terserOptions: {
        compress: {
          drop_console: true, // 清除 console 日志
        },
      },
      reportCompressedSize: false, // 禁用压缩大小报告，提高速度
      cssCodeSplit: true, // 拆分CSS代码
      assetsInlineLimit: 4096, // 小于4kb的资源内联
      rollupOptions: {
        treeshake: false, // 临时关闭 tree-shaking
        // output: {
        //   manualChunks(id) {
        //     // 精简版分割策略
        //     if (id.includes("node_modules")) {
        //       // 核心框架合并
        //       if (
        //         id.includes("vue") ||
        //         id.includes("pinia") ||
        //         id.includes("vue-router")
        //       ) {
        //         return "vue-core";
        //       }
        //       // 超大型库单独分块 (>500KB)
        //       if (id.includes("echarts") || id.includes("element-plus")) {
        //         return "heavy-libs";
        //       }
        //       // 其余依赖统一打包
        //       return "vendor";
        //     }
        //   },
        // },
      },
    },
  };
});
