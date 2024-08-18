import { createRoute, z } from "@hono/zod-openapi";
import { generateId } from "lucia";
import { app } from "~/app";
import { users } from "~/db/schema";
import {
  createSuccessResponseSchema,
  ErrorSchema,
  UserSchema,
} from "~/openapi-schemas";
import { Argon2id } from "oslo/password";
import { db } from "~/db/db";
import { auth } from "~/auth/auth";

const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signup",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string().min(3),
            password: z.string().min(3),
          }),
        },
      },
      description: "User sign-up inputs",
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(UserSchema),
        },
      },
      description: "User signs up success",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "User already exists",
    },
  },
});

app.openapi(route, async (c) => {
  const { username, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where: (fields, { eq }) => {
      return eq(fields.username, username);
    },
  });

  if (user) {
    return c.json({ code: 400, error: `user ${username} already exists` }, 400);
  }

  const userId = generateId(15);
  const argon2id = new Argon2id();
  const hashedPassword = await argon2id.hash(password);

  await db.insert(users).values({
    id: userId,
    username,
    hashedPassword,
  });

  const session = await auth.createSession(userId, {});
  const sessionCookie = auth.createSessionCookie(session.id);

  c.header("Set-Cookie", sessionCookie.serialize(), { append: true });
  return c.json({ data: { id: userId, username } }, 201);
});
