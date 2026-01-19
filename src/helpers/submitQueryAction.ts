"use server";

import { z } from "zod";
import { createSafeAction } from "./createSafeAction";
import { getRedisClient } from "../../lib/getRedisClient";
import { REDIS_QUERY_KEY } from "../../lib/constants";
import { crawlerQueue } from "../../lib/crawlerQueue";

const schema = z.object({
  query: z
    .string()
    .trim()
    .nonempty()
    .transform((val) => val.replace(/\r\n/g, "\n")), // normalize CRLF to LF)
});

export const submitQueryAction = createSafeAction(schema, async ({ query }) => {
  z.url().array().parse(query.split("\n"));

  const redisClient = await getRedisClient();

  await redisClient.set(REDIS_QUERY_KEY, query);

  /**
   * Set a baseline so that we don't get emailed about all of the _existing_
   * results.
   */
  crawlerQueue.add(
    { sendNotifications: false },
    {
      attempts: 3,
    },
  );

  return {
    ok: true,
  };
});
