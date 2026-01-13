import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { App } from "../components/App";
import { Notifications } from "@mantine/notifications";
import { authClient } from "../helpers/authClient";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await authClient.getSession();
  if (!session) {
    return authClient.signIn.social({
      provider: "pocket-id",
    });
  }

  const colorScheme = "dark" as const;

  return (
    <html data-mantine-color-scheme={colorScheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        <MantineProvider forceColorScheme={colorScheme}>
          <Notifications />
          <App>{children}</App>
        </MantineProvider>
      </body>
    </html>
  );
};

export default Layout;
