import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

// Build the HTML entry with its JS bundle first (single entry group keeps the
// output flat: dist/index.html + dist/chunk-*.js).
// sourcemap is explicitly set to "none" for security (prevent source code leakage)
const htmlResult = await Bun.build({
  entrypoints: [...new Bun.Glob("src/**/*.html").scanSync()],
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "none",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

// Compile the stylesheet into a standalone file the app fetches at runtime.
const cssResult = await Bun.build({
  entrypoints: ["src/index.css"],
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "none",
});

for (const output of [...htmlResult.outputs, ...cssResult.outputs]) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}