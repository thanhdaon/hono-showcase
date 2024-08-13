import { faker } from "@faker-js/faker";
import "dotenv/config";

import { db } from "~/db/db";
import { labels, priorities, statuses, tasks, todos } from "~/db/schema";

type Todo = typeof todos.$inferInsert;
type Task = typeof tasks.$inferInsert;

async function seed() {
  await db.delete(todos);
  await db.delete(tasks);

  await db.insert(todos).values(generateTodos(1000));
  await db.insert(tasks).values(generateTasks(10000));
}

function generateTodos(count: number): Todo[] {
  const generate = (): Todo => ({
    title: faker.lorem.words(3),
    category: faker.lorem.word(),
  });

  return faker.helpers.multiple(generate, { count });
}

function generateTasks(count: number): Task[] {
  const generate = (): Task => ({
    code: faker.string.nanoid(8),
    title: faker.lorem.words(3),
    status: faker.helpers.arrayElement(statuses),
    label: faker.helpers.arrayElement(labels),
    priority: faker.helpers.arrayElement(priorities),
  });

  return faker.helpers.multiple(generate, { count });
}

seed()
  .then(() => {
    console.log("Seed data done!");
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    process.exit(0);
  });
