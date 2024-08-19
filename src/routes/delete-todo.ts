import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { app } from "~/apps";
import { db } from "~/db/db";
import { todos } from "~/db/schema";
import { NotifySuccessSchema, TodoSchema } from "~/openapi-schemas";

const route = createRoute({
  tags: ["todos"],
  method: "delete",
  path: "/todos/{id}",
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NotifySuccessSchema,
        },
      },
      description: "Todo updated",
    },
  },
});

app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  await db.delete(todos).where(eq(todos.id, id));
  return c.json({ data: `todo with id ${id} deleted` }, 200);
});
