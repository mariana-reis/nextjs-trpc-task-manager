import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpinnerIcon } from "./Icons";

describe("SpinnerIcon", () => {
  it("renders a decorative spinner with the default and custom classes", () => {
    const { container } = render(<SpinnerIcon className="custom-size" />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("size-4", "custom-size");
  });
});
