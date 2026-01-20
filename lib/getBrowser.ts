import fs from "node:fs";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import { env } from "./worker-env.ts";

export const getBrowser = async (): Promise<Browser> => {
  const host = env.PUPPETEER_HOST ?? "puppeteer";
  const port = env.PUPPETEER_PORT ?? "3000";
  const token = fs
    .readFileSync(path.resolve(process.cwd(), env.PUPPETEER_TOKEN_FILE), "utf8")
    .trim();
  const tokenSuffix = token ? `?token=${encodeURIComponent(token)}` : "";
  const browserWSEndpoint = `ws://${host}:${port}${tokenSuffix}`;

  return puppeteer.connect({ browserWSEndpoint });
};
