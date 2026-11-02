import { afterEach, describe, expect, it, vi } from "vitest";
import { createTaskStore } from "./task-store";

afterEach(() => vi.restoreAllMocks());

describe("createTaskStore", () => {
  it("creates a task with a generated id and timestamp", () => {
    const store = createTaskStore();
    const task = store.create({
      title: "Write report",
      description: "Q4 numbers",
    });

    expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(task.title).toBe("Write report");
    expect(task.description).toBe("Q4 numbers");
    expect(task.createdAt).toBeGreaterThan(0);
    expect(store.get(task.id)).toEqual(task);
  });

  it("keeps createdAt strictly increasing within the same millisecond", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    const store = createTaskStore();

    const timestamps = [1, 2, 3].map(
      (n) =>
        store.create({ title: `Task ${n}`, description: undefined }).createdAt,
    );

    expect(timestamps).toEqual([1_000, 1_001, 1_002]);
  });

  it("lists tasks newest first", () => {
    const store = createTaskStore();
    store.create({ title: "first", description: undefined });
    store.create({ title: "second", description: undefined });

    expect(store.list({ limit: 10 }).items.map((task) => task.title)).toEqual([
      "second",
      "first",
    ]);
  });

  it("returns no cursor when everything fits in one page", () => {
    const store = createTaskStore();
    store.create({ title: "only", description: undefined });

    expect(store.list({ limit: 10 }).nextCursor).toBeUndefined();
  });

  it("paginates through all tasks without gaps or duplicates", () => {
    const store = createTaskStore();
    for (let i = 1; i <= 25; i++)
      store.create({ title: `Task ${i}`, description: undefined });

    const seen: string[] = [];
    let cursor: number | undefined;
    let pages = 0;
    do {
      const page = store.list({ limit: 10, cursor });
      seen.push(...page.items.map((task) => task.title));
      cursor = page.nextCursor;
      pages++;
    } while (cursor !== undefined);

    expect(pages).toBe(3);
    expect(seen).toHaveLength(25);
    expect(new Set(seen).size).toBe(25);
    expect(seen[0]).toBe("Task 25");
    expect(seen[24]).toBe("Task 1");
  });

  it("keeps a cursor valid after the task it points to is deleted", () => {
    const store = createTaskStore();
    for (let i = 1; i <= 5; i++)
      store.create({ title: `Task ${i}`, description: undefined });

    const firstPage = store.list({ limit: 2 });
    const lastSeen = firstPage.items[1]!;
    store.remove(lastSeen.id);
    const secondPage = store.list({ limit: 2, cursor: firstPage.nextCursor });

    expect(secondPage.items.map((task) => task.title)).toEqual([
      "Task 3",
      "Task 2",
    ]);
  });

  it("updates title and description and keeps id and createdAt", () => {
    const store = createTaskStore();
    const original = store.create({ title: "old", description: "details" });

    const updated = store.update(original.id, {
      title: "new",
      description: undefined,
    });

    expect(updated).toEqual({
      id: original.id,
      createdAt: original.createdAt,
      title: "new",
      description: undefined,
    });
    expect(store.get(original.id)?.title).toBe("new");
  });

  it("returns undefined when updating an unknown task", () => {
    const store = createTaskStore();

    expect(
      store.update("missing", { title: "x", description: undefined }),
    ).toBeUndefined();
  });

  it("removes an existing task and reports unknown ones", () => {
    const store = createTaskStore();
    const task = store.create({ title: "temp", description: undefined });

    expect(store.remove(task.id)).toBe(true);
    expect(store.get(task.id)).toBeUndefined();
    expect(store.remove(task.id)).toBe(false);
  });

  it("continues timestamps after initial tasks", () => {
    const futureTimestamp = Date.now() + 10_000;
    const store = createTaskStore([
      { id: "a", title: "seed", createdAt: futureTimestamp },
    ]);
    const created = store.create({ title: "next", description: undefined });

    expect(created.createdAt).toBeGreaterThan(futureTimestamp);
  });
});
