import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number(),
    MYSQL_URL: z.string().url(),
    MYSQL_PROXY_QUERY_ENDPOINT: z.string().url(),
    MYSQL_PROXY_MIGRATE_ENDPOINT: z.string().url(),
    MYSQL_PROXY_BASIC_AUTH_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
