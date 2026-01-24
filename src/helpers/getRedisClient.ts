import { createClient } from "redis";
import { serverEnv } from "./serverEnv";

export const getRedisClient = async () => {
  const client = createClient({
    url: `redis://${serverEnv.VALKEY_HOST}:6379`,
  });

  client.on("error", (err) => console.error("Valkey Client Error", err));

  await client.connect();

  return client;
};
