import fs from "node:fs";

/**
 * `output: "standalone"` bundles server.js + traced node_modules, but NOT the
 * static assets or public/ — those must sit next to server.js at runtime. This
 * runs as `postbuild`, so `npm run build` produces a ready-to-run standalone
 * folder in one step (important for the Plesk deploy, where the build happens
 * on the server). Cross-platform (fs.cpSync), so it works on Linux and Windows.
 */

const copies = [
  [".next/static", ".next/standalone/.next/static"],
  ["public", ".next/standalone/public"],
];

for (const [from, to] of copies) {
  if (fs.existsSync(from)) {
    fs.cpSync(from, to, { recursive: true });
    console.log(`  copied ${from} → ${to}`);
  }
}
console.log("standalone folder is ready to deploy (.next/standalone/)");
