import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, syncDialogVisibility } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("safely ignores an unavailable dialog element", () => {
    expect(() => syncDialogVisibility(null, true)).not.toThrow();
  });

  it("renders title, description and action buttons", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete item?"
        description="Are you sure you want to delete this item?"
        confirmLabel="Confirm"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Delete item?" })).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete item?"
        description="Are you sure?"
        confirmLabel="Confirm"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete item?"
        description="Are you sure?"
        confirmLabel="Confirm"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("closes when open changes to false", () => {
    const { rerender } = render(
      <ConfirmDialog
        open
        title="Delete item?"
        description="Are you sure?"
        confirmLabel="Confirm"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("open");

    rerender(
      <ConfirmDialog
        open={false}
        title="Delete item?"
        description="Are you sure?"
        confirmLabel="Confirm"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(dialog).not.toHaveAttribute("open");
  });

  it("calls onCancel when the backdrop is clicked, but not for dialog content", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete item?"
        description="Are you sure?"
        confirmLabel="Confirm"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const dialog = screen.getByRole("dialog");

    fireEvent.click(screen.getByRole("heading", { name: "Delete item?" }));
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
