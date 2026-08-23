// Produces digital-PDF-optimized copies of every product/logo image.
// Source photos are multi-megapixel phone originals (2000-4600px) that display
// at only a few centimetres in the catalogue — embedding them at full
// resolution is exactly what brief section 23/24 says not to do. Originals in
// assets/ are left untouched (they're the source-of-truth / print material).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIRS = ['assets/products', 'assets/logos'];
const OUT_DIR = path.join(ROOT, 'source/design/.cache/images-digital');
const MAX_DIM = 1400; // px, longest edge — comfortably covers largest use (cover photo) at print-quality digital resolution
const JPEG_QUALITY = 78;

fs.mkdirSync(OUT_DIR, { recursive: true });

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(p);
  }
  return out;
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const dir of SRC_DIRS) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) continue;
  for (const file of walk(absDir)) {
    const rel = path.relative(ROOT, file);
    const outPath = path.join(OUT_DIR, rel.replace(/\//g, '__'));
    const before = fs.statSync(file).size;
    await sharp(file)
      .rotate() // apply EXIF orientation, then strip metadata
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(outPath);
    const after = fs.statSync(outPath).size;
    totalBefore += before;
    totalAfter += after;
    count++;
  }
}

console.log(`Optimized ${count} images: ${(totalBefore / 1e6).toFixed(1)}MB -> ${(totalAfter / 1e6).toFixed(1)}MB`);
