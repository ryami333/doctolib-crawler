// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Anchor, List, ListItem } from "@mantine/core";
import { REDIS_QUERY_KEY } from "../../../lib/constants";
import { getRedisClient } from "../../helpers/getRedisClient";

export const Route = createFileRoute("/browse/")({
  component: async function PageComponent() {
    const currentValue = Route.useLoaderData() ?? "";

    return (
      <List>
        {currentValue
          .split("\n")
          .map((input) => input.trim())
          .toSorted((a, b) => a.localeCompare(b))
          .map((query, index) => (
            <ListItem key={index}>
              <Anchor href={query}>{query}</Anchor>
            </ListItem>
          ))}
      </List>
    );
  },
  loader: async () => {
    const redisClient = await getRedisClient();
    const currentValue = await redisClient.get(REDIS_QUERY_KEY);

    return currentValue;
  },
});
