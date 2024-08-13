import { drizzle } from "drizzle-orm/mysql-proxy";
import { queryFn } from "~/db/proxy";
import * as schema from "~/db/schema";

export const db = drizzle(queryFn, { schema });
