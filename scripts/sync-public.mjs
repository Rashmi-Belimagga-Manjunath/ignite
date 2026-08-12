// Copies docs/*.md → public/docs/ and data exports → public/data/ so the static
// site can serve every markdown + the synthetic dataset on the /log page.
import { mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const pairs = [
  ["docs", "public/docs"],
  ["data", "public/data"],
];

for (const [srcDir, dstDir] of pairs) {
  const src = join(root, srcDir);
  const dst = join(root, dstDir);
  if (!existsSync(src)) continue;
  mkdirSync(dst, { recursive: true });
  let n = 0;
  for (const f of readdirSync(src)) {
    if (!/\.(md|json|csv|db)$/.test(f)) continue;
    copyFileSync(join(src, f), join(dst, f));
    n++;
  }
  console.log(`synced ${srcDir}/ → ${dstDir}/ (${n} files)`);
}
