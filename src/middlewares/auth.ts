import { createMiddleware } from "hono/factory";
import { auth } from "~/auth/auth";

export const requireAuth = createMiddleware(async (c, next) => {
  const sessionId = auth.readSessionCookie(c.req.header("Cookie") ?? "");
  if (sessionId === null) {
    return c.json({ code: 401, error: "unauthorized" }, 401);
  }

  const { session, user } = await auth.validateSession(sessionId);

  if (user && session) {
    c.header("Set-Cookie", auth.createSessionCookie(session.id).serialize(), {
      append: true,
    });

    c.set("user", user);
    c.set("session", session);
    await next();
    return;
  }

  c.header("Set-Cookie", auth.createBlankSessionCookie().serialize(), {
    append: true,
  });
  return c.json({ code: 401, error: "unauthorized" }, 401);
});
