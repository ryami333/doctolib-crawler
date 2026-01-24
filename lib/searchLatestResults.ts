import puppeteer from "puppeteer";

export const searchLatestResults = async ({
  query,
  headless = true,
}: {
  query: string;
  headless: boolean;
}) => {
  const browser = await puppeteer.launch({
    args: ["--disable-cache"],
    headless,
    devtools: !headless,
  });
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

    const abortController = new AbortController();

    // Using `Promise.any`` instead of `Promise.race` because `any` forgives rejections (as long as at-least one promise fulfills).
    const results = await Promise.any([
      page
        .waitForSelector("[data-design-system-component=EmptyState]", {
          timeout: 15000,
          signal: abortController.signal,
        })
        .then(() => []),
      page
        .waitForSelector("[data-design-system-component=CardCollapsible]", {
          timeout: 15000,
          signal: abortController.signal,
        })

        .then(async () => {
          const resultsCards = await page.$$(
            "[data-design-system-component=CardCollapsible]",
          );
          return await Promise.all(
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
        }),
    ]).finally(() => abortController.abort());

    return results;
  } finally {
    await page.close();
    await browser.close();
  }
};
