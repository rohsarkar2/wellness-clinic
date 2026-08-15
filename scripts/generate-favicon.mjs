/**
 * Generates src/app/favicon.ico — the clinic's heart-with-a-pulse mark, the
 * same symbol the navbar uses (Font Awesome's `fa-heart-pulse`) in the brand
 * blue.
 *
 * Run with `node scripts/generate-favicon.mjs` after changing the design.
 *
 * No image dependencies: shapes are rasterised by point sampling, PNG is
 * written with Node's zlib and the sizes are packed into an ICO by hand.
 * Small sizes are stored as BMP (what every Windows/browser ICO reader
 * expects) and large ones as PNG (which keeps the file small).
 */

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/app/favicon.ico",
);

/** --primary and --color-primary-dark from src/app/globals.css. */
const BRAND = [0x0a, 0x6e, 0xbd];
const BRAND_DARK = [0x08, 0x5e, 0xa4];
const WHITE = [0xff, 0xff, 0xff];

/** Sizes stored in the .ico, and how each one is encoded. */
const SIZES = [
  { size: 16, format: "bmp" },
  { size: 24, format: "bmp" },
  { size: 32, format: "bmp" },
  { size: 48, format: "bmp" },
  { size: 64, format: "png" },
  { size: 128, format: "png" },
  { size: 256, format: "png" },
];

/**
 * Samples per pixel per axis. Shapes are sampled hard-edged and averaged, so
 * this alone produces the anti-aliasing — feathering the edges as well would
 * blur away a pixel of an icon that only has sixteen of them.
 */
const SUPERSAMPLE = 8;

// ---------------------------------------------------------------- geometry

/** Signed distance to a rounded square covering the whole tile, in 0..1 units. */
function roundedSquareDistance(x, y, radius) {
  const dx = Math.abs(x - 0.5) - (0.5 - radius);
  const dy = Math.abs(y - 0.5) - (0.5 - radius);
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return outside + Math.min(Math.max(dx, dy), 0) - radius;
}

/**
 * The classic heart: a square rotated 45° with a semicircle sitting on each of
 * its two upper edges. Built from exact distance fields so the outline stays
 * smooth — an implicit curve like (X² + Y² − 1)³ = X²Y³ gives a lumpier edge
 * once it's feathered.
 *
 * `d` is the half-diagonal of the square, which puts the point at cy + d and
 * the shoulders at cx ± 1.207d.
 */
function heartDistance(x, y, d, cx, cy) {
  // Shrink the square by `round` and grow the field back by the same amount,
  // which softens the otherwise needle-sharp point at the bottom.
  const round = d * 0.08;
  const diamond =
    (Math.abs(x - cx) + Math.abs(y - cy) - (d - round * Math.SQRT2)) /
      Math.SQRT2 -
    round;
  const lobeRadius = d / Math.SQRT2;
  const lobeY = cy - d / 2;
  const left = Math.hypot(x - (cx - d / 2), y - lobeY) - lobeRadius;
  const right = Math.hypot(x - (cx + d / 2), y - lobeY) - lobeRadius;
  return Math.min(diamond, left, right);
}

/** Distance from a point to a line segment. */
function segmentDistance(x, y, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(
    0,
    Math.min(1, ((x - ax) * abx + (y - ay) * aby) / (abx * abx + aby * aby)),
  );
  return Math.hypot(x - (ax + abx * t), y - (ay + aby * t));
}

/**
 * The ECG trace, in 0..1 tile units. It runs past both shoulders of the heart
 * so the ends are clipped by the heart rather than stopping inside it.
 */
const PULSE = [
  [0.12, 0.52],
  [0.38, 0.52],
  [0.45, 0.38],
  [0.54, 0.66],
  [0.61, 0.52],
  [0.88, 0.52],
];

function pulseDistance(x, y) {
  let best = Infinity;
  for (let i = 0; i < PULSE.length - 1; i++) {
    const [ax, ay] = PULSE[i];
    const [bx, by] = PULSE[i + 1];
    best = Math.min(best, segmentDistance(x, y, ax, ay, bx, by));
  }
  return best;
}

// ---------------------------------------------------------------- rasteriser

function mix(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/** Colour of a single sample. Returns [r, g, b, a] with a of either 0 or 1. */
function sample(x, y, drawPulse) {
  const inside = (distance) => distance <= 0;

  if (!inside(roundedSquareDistance(x, y, 0.22))) return [0, 0, 0, 0];

  // Vertical brand gradient, lighter at the top.
  const background = mix(BRAND, BRAND_DARK, y);

  // Sized so the heart is 66% of the tile wide, centred on its own bounds
  // (which run from cy − 1.207d to cy + d).
  const d = 0.66 / 2.414;
  const heart = inside(heartDistance(x, y, d, 0.5, 0.5 + 0.1035 * d));
  if (!heart) return [...background, 1];

  // The pulse is knocked out of the heart in the background colour. It is
  // dropped below 24px, where a line this thin turns to mush.
  if (drawPulse && inside(pulseDistance(x, y) - 0.036)) {
    return [...background, 1];
  }

  return [...WHITE, 1];
}

/** Renders one size to straight (non-premultiplied) RGBA bytes. */
function render(size) {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const drawPulse = size >= 24;
  const step = 1 / (size * SUPERSAMPLE);
  const offset = step / 2;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const x = px / size + sx * step + offset;
          const y = py / size + sy * step + offset;
          const [sr, sg, sb, sa] = sample(x, y, drawPulse);
          // Weight colour by alpha so transparent samples don't darken edges.
          r += sr * sa;
          g += sg * sa;
          b += sb * sa;
          a += sa;
        }
      }

      const i = (py * size + px) * 4;
      if (a > 0) {
        pixels[i] = r / a;
        pixels[i + 1] = g / a;
        pixels[i + 2] = b / a;
      }
      pixels[i + 3] = (a / (SUPERSAMPLE * SUPERSAMPLE)) * 255;
    }
  }

  return pixels;
}

// ---------------------------------------------------------------- encoders

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(pixels, size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // colour type: RGBA

  // One filter byte (0 = none) in front of every scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** 32-bit bottom-up DIB plus the 1bpp AND mask an ICO entry expects. */
function encodeBmp(pixels, size) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8); // colour data + mask
  header.writeUInt16LE(1, 12); // planes
  header.writeUInt16LE(32, 14); // bits per pixel

  const colours = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const from = ((size - 1 - y) * size + x) * 4;
      const to = (y * size + x) * 4;
      colours[to] = pixels[from + 2]; // B
      colours[to + 1] = pixels[from + 1]; // G
      colours[to + 2] = pixels[from]; // R
      colours[to + 3] = pixels[from + 3]; // A
    }
  }

  // Rows of the mask are padded to 4 bytes. The alpha channel above is what
  // actually gets used, so every pixel is marked opaque here.
  const maskRow = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskRow * size);

  return Buffer.concat([header, colours, mask]);
}

function encodeIco(entries) {
  const directory = Buffer.alloc(6 + entries.length * 16);
  directory.writeUInt16LE(0, 0); // reserved
  directory.writeUInt16LE(1, 2); // type: icon
  directory.writeUInt16LE(entries.length, 4);

  let offset = directory.length;
  entries.forEach((entry, index) => {
    const at = 6 + index * 16;
    directory[at] = entry.size >= 256 ? 0 : entry.size; // 0 means 256
    directory[at + 1] = entry.size >= 256 ? 0 : entry.size;
    directory[at + 2] = 0; // palette size
    directory[at + 3] = 0; // reserved
    directory.writeUInt16LE(1, at + 4); // planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(entry.data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += entry.data.length;
  });

  return Buffer.concat([directory, ...entries.map((entry) => entry.data)]);
}

// ---------------------------------------------------------------- output

const entries = SIZES.map(({ size, format }) => {
  const pixels = render(size);
  return {
    size,
    data: format === "png" ? encodePng(pixels, size) : encodeBmp(pixels, size),
  };
});

const ico = encodeIco(entries);
writeFileSync(OUT, ico);
console.log(
  `favicon.ico — ${entries.map((e) => e.size).join(", ")}px, ${(ico.length / 1024).toFixed(1)} KB`,
);

// `--preview <dir>` also drops standalone PNGs for eyeballing the result.
const previewIndex = process.argv.indexOf("--preview");
if (previewIndex !== -1) {
  const dir = process.argv[previewIndex + 1];
  for (const { size } of SIZES) {
    writeFileSync(
      join(dir, `favicon-${size}.png`),
      encodePng(render(size), size),
    );
  }
  console.log(`previews written to ${dir}`);
}
