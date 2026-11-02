import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/task";
import { useDeleteTask, useSaveTask } from "./useTaskMutations";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));

vi.mock("@/lib/trpc/client", () => ({
  useTRPC: () => ({
    task: {
      pathFilter: () => ({ queryKey: ["task"] }),
      create: {
        mutationOptions: (options: object) => ({
          ...options,
          mutationFn: mocks.create,
        }),
      },
      update: {
        mutationOptions: (options: object) => ({
          ...options,
          mutationFn: mocks.update,
        }),
      },
      delete: {
        mutationOptions: (options: object) => ({
          ...options,
          mutationFn: mocks.delete,
        }),
      },
    },
  }),
}));

function renderMutationHook<T>(callback: () => T) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(callback, { wrapper });

  return { ...hook, invalidateQueries };
}

const task: Task = {
  id: "3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b",
  title: "Existing task",
  createdAt: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.update.mockResolvedValue({});
  mocks.delete.mockResolvedValue({});
});

describe("useSaveTask", () => {
  it("creates a task, invalidates the list, and navigates back", async () => {
    const { result, invalidateQueries } = renderMutationHook(() =>
      useSaveTask(),
    );

    await act(async () => {
      result.current.save({ title: "New task", description: undefined });
    });

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.create.mock.calls[0]?.[0]).toEqual({
      title: "New task",
      description: undefined,
    });
    expect(mocks.success).toHaveBeenCalledWith("Task created");
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["task"] });
    expect(result.current.isPending).toBe(false);
  });

  it("updates an existing task", async () => {
    const { result } = renderMutationHook(() => useSaveTask(task));

    await act(async () => {
      result.current.save({ title: "Updated task", description: undefined });
    });

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.update.mock.calls[0]?.[0]).toEqual({
      id: task.id,
      title: "Updated task",
      description: undefined,
    });
    expect(mocks.success).toHaveBeenCalledWith("Task updated");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("exposes mutation errors and clears them when saving again", async () => {
    mocks.create.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderMutationHook(() => useSaveTask());

    act(() => {
      result.current.save({ title: "New task", description: undefined });
    });

    await waitFor(() =>
      expect(result.current.error).toBe(
        "Something went wrong. Please try again.",
      ),
    );
    expect(mocks.error).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );

    await act(async () => {
      result.current.save({ title: "Retry", description: undefined });
    });
    expect(result.current.error).toBeNull();
  });

  it("reports pending state for either mutation", async () => {
    let finishCreate!: () => void;
    mocks.create.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishCreate = () => resolve({});
        }),
    );
    const createHook = renderMutationHook(() => useSaveTask());

    act(() => {
      createHook.result.current.save({
        title: "New task",
        description: undefined,
      });
    });
    await waitFor(() => expect(createHook.result.current.isPending).toBe(true));

    await act(async () => finishCreate());
    await waitFor(() =>
      expect(createHook.result.current.isPending).toBe(false),
    );

    let finishUpdate!: () => void;
    mocks.update.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishUpdate = () => resolve({});
        }),
    );
    const updateHook = renderMutationHook(() => useSaveTask(task));

    act(() => {
      updateHook.result.current.save({
        title: "Updated task",
        description: undefined,
      });
    });
    await waitFor(() => expect(updateHook.result.current.isPending).toBe(true));

    await act(async () => finishUpdate());
    await waitFor(() =>
      expect(updateHook.result.current.isPending).toBe(false),
    );
  });
});

describe("useDeleteTask", () => {
  it("shows success and invalidates the task list", async () => {
    const { result, invalidateQueries } = renderMutationHook(() =>
      useDeleteTask(),
    );

    await act(async () => {
      result.current.mutate({ id: task.id });
    });

    await waitFor(() =>
      expect(mocks.success).toHaveBeenCalledWith("Task deleted"),
    );
    expect(mocks.delete.mock.calls[0]?.[0]).toEqual({ id: task.id });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["task"] });
  });

  it("shows deletion errors and still invalidates the task list", async () => {
    mocks.delete.mockRejectedValueOnce(new Error("boom"));
    const { result, invalidateQueries } = renderMutationHook(() =>
      useDeleteTask(),
    );

    act(() => {
      result.current.mutate({ id: task.id });
    });

    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      ),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["task"] });
  });
});
