import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  createTaskInput,
  listTasksInput,
  taskFieldsSchema,
  taskIdInput,
  updateTaskInput,
} from "./task";

const validId = "3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b";

describe("taskFieldsSchema", () => {
  it("accepts a title without description", () => {
    const result = taskFieldsSchema.safeParse({ title: "Buy milk" });

    expect(result.success).toBe(true);
  });

  it("trims the title and the description", () => {
    const result = taskFieldsSchema.parse({
      title: "  Buy milk  ",
      description: "  2 liters ",
    });

    expect(result).toEqual({ title: "Buy milk", description: "2 liters" });
  });

  it.each([undefined, "", "   "])(
    "turns description %j into undefined",
    (description) => {
      expect(
        taskFieldsSchema.parse({ title: "x", description }).description,
      ).toBeUndefined();
    },
  );

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["blank", "   "],
  ])("rejects a %s title", (_name, title) => {
    const result = taskFieldsSchema.safeParse({ title });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toEqual([
      "Title is required",
    ]);
  });

  it("rejects a title over the limit", () => {
    const result = taskFieldsSchema.safeParse({
      title: "a".repeat(TITLE_MAX_LENGTH + 1),
    });

    expect(result.error?.flatten().fieldErrors.title?.[0]).toContain(
      String(TITLE_MAX_LENGTH),
    );
  });

  it("rejects a description over the limit", () => {
    const result = taskFieldsSchema.safeParse({
      title: "x",
      description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1),
    });

    expect(result.error?.flatten().fieldErrors.description?.[0]).toContain(
      String(DESCRIPTION_MAX_LENGTH),
    );
  });

  it("is reused by the create input", () => {
    expect(createTaskInput.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("updateTaskInput", () => {
  it("requires a valid uuid", () => {
    const result = updateTaskInput.safeParse({ id: "123", title: "x" });

    expect(result.error?.flatten().fieldErrors.id).toEqual(["Invalid task id"]);
  });

  it("accepts a valid payload", () => {
    expect(updateTaskInput.safeParse({ id: validId, title: "x" }).success).toBe(
      true,
    );
  });
});

describe("taskIdInput", () => {
  it("rejects a malformed id", () => {
    expect(taskIdInput.safeParse({ id: "nope" }).success).toBe(false);
  });
});

describe("listTasksInput", () => {
  it("applies the default limit", () => {
    expect(listTasksInput.parse({}).limit).toBe(10);
  });

  it("accepts a null cursor", () => {
    expect(listTasksInput.safeParse({ cursor: null }).success).toBe(true);
  });

  it.each([0, 51, 1.5])("rejects limit %s", (limit) => {
    expect(listTasksInput.safeParse({ limit }).success).toBe(false);
  });
});
