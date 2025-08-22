import esbuild from "esbuild";
import fs from "node:fs";

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node22",
    outfile: "./dist/index.js",
    format: "esm",
    external: ["@modelcontextprotocol/sdk"],
    banner: {
      js: "#!/usr/bin/env node"
    },
    minify: true,
    sourcemap: false
  })
  .then(() => {
    fs.chmodSync("./dist/index.js", "755");
    console.log("Build completed successfully.");
  })
  .catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
