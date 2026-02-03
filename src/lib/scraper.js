import { chromium } from "playwright";

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      handleSIGINT: false,
      handleSIGTERM: false,
    });
  }
  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function scrape(url) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.route(
      "**/*.{png,jpg,jpeg,gif,webp,css,font,woff,woff2,svg,mp4}",
      (route) => route.abort(),
    );
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 15000 });
    } catch (e) {}

    const text = await page.evaluate(() => {
      const clean = (str) => (str ? str.replace(/\s+/g, " ").trim() : "");

      const toMd = (node) => {
        if (node.nodeType === 3) return clean(node.textContent);
        if (node.nodeType !== 1) return "";

        const tag = node.tagName.toLowerCase();
        const style = window.getComputedStyle(node);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          [
            "script",
            "style",
            "noscript",
            "header",
            "footer",
            "nav",
            "svg",
            "button",
            "iframe",
          ].includes(tag)
        )
          return "";

        if (tag === "a") {
          const href = node.getAttribute("href");
          const txt = clean(node.innerText);
          return href && txt
            ? `[${txt}](${new URL(href, window.location.href).href})`
            : txt;
        }

        let p = "",
          s = "";
        if (["p", "div", "section", "article", "li"].includes(tag)) s = "\n";
        if (["h1", "h2", "h3"].includes(tag)) {
          p = "# ";
          s = "\n";
        }
        if (tag === "br") return "\n";

        let content = "";
        node.childNodes.forEach((c) => (content += toMd(c) + " "));
        return p + clean(content) + s;
      };
      return toMd(document.body);
    });

    return text.replace(/\n\s+\n/g, "\n").trim();
  } catch (err) {
    throw new Error(`Failed to scrape ${url}: ${err.message}`);
  }
}
