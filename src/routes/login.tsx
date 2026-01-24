import { Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "../helpers/authClient";

export const Route = createFileRoute("/login")({
  component: function PageComponent() {
    return (
      <Button
        onClick={() => authClient.signIn.social({ provider: "pocket-id" })}
      >
        Login
      </Button>
    );
  },
});
