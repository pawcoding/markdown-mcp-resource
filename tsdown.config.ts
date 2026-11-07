import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "node",
  target: "node24",
  format: "esm",
  outDir: "dist",
  minify: true,
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
  deps: {
    onlyBundle: false
  }
});
