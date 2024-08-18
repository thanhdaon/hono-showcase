import "dotenv/config";
import { serve } from "@hono/node-server";
import { app, authApp } from "~/app";
import { env } from "~/helpers/env";

async function bootstrap() {
  await import("~/routes/get-todo-by-id");
  await import("~/routes/get-todos");
  await import("~/routes/update-todo");
  await import("~/routes/delete-todo");
  await import("~/routes/get-tasks");
  await import("~/routes/auth-signup");
  await import("~/routes/auth-signin");
  await import("~/routes/create-todo");

  app.route("/", authApp);

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Server is running`, info);
  });
}

bootstrap().catch(console.log);
