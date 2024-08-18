import { createRoute, z } from "@hono/zod-openapi";
import { count, SQL } from "drizzle-orm";
import { app } from "~/app";
import { db } from "~/db/db";
import { tasks } from "~/db/schema";
import { sleep } from "~/helpers/time";
import { createPaginationResponseSchema, TaskSchema } from "~/openapi-schemas";

const sortableFields = [
  "id",
  "code",
  "title",
  "status",
  "label",
  "priority",
  "createdAt",
  "updatedAt",
] as const;

const directions = ["asc", "desc"] as const;

const route = createRoute({
  tags: ["tasks"],
  method: "get",
  path: "/tasks",
  request: {
    query: z.object({
      title: z.string().optional(),
      status: z.string().optional(),
      sort: z.enum(sortableFields).default("id"),
      direction: z.enum(directions).default("asc"),
      page: z.coerce.number().gt(0).default(1),
      pageSize: z.coerce.number().gt(0).default(5),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createPaginationResponseSchema(TaskSchema.array()),
        },
      },
      description: "Get tasks",
    },
  },
});

app.openapi(route, async (c) => {
  const { page, pageSize, sort, direction, title, status } =
    c.req.valid("query");

  await sleep(1000);
  const records = await db.query.tasks.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    where(fields, { like, and, inArray }) {
      const filters: SQL[] = [];

      if (title) {
        filters.push(like(fields.title, `%${title}%`));
      }

      if (status) {
        filters.push(inArray(fields.status, status.split(".") as any));
      }

      return filters.length > 0 ? and(...filters) : undefined;
    },
    orderBy: (fields, operators) => {
      return [
        operators[direction](fields[sort]),
        operators[direction](fields.id),
      ];
    },
  });

  const [{ total }] = await db.select({ total: count() }).from(tasks);

  return c.json({ data: records, total }, 200);
});
