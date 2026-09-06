// Very basic build placeholder
// For real use, copy a proper build setup from an existing Vendetta/Revenge plugin template.

import { mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const pluginName = "LocalBadges";
const srcDir = join("plugins", pluginName);
const distDir = join("dist", pluginName);

mkdirSync(distDir, { recursive: true });

// Copy manifest
copyFileSync(join(srcDir, "manifest.json"), join(distDir, "manifest.json"));

// For a real build you would bundle the TypeScript.
// Here we just copy the source as a starting point.
if (existsSync(join(srcDir, "src", "index.ts"))) {
  // In a real template this would be compiled to index.js
  console.log("Remember: you need a proper build system (esbuild/rollup) to compile TypeScript.");
  console.log("Copy a working build.mjs from another Revenge plugin repository.");
}

console.log("Basic structure ready. Use a proper plugin template for building.");
