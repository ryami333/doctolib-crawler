"use server";

import { z } from "zod";
import { REDIS_QUERY_KEY } from "../../lib/constants";
// import { crawlerQueue } from "../../lib/crawlerQueue";
import { getRedisClient } from "./getRedisClient";
import { createServerFn } from "@tanstack/react-start";

const schema = z.object({
  query: z
    .string()
    .trim()
    .nonempty()
    .transform((val) => val.replace(/\r\n/g, "\n")), // normalize CRLF to LF)
});

export const submitQueryAction = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data: { query } }) => {
    const urlArrayValidationResult = z
      .url()
      .array()
      .safeParse(query.split("\n"));

    if (!urlArrayValidationResult) {
      throw new Error("Validation error");
    }

    const redisClient = await getRedisClient();

    await redisClient.set(REDIS_QUERY_KEY, query);

    /**
     * Set a baseline so that we don't get emailed about all of the _existing_
     * results.
     */
    // crawlerQueue.add(
    //   { sendNotifications: false },
    //   {
    //     attempts: 3,
    //   },
    // );

    return {
      ok: true,
    };
  });
