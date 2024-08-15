import { createMiddleware } from "hono/factory";
import { Session, User } from "lucia";
import { auth } from "~/auth/auth";

export const requireAuth = createMiddleware(async (c, next) => {
  const sessionId = auth.readSessionCookie(c.req.header("Cookie") ?? "");
  if (sessionId === null) {
    return c.json({ code: 401, error: "unauthorized" }, 401);
  }

  const { session, user } = await auth.validateSession(sessionId);

  if (user && session && session.fresh) {
    c.header("Set-Cookie", auth.createSessionCookie(session.id).serialize(), {
      append: true,
    });

    c.set("user", user);
    c.set("session", session);
    await next();
  }

  c.header("Set-Cookie", auth.createBlankSessionCookie().serialize(), {
    append: true,
  });
  return c.json({ code: 401, error: "unauthorized" }, 401);
});
