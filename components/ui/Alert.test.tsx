import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders the error message with role alert", () => {
    render(<Alert>Something failed</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Something failed");
  });

  it("renders the optional action element", () => {
    render(
      <Alert action={<button type="button">Retry</button>}>
        Network issue
      </Alert>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

