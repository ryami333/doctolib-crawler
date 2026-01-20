import { getBrowser } from "./getBrowser.ts";

export const searchLatestResults = async ({ query }: { query: string }) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 430, height: 932 }); // iPhone 14 Pro Max viewport.
    await page.goto(query, {
      /**
       * Waiting for network-idle is probably sensible in this case because it's
       * an SPA – if the appointment-checking happens client-side via some API
       * requests, then best to let everything resolve.
       */
      waitUntil: "networkidle2",
    });
    await page.waitForSelector(
      "main", // Seems to be a SPA, and the SSR content does not include this `main` element, it's only appended after the application has rendered.
      { timeout: 15000 },
    );

    const hasNoAppointmentsHeader = await page.$eval(
      "[data-design-system-component=EmptyState]",
      (element) => !!element,
    );
    if (hasNoAppointmentsHeader) {
      console.log(`No appointments available for ${query}`);
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
