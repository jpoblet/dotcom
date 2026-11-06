// Reads the background colour of every screenshot in public/images/projects
// (the average of a small patch near the top-left corner, which is almost
// always the site's own background) and writes content/screen-colors.json.
// The device frames use it to take a tint of the screen they show.
// Run after adding or replacing screenshots: npm run screen-colors
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dir = path.join(root, "public/images/projects");
const files = [
  ...fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).map((f) => f),
  ...fs
    .readdirSync(path.join(dir, "gallery"))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .map((f) => `gallery/${f}`),
];

const colours = {};
for (const file of files.sort()) {
  const image = sharp(path.join(dir, file));
  const { width } = await image.metadata();
  const size = Math.max(4, Math.round(width * 0.01));
  const { data, info } = await image
    .extract({ left: size, top: size, width: size, height: size })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0;
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) {
    r += data[i * 3];
    g += data[i * 3 + 1];
    b += data[i * 3 + 2];
  }
  const hex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
  colours[`/images/projects/${file}`] = `#${hex(r)}${hex(g)}${hex(b)}`;
}

fs.writeFileSync(path.join(root, "content/screen-colors.json"), JSON.stringify(colours, null, 2) + "\n");
console.log(`Wrote ${Object.keys(colours).length} colours to content/screen-colors.json`);
