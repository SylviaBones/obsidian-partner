
import esbuild from "esbuild";

const prod = process.argv.includes("--prod");

esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  platform: "node",
  target: "es2018",
  sourcemap: !prod,
  minify: prod,
  external: [
    "obsidian",
    "@codemirror/state",
    "@codemirror/view",
    "@codemirror/language",
  ],
  format: "cjs",
  logLevel: "info",
}).catch(() => process.exit(1));