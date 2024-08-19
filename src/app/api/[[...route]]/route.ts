import("~/routes/get-todo-by-id");
import("~/routes/get-todos");
import("~/routes/update-todo");
import("~/routes/delete-todo");
import("~/routes/get-tasks");
import("~/routes/create-todo");

import { handle } from "hono/vercel";
import { app } from "~/apps";

export const runtime = "edge";

export const GET = handle(app);
export const POST = handle(app);
