import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { genericOAuth } from "better-auth/plugins";
import fs from "node:fs";
import { serverEnv } from "./src/helpers/serverEnv";
import { clientEnv } from "./src/helpers/clientEnv";

export const auth = betterAuth({
  secret: fs.readFileSync(serverEnv.AUTH_SECRET_FILE, "utf8"),
  trustedOrigins: serverEnv.BETTER_AUTH_TRUSTED_ORIGINS
    ? serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : undefined,
  baseURL: clientEnv.VITE_BASE_URL,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "pocket-id",
          clientId: serverEnv.OAUTH_CLIENT_ID,
          clientSecret: fs.readFileSync(
            serverEnv.OAUTH_CLIENT_SECRET_FILE,
            "utf8",
          ),
          discoveryUrl:
            "https://auth.example.com/.well-known/openid-configuration",
          // ... other config options
        },
        // Add more providers as needed
      ],
    }),
    /**
     * ⚠️ Needs to be last plugin in the array:
     */
    tanstackStartCookies(),
  ],
});
