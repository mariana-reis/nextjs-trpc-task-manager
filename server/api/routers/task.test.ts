import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTaskStore } from "@/data/task-store";
import { appRouter } from "../root";

function setup() {
  return appRouter.createCaller({ tasks: createTaskStore() });
}

describe("task router", () => {
  describe("create", () => {
    it("creates a task and returns it", async () => {
      const api = setup();

      const task = await api.task.create({
        title: "  Write tests  ",
        description: "Vitest",
      });

      expect(task).toMatchObject({
        title: "Write tests",
        description: "Vitest",
      });
      expect(await api.task.byId({ id: task.id })).toEqual(task);
    });

    it.each(["", "   "])("rejects title %j with BAD_REQUEST", async (title) => {
      await expect(setup().task.create({ title })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });

  describe("byId", () => {
    it("throws NOT_FOUND for an unknown task", async () => {
      await expect(
        setup().task.byId({ id: randomUUID() }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("throws BAD_REQUEST for a malformed id", async () => {
      await expect(setup().task.byId({ id: "abc" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });

  describe("update", () => {
    it("updates an existing task", async () => {
      const api = setup();
      const task = await api.task.create({
        title: "old",
        description: "keep?",
      });

      const updated = await api.task.update({ id: task.id, title: "new" });

      expect(updated).toMatchObject({
        id: task.id,
        title: "new",
      });
      expect(updated).not.toHaveProperty("description");
    });

    it("throws NOT_FOUND for an unknown task", async () => {
      await expect(
        setup().task.update({ id: randomUUID(), title: "x" }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("rejects an empty title", async () => {
      const api = setup();
      const task = await api.task.create({ title: "ok" });

      await expect(
        api.task.update({ id: task.id, title: " " }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });
  });

  describe("delete", () => {
    it("deletes a task", async () => {
      const api = setup();
      const task = await api.task.create({ title: "temp" });

      await expect(api.task.delete({ id: task.id })).resolves.toEqual({
        id: task.id,
      });
      await expect(api.task.byId({ id: task.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("throws NOT_FOUND when deleting twice", async () => {
      const api = setup();
      const task = await api.task.create({ title: "temp" });
      await api.task.delete({ id: task.id });

      await expect(api.task.delete({ id: task.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("throws BAD_REQUEST for a malformed id", async () => {
      await expect(setup().task.delete({ id: "1" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });

  describe("list", () => {
    it("returns an empty page for a new store", async () => {
      await expect(setup().task.list({})).resolves.toEqual({
        items: [],
        nextCursor: undefined,
      });
    });

    it("pages through tasks using the returned cursor", async () => {
      const api = setup();
      for (let i = 1; i <= 7; i++)
        await api.task.create({ title: `Task ${i}` });

      const first = await api.task.list({ limit: 5 });
      const second = await api.task.list({
        limit: 5,
        cursor: first.nextCursor,
      });

      expect(first.items).toHaveLength(5);
      expect(first.nextCursor).toBeDefined();
      expect(second.items.map((task) => task.title)).toEqual([
        "Task 2",
        "Task 1",
      ]);
      expect(second.nextCursor).toBeUndefined();
    });

    it("rejects a limit above the maximum", async () => {
      await expect(setup().task.list({ limit: 500 })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });
});
