import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title when optional content is omitted", () => {
    render(<PageHeader title="Tasks" />);

    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Back to tasks" })).not.toBeInTheDocument();
  });

  it("renders the description, back link, and action", () => {
    render(
      <PageHeader
        title="Edit task"
        description="Update task details."
        backHref="/"
        action={<button type="button">Save</button>}
      />,
    );

    expect(screen.getByText("Update task details.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to tasks" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
