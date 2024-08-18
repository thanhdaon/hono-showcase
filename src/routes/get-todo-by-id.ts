import { createRoute, z } from "@hono/zod-openapi";
import { app } from "~/app";
import { db } from "~/db/db";
import {
  createSuccessResponseSchema,
  ErrorSchema,
  TodoSchema,
} from "~/openapi-schemas";

const route = createRoute({
  tags: ["todos"],
  method: "get",
  path: "/todos/{id}",
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(TodoSchema),
        },
      },
      description: "Get Todo by id",
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
  const { id } = c.req.valid("param");

  const todo = await db.query.todos.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.id, id);
    },
  });

  if (todo) {
    return c.json({ data: todo }, 200);
  }

  return c.json({ code: 404, error: `todo with id ${id} not found` }, 404);
});
