import { createClient } from "redis";

export const getRedisClient = async () => {
  const client = createClient({
    url: `redis://valkey:6379`, // 'valkey' is the hostname within Docker
  });

  client.on("error", (err) => console.error("Valkey Client Error", err));

  await client.connect();

  return client;
};
