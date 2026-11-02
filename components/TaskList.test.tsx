import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/task";
import { TaskList } from "./TaskList";

const mocks = vi.hoisted(() => ({
  infiniteQueryResult: {
    data: undefined as
      | { pages: Array<{ items: Task[]; nextCursor?: number }> }
      | undefined,
    status: "success" as "pending" | "error" | "success",
    error: null as Error | null,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  },
  deleteMutate: vi.fn(),
  deleteIsPending: false,
  deleteVariables: undefined as { id: string } | undefined,
  paginationOptions: undefined as
    | {
        getNextPageParam: (page: { nextCursor?: number }) => number | undefined;
      }
    | undefined,
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: () => mocks.infiniteQueryResult,
}));

vi.mock("@/lib/trpc/client", () => ({
  useTRPC: () => ({
    task: {
      list: {
        infiniteQueryOptions: (
          _input: unknown,
          options: {
            getNextPageParam: (page: {
              nextCursor?: number;
            }) => number | undefined;
          },
        ) => {
          mocks.paginationOptions = options;
          return { queryKey: ["task", "list"] };
        },
      },
    },
  }),
}));

vi.mock("@/hooks/useTaskMutations", () => ({
  useDeleteTask: () => ({
    mutate: mocks.deleteMutate,
    isPending: mocks.deleteIsPending,
    variables: mocks.deleteVariables,
  }),
}));

vi.mock("@/hooks/useOnIntersect", () => ({
  useOnIntersect: () => ({ current: null }),
}));

const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "First task",
    description: "Description 1",
    createdAt: Date.UTC(2026, 10, 1, 10, 0),
  },
  {
    id: "task-2",
    title: "Second task",
    description: "Description 2",
    createdAt: Date.UTC(2026, 10, 1, 11, 0),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.infiniteQueryResult = {
    data: { pages: [{ items: sampleTasks, nextCursor: undefined }] },
    status: "success",
    error: null,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  };
  mocks.deleteIsPending = false;
  mocks.deleteVariables = undefined;
});

describe("TaskList", () => {
  it("renders loading skeleton when status is pending", () => {
    mocks.infiniteQueryResult.status = "pending";
    mocks.infiniteQueryResult.data = undefined;

    render(<TaskList />);

    expect(
      screen.getByRole("status", { name: /loading tasks/i }),
    ).toBeInTheDocument();
  });

  it("renders error state with retry button when query fails", async () => {
    mocks.infiniteQueryResult.status = "error";
    mocks.infiniteQueryResult.error = new Error("Failed to load");
    mocks.infiniteQueryResult.data = undefined;

    render(<TaskList />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();

    await userEvent.click(retryBtn);
    expect(mocks.infiniteQueryResult.refetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when there are no tasks", () => {
    mocks.infiniteQueryResult.data = {
      pages: [{ items: [], nextCursor: undefined }],
    };

    render(<TaskList />);

    expect(
      screen.getByRole("heading", { name: /no tasks yet/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /new task/i })).toHaveLength(2);
  });

  it("renders list of tasks with cards", () => {
    render(<TaskList />);

    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
    expect(screen.getByText("No more tasks.")).toBeInTheDocument();
  });

  it("uses each page cursor to determine the next page", () => {
    render(<TaskList />);

    expect(mocks.paginationOptions?.getNextPageParam({ nextCursor: 42 })).toBe(
      42,
    );
    expect(
      mocks.paginationOptions?.getNextPageParam({ nextCursor: undefined }),
    ).toBeUndefined();
  });

  it("renders load more button and handles click when hasNextPage is true", async () => {
    mocks.infiniteQueryResult.hasNextPage = true;

    render(<TaskList />);

    const loadMoreBtn = screen.getByRole("button", { name: /load more/i });
    expect(loadMoreBtn).toBeInTheDocument();

    await userEvent.click(loadMoreBtn);
    expect(mocks.infiniteQueryResult.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("shows loading state while fetching the next page", () => {
    mocks.infiniteQueryResult.hasNextPage = true;
    mocks.infiniteQueryResult.isFetchingNextPage = true;

    render(<TaskList />);

    expect(screen.getByText("Loading more tasks…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Tasks" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("marks the matching task as deleting", () => {
    mocks.deleteIsPending = true;
    mocks.deleteVariables = { id: "task-1" };

    render(<TaskList />);

    expect(
      screen.getByRole("button", { name: "Delete task: First task" }),
    ).toHaveTextContent("Deleting…");
    expect(
      screen.getByRole("button", { name: "Delete task: Second task" }),
    ).toHaveTextContent("Delete");
  });

  it("opens delete confirmation dialog and triggers deletion on confirm", async () => {
    render(<TaskList />);

    // Click delete button on the first task card
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete task:/i,
    });
    await userEvent.click(deleteButtons[0]!);

    // Confirm dialog should be open
    expect(
      screen.getByRole("heading", { name: "Delete task?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/"First task" will be permanently deleted/i),
    ).toBeInTheDocument();

    // Confirm delete
    const confirmButton = screen.getByRole("button", { name: "Delete" });
    await userEvent.click(confirmButton);

    expect(mocks.deleteMutate).toHaveBeenCalledWith({ id: "task-1" });
  });

  it("cancels deletion when cancel is clicked in confirm dialog", async () => {
    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete task:/i,
    });
    await userEvent.click(deleteButtons[0]!);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);

    expect(mocks.deleteMutate).not.toHaveBeenCalled();
  });

  it("ignores confirmation when no task is selected", () => {
    const { container } = render(<TaskList />);
    const confirmButton = container.querySelector<HTMLButtonElement>(
      "dialog button:last-child",
    );

    confirmButton?.click();

    expect(mocks.deleteMutate).not.toHaveBeenCalled();
  });

  it("renders the empty state when successful data is undefined", () => {
    mocks.infiniteQueryResult.data = undefined;

    render(<TaskList />);

    expect(
      screen.getByRole("heading", { name: /no tasks yet/i }),
    ).toBeInTheDocument();
  });
});
