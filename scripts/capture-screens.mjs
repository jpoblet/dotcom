// Captures project screenshots from the live sites, in light and in dark
// mode, as matching pairs: "x.jpg" and "x-dark.jpg", from the same spot of
// the same page. The case studies show the dark one when this site is dark.
//
// Only sites that change with the visitor's theme are listed: a site with
// no dark mode would give two identical pictures. Desktop shots are taken
// at 1440 x 900 (1.5x), a screen-height further down the page each time;
// phone shots at 390 x 844 (3x), from the scroll position given, or from
// just above a heading (anchor: its text), which survives layout changes.
//
// Uses your installed Chrome. Run: npm run capture-screens
// Then: npm run screen-colors
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.join(process.cwd(), "public/images/projects");

/** file (under public/images/projects) -> where to capture it. */
const SHOTS = {
  "https://athleteid.pro": {
    "athleteid.jpg": { screen: 0 },
    "gallery/athleteid-d1.jpg": { screen: 1 },
    "gallery/athleteid-d2.jpg": { screen: 2 },
    "gallery/athleteid-d5.jpg": { screen: 5 },
    "athleteid-mobile.jpg": { phone: 0, anchor: "Every race asks" },
    "gallery/athleteid-m1.jpg": { phone: 1850 },
    "gallery/athleteid-m2.jpg": { phone: 2850 },
    "gallery/athleteid-m3.jpg": { phone: 3900 },
  },
  "https://whattheflag.co": {
    "what-the-flag.jpg": { screen: 0 },
    "gallery/what-the-flag-d1.jpg": { screen: 1 },
    "gallery/what-the-flag-d2.jpg": { screen: 2 },
    "gallery/what-the-flag-d3.jpg": { screen: 3 },
    "what-the-flag-mobile.jpg": { phone: 950 },
    "gallery/what-the-flag-m1.jpg": { phone: 1850 },
    "gallery/what-the-flag-m2.jpg": { phone: 0, anchor: "Features" },
    "gallery/what-the-flag-m4.jpg": { phone: 4900 },
  },
  "https://inverse-dotcom.vercel.app": {
    "inverse.jpg": { screen: 0 },
    "inverse-mobile.jpg": { phone: 1000 },
  },
};

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [url, shots] of Object.entries(SHOTS)) {
    for (const scheme of ["light", "dark"]) {
      for (const phone of [false, true]) {
        const mine = Object.entries(shots).filter(([, at]) => ("phone" in at) === phone);
        if (!mine.length) continue;
        const context = await browser.newContext({ ...(phone ? PHONE : DESKTOP), colorScheme: scheme });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: "load" });
        await page.waitForTimeout(2500);
        for (const [file, at] of mine) {
          let y = phone ? at.phone : at.screen * DESKTOP.viewport.height;
          if (at.anchor) {
            // The heading's top, with a little room above it.
            y = await page.evaluate((text) => {
              const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (node.textContent.trim().startsWith(text)) {
                  return Math.max(0, node.parentElement.getBoundingClientRect().top + window.scrollY - 96);
                }
              }
              return 0;
            }, at.anchor);
          }
          await page.evaluate((top) => window.scrollTo(0, top), y);
          // Let scroll-triggered reveals and lazy images settle.
          await page.waitForTimeout(1200);
          const name = scheme === "dark" ? file.replace(/\.jpg$/, "-dark.jpg") : file;
          await page.screenshot({ path: path.join(OUT, name), type: "jpeg", quality: 85 });
          console.log(`${scheme.padEnd(5)} ${name}`);
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
