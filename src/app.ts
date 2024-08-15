import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from "~/db/db";
import { formatZodError } from "~/helpers/formatter";
import { log } from "~/helpers/logger";
import { auth } from "~/auth/auth";

type Env = {
  Variables: {
    db: typeof db;
    auth: typeof auth;
  };
};

function createApp() {
  const hono = new OpenAPIHono<Env>({
    defaultHook: (result, c) => {
      if (result.success) {
        return;
      }

      return c.json({ code: 400, error: formatZodError(result.error) }, 400);
    },
  });

  const app = hono.basePath("/api");

  app.use(cors());

  app.use(async (c, next) => {
    c.set("db", db);
    c.set("auth", auth);
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

  app.openAPIRegistry.registerComponent("securitySchemes", "SessionCookie", {
    type: "apiKey",
    in: "cookie",
    name: "sessionId",
  });

  return app;
}

export const app = createApp();
