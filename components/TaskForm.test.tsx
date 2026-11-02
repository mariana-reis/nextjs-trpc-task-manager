import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DESCRIPTION_MAX_LENGTH, type Task } from "@/types/task";
import { TaskForm } from "./TaskForm";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
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
    },
  }),
}));

const existingTask: Task = {
  id: "3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b",
  title: "Old title",
  description: "Old description",
  createdAt: 1,
};

function renderForm(task?: Task) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TaskForm task={task} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.update.mockResolvedValue({});
});

describe("TaskForm", () => {
  it("blocks submission and shows an error when the title is empty", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("clears the title error when the field is corrected", async () => {
    renderForm();
    const title = screen.getByLabelText("Title");

    await userEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();

    await userEvent.type(title, "Buy milk");

    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });

  it("treats a whitespace-only title as empty", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates a task with trimmed values and returns to the list", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "  Buy milk ");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.create.mock.calls[0]?.[0]).toEqual({
      title: "Buy milk",
      description: undefined,
    });
  });

  it("includes the description when provided", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "Buy milk");
    await userEvent.type(screen.getByLabelText("Description"), "Two liters");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    expect(mocks.create.mock.calls[0]?.[0]).toEqual({
      title: "Buy milk",
      description: "Two liters",
    });
  });

  it("shows a pending label while the task is being saved", async () => {
    let finishCreate!: () => void;
    mocks.create.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishCreate = () => resolve({});
        }),
    );
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "Buy milk");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    const saveButton = screen.getByRole("button", { name: "Saving…" });
    expect(saveButton).toBeDisabled();

    await act(async () => finishCreate());
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
  });

  it("rejects a description over the limit", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "Buy milk");
    await userEvent.click(screen.getByLabelText("Description"));
    await userEvent.paste("a".repeat(DESCRIPTION_MAX_LENGTH + 1));
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(
      await screen.findByText(/description must have at most/i),
    ).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("shows field errors when both values are invalid", async () => {
    renderForm();

    await userEvent.click(screen.getByLabelText("Description"));
    await userEvent.paste("a".repeat(DESCRIPTION_MAX_LENGTH + 1));
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(
      screen.getByText(/description must have at most/i),
    ).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("pre-fills the fields and updates the existing task", async () => {
    renderForm(existingTask);

    expect(screen.getByLabelText("Title")).toHaveValue("Old title");
    expect(screen.getByLabelText("Description")).toHaveValue("Old description");

    await userEvent.clear(screen.getByLabelText("Title"));
    await userEvent.type(screen.getByLabelText("Title"), "New title");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.update.mock.calls[0]?.[0]).toEqual({
      id: existingTask.id,
      title: "New title",
      description: "Old description",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("shows the error returned by the server and stays on the page", async () => {
    mocks.create.mockRejectedValueOnce(new Error("boom"));
    renderForm();

    await userEvent.type(screen.getByLabelText("Title"), "Buy milk");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("links the cancel button back to the list", () => {
    renderForm();

    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
