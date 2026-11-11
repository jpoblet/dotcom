// Prints public/cv/cv.html to public/cv/jordi-poblet-cv.pdf (A4) with the local Chrome.
// Usage: npm run cv
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const html = path.join(root, "public", "cv", "cv.html");
const pdf = path.join(root, "public", "cv", "jordi-poblet-cv.pdf");

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Wrote ${path.relative(root, pdf)}`);
