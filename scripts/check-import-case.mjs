/**
 * Fails if any `@/...` import disagrees with a filename's casing.
 *
 * macOS is case-insensitive, so `@/components/ui/Button` happily resolves to
 * `button.tsx` locally and only explodes on Vercel's case-sensitive Linux
 * builders. Git compounds it: with `core.ignorecase=true` (the macOS default)
 * a case-only rename is invisible to `git status`, so the old name stays in
 * the index. This check compares every import against the real directory
 * listing, the same way Linux would.
 *
 * Run with: pnpm check:case
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "src";
const EXTENSIONS = ["", ".ts", ".tsx", ".css", "/index.ts", "/index.tsx"];

function collectSourceFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, found);
    else if (/\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

const problems = [];

for (const file of collectSourceFiles(ROOT)) {
  const source = fs.readFileSync(file, "utf8");

  for (const match of source.matchAll(/from\s+"(@\/[^"]+)"/g)) {
    const target = match[1].replace(/^@\//, `${ROOT}/`);
    const dir = path.dirname(target);
    const base = path.basename(target);

    if (!fs.existsSync(dir)) {
      problems.push(`${file}: directory not found for "${match[1]}"`);
      continue;
    }

    const entries = fs.readdirSync(dir);
    const exact = EXTENSIONS.some((ext) => entries.includes(base + ext.replace(/^\//, "")));
    const isDirectory = fs.existsSync(target) && fs.statSync(target).isDirectory();
    if (exact || isDirectory) continue;

    const nearMiss = entries.find(
      (entry) => entry.toLowerCase().replace(/\.tsx?$/, "") === base.toLowerCase(),
    );

    problems.push(
      nearMiss
        ? `${file}: imports "${match[1]}" but the file on disk is "${nearMiss}"`
        : `${file}: cannot resolve "${match[1]}"`,
    );
  }
}

if (problems.length) {
  console.error("Import casing problems (these break case-sensitive builds):\n");
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}

console.log("Import casing OK — every @/ import matches its filename exactly.");
