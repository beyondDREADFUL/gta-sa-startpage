import { defineConfig, type Plugin } from "vite";
import preact from "@preact/preset-vite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Copies extension/manifest.json (with the package.json version) and the icons into the build
function extensionManifest(): Plugin {
  const extensionDir = resolve("extension");
  return {
    name: "extension-manifest",
    generateBundle() {
      const { version } = JSON.parse(readFileSync("package.json", "utf-8"));
      const manifest = readFileSync(resolve(extensionDir, "manifest.json"), "utf-8");
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: manifest.replace("__VERSION__", version),
      });
      for (const icon of readdirSync(resolve(extensionDir, "icons"))) {
        this.emitFile({
          type: "asset",
          fileName: `icons/${icon}`,
          source: readFileSync(resolve(extensionDir, "icons", icon)),
        });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isExtension = mode === "extension";
  return {
    plugins: [preact(), isExtension && extensionManifest()],
    base: isExtension ? "./" : "/gta-sa-startpage/",
    build: {
      outDir: isExtension ? "dist-extension" : "dist",
    },
  };
});
