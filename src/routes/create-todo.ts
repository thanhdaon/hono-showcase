import { createRoute, z } from "@hono/zod-openapi";
import { app } from "~/app";
import { todos } from "~/db/schema";
import {
  createSuccessResponseSchema,
  ErrorSchema,
  TodoSchema,
} from "~/openapi-schemas";

const route = createRoute({
  tags: ["todos"],
  method: "post",
  path: "/todos",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(3),
            category: z.string().min(3),
          }),
        },
      },
      description: "Todo create inputs",
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(TodoSchema),
        },
      },
      description: "Todo created",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Todo not found",
    },
  },
});

app.openapi(route, async (c) => {
  const { title, category } = c.req.valid("json");

  const [{ id }] = await c.var.db
    .insert(todos)
    .values({ title, category })
    .$returningId();

  const todo = await c.var.db.query.todos.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (todo === undefined) {
    return c.json({ code: 404, error: `todo with id ${id} not found` }, 404);
  }

  return c.json({ data: todo }, 201);
});
