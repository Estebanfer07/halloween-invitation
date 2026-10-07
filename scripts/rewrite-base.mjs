import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] ?? "/halloween-invitation";
const CLIENT = join(process.cwd(), "build", "client");

const FROM = "/assets/";
const TO = `${ROOT}/assets/`;
const EXTS = new Set([".html", ".css", ".js"]);

function rewrite(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      rewrite(file);
    } else if (EXTS.has(entry.slice(entry.lastIndexOf(".")))) {
      let text = readFileSync(file, "utf8");
      if (text.includes(FROM)) {
        writeFileSync(file, text.split(FROM).join(TO));
        console.log(`rewrote ${file.replace(process.cwd(), ".")}`);
      }
    }
  }
}

rewrite(CLIENT);
console.log(`\nRewrote ${FROM} -> ${TO} in build/client`);