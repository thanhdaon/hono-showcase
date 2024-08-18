import { createRoute, z } from "@hono/zod-openapi";
import { Argon2id } from "oslo/password";
import { app } from "~/app";
import { auth } from "~/auth/auth";
import { db } from "~/db/db";
import {
  createSuccessResponseSchema,
  ErrorSchema,
  UserSchema,
} from "~/openapi-schemas";

const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signin",
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
      description: "User sign-in inputs",
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(UserSchema),
        },
      },
      description: "User signs in success",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Signin failed",
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
    const argon2id = new Argon2id();
    const match = await argon2id.verify(user.hashedPassword, password);

    if (match) {
      const session = await auth.createSession(user.id, {});
      const sessionCookie = auth.createSessionCookie(session.id);
      c.header("Set-Cookie", sessionCookie.serialize(), { append: true });
      return c.json({ data: { username: user.username, id: user.id } }, 200);
    }

    return c.json({ code: 400, error: `user ${username} already exists` }, 400);
  }

  return c.json({ code: 400, error: `User ${username} not found` }, 400);
});
