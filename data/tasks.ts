import { createTaskStore, type TaskStore } from "./task-store";

const SEED_COUNT = 25;

function seed(store: TaskStore) {
  for (let i = 1; i <= SEED_COUNT; i++) {
    store.create({
      title: `Sample task ${i}`,
      description:
        i % 3 === 0 ? undefined : `Fictional description for sample task ${i}.`,
    });
  }
  return store;
}

// In Next.js development mode, Fast Refresh may re-evaluate modules in separate bundles
// (e.g. Server Components vs API Route Handlers). Binding the singleton to globalThis
// ensures both environments access the identical in-memory task store.
const globalForTasks = globalThis as unknown as { __taskStore?: TaskStore };

export const taskStore: TaskStore = (globalForTasks.__taskStore ??=
  seed(createTaskStore()));
