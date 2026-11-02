import { initTRPC } from "@trpc/server";
import { z, ZodError } from "zod";
import { taskStore } from "@/data/tasks";
import type { TaskStore } from "@/data/task-store";

// Data store is injected into the context to decouple route definitions from the storage layer.
// This makes it straightforward to supply clean, isolated store instances during tests.
export type TRPCContext = { tasks: TaskStore };

export const createTRPCContext = async (): Promise<TRPCContext> => ({
  tasks: taskStore,
});

const t = initTRPC.context<TRPCContext>().create({
  // Flatten Zod validation errors so the client can map field error messages directly
  // to form inputs without traversing deep error structures.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
