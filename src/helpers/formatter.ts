import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  const firstError = error.errors.at(0);

  if (firstError === undefined) {
    return "Unexpected";
  }

  return `(${firstError.path.join("->")}) ${firstError.message}`;
}
