import { createAuthClient } from "better-auth/react";
import { serverEnv } from "./serverEnv";
export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined" ? serverEnv.BASE_URL : window.location.origin,
});
