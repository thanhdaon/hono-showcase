import { z } from "@hono/zod-openapi";
import { labels, priorities, statuses } from "~/db/schema";

export function createSuccessResponseSchema<T>(schema: z.ZodType<T>) {
  return z.object({ data: schema });
}

export function createPaginationResponseSchema<T>(schema: z.ZodType<T>) {
  return z.object({ data: schema, total: z.number().gte(0) });
}

export const TodoSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    category: z.string(),
    done: z.boolean(),
  })
  .openapi("Todo");

export const TaskSchema = z
  .object({
    id: z.number(),
    code: z.string(),
    title: z.string().nullable(),
    status: z.enum(statuses),
    label: z.enum(labels),
    priority: z.enum(priorities),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
  })
  .openapi("Task");

export const NotifySuccessSchema = z.object({
  data: z.string(),
});

export const ErrorSchema = z
  .object({
    code: z.number(),
    error: z.string(),
  })
  .openapi("Error");
