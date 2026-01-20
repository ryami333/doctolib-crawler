/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { App } from "../components/App";
import { Notifications } from "@mantine/notifications";
import { authClient } from "../helpers/authClient";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Doctolib Crawler",
      },
    ],
  }),
  component: RootComponent,
  beforeLoad: async (context) => {
    const session = await authClient.getSession();

    const signInObj = await authClient.signIn.social({
      provider: "pocket-id",
      callbackURL: context.location.href,
    });

    if (!session) {
      throw redirect({ to: signInObj.data?.url });
    }
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const colorScheme = "dark" as const;

  return (
    <html data-mantine-color-scheme={colorScheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider forceColorScheme={colorScheme}>
          <Notifications />
          <App>{children}</App>
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
