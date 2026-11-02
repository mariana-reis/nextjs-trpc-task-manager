import { TRPCError } from "@trpc/server";
import {
  createTaskInput,
  listTasksInput,
  taskIdInput,
  updateTaskInput,
} from "@/types/task";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Centralized 404 helper to standardize error messages across byId, update, and delete,
// ensuring the client always receives a consistent tRPC NOT_FOUND error code.
function notFound(id: string) {
  return new TRPCError({
    code: "NOT_FOUND",
    message: `Task "${id}" was not found. It may have been deleted.`,
  });
}

export const taskRouter = createTRPCRouter({
  // Using cursor-based pagination (by createdAt) instead of traditional offset/limit.
  // With frequent task creations and deletions, cursor pagination prevents skipped
  // or duplicated items during infinite scrolling.
  list: publicProcedure
    .input(listTasksInput)
    .query(({ ctx, input }) => ctx.tasks.list(input)),

  // Dedicated endpoint for SSR prefetching on the edit screen,
  // avoiding the overhead of fetching the entire task collection.
  byId: publicProcedure.input(taskIdInput).query(({ ctx, input }) => {
    const task = ctx.tasks.get(input.id);
    if (!task) throw notFound(input.id);
    return task;
  }),

  create: publicProcedure
    .input(createTaskInput)
    .mutation(({ ctx, input }) => ctx.tasks.create(input)),

  update: publicProcedure.input(updateTaskInput).mutation(({ ctx, input }) => {
    const { id, ...fields } = input;
    const task = ctx.tasks.update(id, fields);
    if (!task) throw notFound(id);
    return task;
  }),

  delete: publicProcedure.input(taskIdInput).mutation(({ ctx, input }) => {
    if (!ctx.tasks.remove(input.id)) throw notFound(input.id);
    return { id: input.id };
  }),
});
