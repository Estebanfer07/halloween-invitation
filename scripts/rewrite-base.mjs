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

const FROM = "/assets/";
const TO = `${ROOT}/assets/`;
const FROM_FAVICON = "/favicon.ico";
const TO_FAVICON = `${ROOT}/favicon.ico`;
const EXTS = new Set([".html", ".css", ".js"]);

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
    let changed = false;
    if (text.includes(FROM)) {
      text = text.split(FROM).join(TO);
      changed = true;
    }
    if (text.includes(FROM_FAVICON)) {
      text = text.split(FROM_FAVICON).join(TO_FAVICON);
      changed = true;
    }
    if (changed) {
      writeFileSync(file, text);
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
console.log(`\nRewrote ${FROM} -> ${TO} in build/client`);