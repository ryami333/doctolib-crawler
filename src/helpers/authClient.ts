import { createAuthClient } from "better-auth/react";
import { env } from "./frontend-env";
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
});
