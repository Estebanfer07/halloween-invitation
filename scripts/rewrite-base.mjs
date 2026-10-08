import {
  cpSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] ?? "/halloween-invitation";
const CLIENT = join(process.cwd(), "build", "client");

const TO = `${ROOT}/assets/`;
const TO_FAVICON = `${ROOT}/favicon.ico`;
const EXTS = new Set([".html", ".css", ".js"]);
const escapedRoot = ROOT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const assetPathPattern = new RegExp(`(?<!${escapedRoot})/assets/`, "g");
const faviconPathPattern = new RegExp(`(?<!${escapedRoot})/favicon\\.ico`, "g");

function rewrite(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      rewrite(file);
      continue;
    }
    if (!EXTS.has(entry.slice(entry.lastIndexOf(".")))) continue;
    let text = readFileSync(file, "utf8");
    const rewritten = text
      .replace(assetPathPattern, TO)
      .replace(faviconPathPattern, TO_FAVICON);
    const changed = rewritten !== text;
    if (changed) {
      writeFileSync(file, rewritten);
      console.log(`rewrote ${file.replace(process.cwd(), ".")}`);
    }
  }
}

rewrite(CLIENT);

// React Router writes the prerendered page under `<basename>/index.html`,
// but GitHub Pages serves the artifact root; promote it so /index.html
// (the page behind /halloween-invitation/) exists.
const nested = join(CLIENT, ROOT.replace(/^\//, ""));
const nestedIndex = join(nested, "index.html");
if (statSync(nestedIndex, { throwIfNoEntry: false })) {
  cpSync(nestedIndex, join(CLIENT, "index.html"));
  rmSync(nested, { recursive: true, force: true });
  console.log(`promoted ${nested.replace(process.cwd(), ".")}/index.html -> ./index.html`);
}
console.log(`\nRewrote root-relative asset paths for ${ROOT} in build/client`);
