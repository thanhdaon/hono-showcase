import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { app } from "~/apps";
import { db } from "~/db/db";
import { todos } from "~/db/schema";
import { TodoSchema } from "~/openapi-schemas";

const route = createRoute({
  tags: ["todos"],
  method: "put",
  path: "/todos/{id}",
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(3).optional(),
            category: z.string().min(3).optional(),
            done: z.boolean().optional(),
          }),
        },
      },
      description: "Todo update inputs",
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
      description: "Todo updated",
    },
  },
});

app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  const { title, category, done } = c.req.valid("json");

  await db.update(todos).set({ title, category, done }).where(eq(todos.id, id));

  const todo = await db.query.todos.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  return c.json(todo, 200);
});
