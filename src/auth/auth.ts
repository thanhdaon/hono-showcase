import { Lucia } from "lucia";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "~/db/db";
import { sessions, users } from "~/db/schema";

const adapter = new DrizzleMySQLAdapter(db, sessions, users);

export const auth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: false,
    },
  },
  getUserAttributes: (dbUser) => {
    return { username: dbUser.username };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  hashedPassword: string;
}
