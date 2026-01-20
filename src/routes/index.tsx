// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "../components/Homepage";
import { getRedisClient } from "../../lib/getRedisClient";
import { REDIS_QUERY_KEY } from "../../lib/constants";

export const Route = createFileRoute("/")({
  component: async function PageComponent() {
    const currentValue = Route.useLoaderData();

    return <Homepage currentValue={currentValue ?? ""} />;
  },
  loader: async () => {
    const redisClient = await getRedisClient();
    const currentValue = await redisClient.get(REDIS_QUERY_KEY);

    return currentValue;
  },
});
