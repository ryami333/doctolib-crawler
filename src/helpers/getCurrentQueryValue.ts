import { createServerFn } from "@tanstack/react-start";
import { getRedisClient } from "./getRedisClient";
import { REDIS_QUERY_KEY } from "../../lib/constants";

export const getCurrentQueryValue = createServerFn({ method: "GET" }).handler(
  async () => {
    const redisClient = await getRedisClient();
    const currentValue = await redisClient.get(REDIS_QUERY_KEY);

    return currentValue;
  },
);
