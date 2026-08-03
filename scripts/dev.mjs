// scripts/dev.mjs
import esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "../main.js",
  platform: "node",
  target: "es2018",
  external: [
    "obsidian",
    "@codemirror/state",
    "@codemirror/view",
    "@codemirror/language"
  ],
  format: "cjs",
  sourcemap: true,
  watch: true
});

await context.watch();
console.log("Watching...");