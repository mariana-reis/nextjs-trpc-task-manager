import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { describe, expect, it } from "vitest";
import type { AppRouter } from "@/server/api/root";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

function createClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost/api/trpc",
        fetch: (input, init) =>
          fetchRequestHandler({
            endpoint: "/api/trpc",
            req: new Request(input, init),
            router: appRouter,
            createContext: createTRPCContext,
          }),
      }),
    ],
  });
}

describe("tRPC context and error formatting", () => {
  it("injects the task store into request context", async () => {
    const context = await createTRPCContext();
    expect(context.tasks).toBeDefined();
  });

  it("flattens Zod errors into field errors", async () => {
    await expect(
      createClient().task.create.mutate({ title: "" }),
    ).rejects.toMatchObject({
      data: {
        zodError: { fieldErrors: { title: ["Title is required"] } },
      },
    });
  });

  it("leaves non-Zod errors without validation details", async () => {
    await expect(
      createClient().task.delete.mutate({
        id: "3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6c",
      }),
    ).rejects.toMatchObject({
      data: { code: "NOT_FOUND", zodError: null },
    });
  });
});
