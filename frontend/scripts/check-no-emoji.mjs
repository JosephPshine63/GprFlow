// Fails when an emoji appears in UI source. Icons come from lucide-react, brands from image assets.
import fs from "node:fs";
import path from "node:path";

const EMOJI = /\p{Extended_Pictographic}/u;
const roots = process.argv.slice(2);
const targets = roots.length ? roots : ["src", "index.html"];
const skip = new Set(["node_modules", "dist", "ui"]);

const walk = (p, out = []) => {
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (/\.(jsx?|html)$/.test(p)) out.push(p);
    return out;
  }
  for (const name of fs.readdirSync(p)) {
    if (!skip.has(name)) walk(path.join(p, name), out);
  }
  return out;
};

let found = 0;
for (const file of targets.flatMap((t) => walk(t))) {
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (EMOJI.test(line)) {
        console.error(`${file}:${i + 1}: emoji not allowed`);
        found++;
      }
    });
}
process.exit(found ? 1 : 0);
