import { TRPCClientError } from "@trpc/client";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

function serverError(message: string, data: Record<string, unknown>) {
  return TRPCClientError.from({
    error: { message, code: -32600, data },
  } as never);
}

describe("getErrorMessage", () => {
  it("returns the first field validation message", () => {
    const error = serverError("raw zod json", {
      code: "BAD_REQUEST",
      httpStatus: 400,
      zodError: {
        formErrors: [],
        fieldErrors: { title: ["Title is required"] },
      },
    });

    expect(getErrorMessage(error)).toBe("Title is required");
  });

  it("prefers form level validation messages", () => {
    const error = serverError("raw", {
      code: "BAD_REQUEST",
      httpStatus: 400,
      zodError: {
        formErrors: ["Invalid payload"],
        fieldErrors: { title: ["Title is required"] },
      },
    });

    expect(getErrorMessage(error)).toBe("Invalid payload");
  });

  it("returns the server message when there is no validation detail", () => {
    const error = serverError("Task was not found.", {
      code: "NOT_FOUND",
      httpStatus: 404,
      zodError: null,
    });

    expect(getErrorMessage(error)).toBe("Task was not found.");
  });

  it("explains network failures", () => {
    const error = TRPCClientError.from(new TypeError("Failed to fetch"));

    expect(getErrorMessage(error)).toMatch(/could not reach the server/i);
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(getErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again.",
    );
    expect(getErrorMessage("boom")).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
