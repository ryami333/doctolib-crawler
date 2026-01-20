import { getBrowser } from "./getBrowser.ts";

export const searchLatestResults = async ({ query }: { query: string }) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(query, { waitUntil: "networkidle2" });
    await page.waitForSelector(
      "#srchrslt-adtable, #saved-search-empty-result",
      { timeout: 15000 },
    );

    /**
     * The #saved-search-empty-result element contains a message like "Es wurden
     * leider keine Ergebnisse für ____". If we come across this, we should bail
     * out because the ads listed on the page will be suggestions, not actual
     * search matches.
     */
    const hasEmptyResults = await page.$("#saved-search-empty-result");
    if (hasEmptyResults) {
      console.log(`No results for ${query}`);
      return [];
    }

    const results = await page.$$eval(
      "#srchrslt-adtable article.aditem",
      (adElements) =>
        adElements
          .filter(
            (adElement) =>
              !adElement.querySelector(".badge-hint-pro-small-srp"),
          )
          .map((adElement) => {
            /**
             * I have historically had problems with nested selectors like:
             * `querySelector(".foo h2 a")`
             */
            const linkElement = adElement
              .querySelector(".aditem-main--middle")
              ?.querySelector("h2")
              ?.querySelector("a");

            return {
              id: adElement.getAttribute("data-adid"),
              href: adElement.getAttribute("data-href"),
              heading: linkElement?.textContent?.trim(),
              description: adElement
                .querySelector(".aditem-main--middle p")
                ?.innerHTML.trim(),
              price: adElement
                .querySelector(".aditem-main--middle--price-shipping--price")
                ?.innerHTML.trim(),
              markup: adElement.outerHTML,
            };
          }),
    );

    return results;
  } finally {
    await page.close();
    await browser.close();
  }
};
