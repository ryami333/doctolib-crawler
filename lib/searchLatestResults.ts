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

    const resultsCards = await page.$$(
      "[data-design-system-component=CardCollapsible]",
    );

    const results = await Promise.all(
      resultsCards.map(async (resultsCard) => {
        const dateHeadingElement = await resultsCard.$("h2");
        const dateString = await dateHeadingElement?.evaluate(
          (element) => element.textContent,
        );
        return {
          id: dateString,
          date: dateString,
          href: query,
        };
      }),
    );

    return results;
  } finally {
    await page.close();
    await browser.close();
  }
};
