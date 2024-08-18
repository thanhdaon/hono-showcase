import { createRoute, z } from "@hono/zod-openapi";
import { app } from "~/app";
import { db } from "~/db/db";
import { createSuccessResponseSchema, TodoSchema } from "~/openapi-schemas";

const route = createRoute({
  tags: ["todos"],
  method: "get",
  path: "/todos",
  request: {
    query: z.object({
      sort: z.enum(["id", "title", "category"]).default("id"),
      direction: z.enum(["asc", "desc"]).default("asc"),
      page: z.coerce.number().gt(0).default(1),
      pageSize: z.coerce.number().gt(0).default(5),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(TodoSchema.array()),
        },
      },
      description: "Retrieve the all todos",
    },
  },
});

app.openapi(route, async (c) => {
  const { page, pageSize, sort, direction } = c.req.valid("query");

  const records = await db.query.todos.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: (fields, operators) => {
      return [
        operators[direction](fields[sort]),
        operators[direction](fields.id),
      ];
    },
  });

  return c.json({ data: records }, 200);
});
