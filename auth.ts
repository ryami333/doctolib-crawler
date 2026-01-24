import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { genericOAuth } from "better-auth/plugins";
import fs from "node:fs";
import { serverEnv } from "./src/helpers/serverEnv";

export const auth = betterAuth({
  secret: fs.readFileSync(serverEnv.AUTH_SECRET_FILE, "utf8").trim(),
  trustedOrigins: serverEnv.BETTER_AUTH_TRUSTED_ORIGINS
    ? serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : undefined,
  baseURL: serverEnv.BASE_URL,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "pocket-id",
          clientId: serverEnv.OAUTH_CLIENT_ID,
          clientSecret: fs
            .readFileSync(serverEnv.OAUTH_CLIENT_SECRET_FILE, "utf8")
            .trim(),
          scopes: ["profile", "openid", "email"],
          discoveryUrl: `${serverEnv.OAUTH_ISSUER}/.well-known/openid-configuration`,
        },
      ],
    }),
    /**
     * ⚠️ Needs to be last plugin in the array:
     */
    tanstackStartCookies(),
  ],
});
