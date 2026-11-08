// Presentation snapshots of the Stuffaroo redesign. Usage: node snap.mjs <outDir>
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const OUT = process.argv[2];
const MAYA = "d0549bb3-c081-5263-8655-1a41f465eaa3";

const pages = [
  ["01-home", "/marketplace"],
  ["02-home-rent-mode", "/marketplace?mode=rent"],
  ["03-browse", "/marketplace/browse"],
  [
    "04-browse-filtered",
    "/marketplace/browse?mode=rent&category=electronics&sort=price",
  ],
  ["05-browse-empty", "/marketplace/browse?q=unicorn+saddle"],
  ["06-listing-detail", "/marketplace/listings/r-1"],
  ["07-listing-buy-or-rent", "/marketplace/listings/b-3?as=rent"],
  ["08-profile", `/marketplace/profile/${MAYA}`],
  ["09-profile-reviews", `/marketplace/profile/${MAYA}?tab=reviews`],
  ["10-post-photos", "/marketplace/listings/new"],
  ["11-post-review", "/marketplace/listings/new#review"],
];

const devices = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
};

const hideDevUi = `nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }`;

async function settle(page) {
  // Scroll through once so lazy images load and scroll effects run, then back to top
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page
    .waitForFunction(
      () => [...document.images].every((img) => img.complete),
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(600);
}

async function addPhotos(page) {
  await page.waitForSelector("input[type=file]");
  await page.waitForTimeout(800); // hydration
  // Two of the mockup photos (Unsplash, CORS-enabled), fetched in the page
  await page.evaluate(async () => {
    const ids = ["1612036781124-847f8939b154", "1578303512597-81e6cc155b3e"];
    const dt = new DataTransfer();
    for (const id of ids) {
      const blob = await fetch(
        `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80&fm=jpg`,
      ).then((r) => r.blob());
      dt.items.add(new File([blob], `${id}.jpg`, { type: "image/jpeg" }));
    }
    const input = document.querySelector("input[type=file]");
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(
    () => document.querySelectorAll("ul img").length >= 2,
    null,
    { timeout: 10000 },
  );
}

async function toReview(page) {
  const click = (text, sel = "button") =>
    page
      .locator(sel, { hasText: new RegExp(`^${text}$`) })
      .first()
      .click();
  await click("Next");
  await page.fill("#ai", "my switch oled, 2 controllers, has a case");
  await click("Draft");
  await page.waitForFunction(
    () => document.querySelector("#title")?.value.length > 3,
  );
  await click("Next");
  await page.fill("#price", "6");
  await page.fill("#deposit", "60");
  await click("Next");
  await page.locator("label", { hasText: "Koerner Library" }).click();
  await page.locator("label", { hasText: /^3–6PM$/ }).click();
  await click("Review");
  await page.waitForSelector("text=Check and publish");
}

const browser = await chromium.launch({ channel: "chrome" });
for (const [deviceName, opts] of Object.entries(devices)) {
  const dir = join(OUT, deviceName);
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    ...opts,
    reducedMotion: "no-preference",
  });
  for (const [name, path] of pages) {
    const page = await context.newPage();
    // Retry when the dev server is mid-recompile and serves its error page
    for (let attempt = 0; attempt < 4; attempt++) {
      await page.goto(BASE + path.replace("#review", ""), {
        waitUntil: "networkidle",
      });
      const broken = await page
        .getByText(/couldn.t load|Unhandled Runtime Error/)
        .count();
      if (!broken) break;
      if (attempt === 3) throw new Error(`${path} keeps failing to load`);
      await page.waitForTimeout(3000);
    }
    await page.addStyleTag({ content: hideDevUi });
    if (name.startsWith("10") || name.startsWith("11")) {
      await addPhotos(page);
      if (name.startsWith("11")) await toReview(page);
    }
    await settle(page);
    await page.screenshot({ path: join(dir, `${name}.png`), fullPage: true });
    if (
      ["01-home", "03-browse", "06-listing-detail", "08-profile"].includes(name)
    ) {
      await page.screenshot({ path: join(dir, `${name}-fold.png`) });
    }
    console.log(deviceName, name);
    await page.close();
  }
  if (deviceName === "mobile") {
    // The filters bottom sheet, open
    const page = await context.newPage();
    await page.goto(`${BASE}/marketplace/browse?category=electronics`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({ content: hideDevUi });
    await page.waitForTimeout(800);
    await page.locator("button", { hasText: "Filters" }).first().click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(dir, "12-browse-filters-sheet.png") });
    console.log(deviceName, "12-browse-filters-sheet");
    await page.close();
  }
  await context.close();
}
await browser.close();
