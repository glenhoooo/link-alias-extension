import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

function copyManifest() {
  return {
    name: "copy-manifest",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");

      const manifestPath = resolve(__dirname, "public/manifest.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

      // 关键：与输出路径保持一致
      manifest.background.service_worker = "assets/sw.js";
      manifest.action.default_popup = "pages/popup/index.html";
      manifest.options_page = "pages/options/index.html";

      writeFileSync(
        resolve(distDir, "manifest.json"),
        JSON.stringify(manifest, null, 2),
        "utf-8"
      );
      copyFileSync(
        resolve(__dirname, "public/styles.css"),
        resolve(distDir, "styles.css")
      );
    },
  };
}

export default defineConfig({
  // 关键：把 Vite 的 root 指到 src，这样 html 输出不再带 dist/src/...
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "public"),
  base: "./",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/pages/popup/index.html"),
        options: resolve(__dirname, "src/pages/options/index.html"),
        resolve: resolve(__dirname, "src/pages/resolve/index.html"),
        sw: resolve(__dirname, "src/background/sw.ts"),
      },
      output: {
        // 关键：把 html 生成到 pages/**（通过重写 entryFileNames 无法改 html 路径，
        // 但 root=src 后，html 会在 dist/pages/**）
        entryFileNames: (chunk) =>
          chunk.name === "sw" ? "assets/sw.js" : "assets/[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  plugins: [copyManifest()],
});
