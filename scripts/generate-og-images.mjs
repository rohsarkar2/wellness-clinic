/**
 * Builds the social preview images in public/og from the artwork in
 * public/images.
 *
 * The source art is 1.5–2.2 MB a piece and 3:2. Facebook and X will fetch that,
 * but WhatsApp silently drops any preview image over roughly 300 KB — which is
 * most of how this clinic's links get shared. These derivatives are 1200×630
 * (the 1.91:1 every platform crops to) and land around 150 KB.
 *
 * Run with `node scripts/generate-og-images.mjs` after changing the artwork.
 * macOS only: it shells out to `sips`, which ships with the OS.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "public/images");
const OUT = join(root, "public/og");

/** The size every social platform crops towards. */
const WIDTH = 1200;
const HEIGHT = 630;
const QUALITY = 72;

/**
 * Portraits are 4:5, so a centred crop would cut the face in half. Taking the
 * band starting 12% down keeps heads in frame.
 */
const PORTRAIT_TOP = 0.12;

function sips(args) {
  execFileSync("sips", args, { stdio: ["ignore", "ignore", "pipe"] });
}

function dimensions(file) {
  const out = execFileSync(
    "sips",
    ["-g", "pixelWidth", "-g", "pixelHeight", file],
    {
      encoding: "utf8",
    },
  );
  return {
    width: Number(out.match(/pixelWidth: (\d+)/)[1]),
    height: Number(out.match(/pixelHeight: (\d+)/)[1]),
  };
}

/** Cover-crops `file` to 1200×630 and writes it out as a JPEG. */
function build(name) {
  const source = join(SOURCE, name);
  const target = join(OUT, name.replace(extname(name), ".jpg"));
  const { width, height } = dimensions(source);

  // Crop the source to 1.91:1 first, then scale — cropping after the resize
  // would lose the offset control that keeps faces in frame.
  const cropHeight = Math.round((width * HEIGHT) / WIDTH);
  const portrait = height > width;

  sips([
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    String(QUALITY),
    source,
    "--out",
    target,
  ]);

  if (cropHeight <= height) {
    const offset = portrait
      ? Math.round(height * PORTRAIT_TOP)
      : Math.round((height - cropHeight) / 2);
    sips([
      "-c",
      String(cropHeight),
      String(width),
      "--cropOffset",
      String(offset),
      "0",
      target,
    ]);
  }

  sips(["-z", String(HEIGHT), String(WIDTH), target]);

  const kb = statSync(target).size / 1024;
  console.log(
    `${name.padEnd(22)} ${width}×${height} → ${WIDTH}×${HEIGHT}  ${kb.toFixed(0)} KB`,
  );
  if (kb > 300) console.warn(`  ⚠ over WhatsApp's ~300 KB preview limit`);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const images = readdirSync(SOURCE).filter((name) =>
  /\.(png|jpe?g)$/i.test(name),
);

for (const name of images) build(name);

console.log(`\n${images.length} images written to public/og`);
