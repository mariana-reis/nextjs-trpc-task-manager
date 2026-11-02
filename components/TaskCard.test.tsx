import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

const task: Task = {
  id: "3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b",
  title: "Write report",
  description: "Quarterly numbers",
  createdAt: Date.UTC(2026, 10, 1, 12, 0),
};

function renderCard(props: Partial<Parameters<typeof TaskCard>[0]> = {}) {
  return render(
    <ul>
      <TaskCard task={task} isDeleting={false} onDelete={vi.fn()} {...props} />
    </ul>,
  );
}

describe("TaskCard", () => {
  it("shows the title, description and creation date", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Write report" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quarterly numbers")).toBeInTheDocument();
    expect(screen.getByText(/nov 1, 2026/i)).toHaveAttribute(
      "datetime",
      "2026-11-01T12:00:00.000Z",
    );
  });

  it("omits the description when there is none", () => {
    renderCard({ task: { ...task, description: undefined } });

    expect(screen.queryByText("Quarterly numbers")).not.toBeInTheDocument();
  });

  it("links to the edit page", () => {
    renderCard();

    expect(
      screen.getByRole("link", { name: /edit task: write report/i }),
    ).toHaveAttribute("href", `/tasks/${task.id}`);
  });

  it("calls onDelete with the task", async () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });

    await userEvent.click(
      screen.getByRole("button", { name: /delete task: write report/i }),
    );

    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it("disables the delete button while deleting", () => {
    renderCard({ isDeleting: true });

    expect(
      screen.getByRole("button", { name: /delete task: write report/i }),
    ).toBeDisabled();
  });
});
