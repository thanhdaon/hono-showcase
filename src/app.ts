import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Session, User } from "lucia";
import { formatZodError } from "~/helpers/formatter";
import { log } from "~/helpers/logger";
import { requireAuth } from "~/middlewares/auth";

const hono = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (result.success) {
      return;
    }

    return c.json({ code: 400, error: formatZodError(result.error) }, 400);
  },
});

const app = hono.basePath("/api");

app.use(cors());
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

type EnvAuth = {
  Variables: {
    user: User;
    session: Session;
  };
};

const authApp = new OpenAPIHono<EnvAuth>();
authApp.use(requireAuth);

export { app, authApp };
