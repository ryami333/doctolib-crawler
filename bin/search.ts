import { parseArgs } from "node:util";
import "dotenv/config";
import { searchLatestResults } from "../lib/searchLatestResults.ts";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    url: { type: "string", short: "u", multiple: true },
  },
});

const urls = values.url ?? [];

for (const url of urls) {
  const results = await searchLatestResults({
    query: url,
    headless: false,
  });

  console.log(results);
}
