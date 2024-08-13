import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from "~/db/db";
import { formatZodError } from "~/helpers/formatter";
import { log } from "~/helpers/logger";

type Env = {
  Variables: {
    db: typeof db;
  };
};

function createApp() {
  const app = new OpenAPIHono<Env>({
    defaultHook: (result, c) => {
      if (result.success) {
        return;
      }

      return c.json({ code: 400, error: formatZodError(result.error) }, 400);
    },
  }).basePath("/api");

  app.use(cors());

  app.use(async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.use(logger(log));

  app.doc("/openapi-json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Doc",
    },
  });

  app.get("/doc", swaggerUI({ url: "/api/openapi-json" }));

  return app;
}

export const app = createApp();
