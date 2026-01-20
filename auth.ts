import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "./src/helpers/frontend-env";
import { genericOAuth } from "better-auth/plugins";
import fs from "node:fs";

export const auth = betterAuth({
  secret: fs.readFileSync(env.AUTH_SECRET_FILE, "utf8"),
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : undefined,
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "pocket-id",
          clientId: env.OAUTH_CLIENT_ID,
          clientSecret: fs.readFileSync(env.OAUTH_CLIENT_SECRET_FILE, "utf8"),
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
