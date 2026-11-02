import { z } from "zod";

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export const taskIdSchema = z
  .string({ error: "Task id is required" })
  .uuid("Invalid task id");

// The Zod schema is shared between frontend forms and the backend router.
// Trimming input and mapping empty strings to undefined guarantees that blank descriptions
// are not stored as whitespace strings in backend storage.
export const taskFieldsSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(
      TITLE_MAX_LENGTH,
      `Title must have at most ${TITLE_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description must have at most ${DESCRIPTION_MAX_LENGTH} characters`,
    )
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const createTaskInput = taskFieldsSchema;
export const updateTaskInput = taskFieldsSchema.extend({ id: taskIdSchema });
export const taskIdInput = z.object({ id: taskIdSchema });

export const listTasksInput = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  cursor: z.number().int().nullish(),
});

export type TaskFields = z.output<typeof taskFieldsSchema>;

export type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
};
