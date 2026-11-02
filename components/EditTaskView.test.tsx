import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/task";
import { EditTaskView } from "./EditTaskView";

const mocks = vi.hoisted(() => ({
  queryResult: {
    data: undefined as Task | undefined,
    status: "success" as "pending" | "error" | "success",
    error: null as Error | null,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => mocks.queryResult,
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/trpc/client", () => ({
  useTRPC: () => ({
    task: {
      byId: {
        queryOptions: (input: { id: string }) => ({
          queryKey: ["task", "byId", input.id],
        }),
      },
      pathFilter: () => ({ queryKey: ["task"] }),
      create: { mutationOptions: (opts: object) => opts },
      update: { mutationOptions: (opts: object) => opts },
    },
  }),
}));

describe("EditTaskView", () => {
  it("renders loading spinner while task is pending", () => {
    mocks.queryResult = {
      data: undefined,
      status: "pending",
      error: null,
    };

    render(<EditTaskView id="task-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading task…");
  });

  it("renders error alert with back link if task fetch fails", () => {
    mocks.queryResult = {
      data: undefined,
      status: "error",
      error: new Error("Task not found"),
    };

    render(<EditTaskView id="missing-id" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to tasks" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders TaskForm pre-filled with the loaded task", () => {
    mocks.queryResult = {
      data: {
        id: "task-1",
        title: "Loaded Task Title",
        description: "Loaded Task Description",
        createdAt: Date.now(),
      },
      status: "success",
      error: null,
    };

    render(<EditTaskView id="task-1" />);

    expect(screen.getByLabelText("Title")).toHaveValue("Loaded Task Title");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Loaded Task Description",
    );
  });
});
