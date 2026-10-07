import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Panel } from "@/components/Panel";

describe("Panel", () => {
  it("renders its title and children", () => {
    render(
      <Panel title="About">
        <p>body text</p>
      </Panel>,
    );
    expect(screen.getByRole("heading", { name: "About" })).toBeTruthy();
    expect(screen.getByText("body text")).toBeTruthy();
  });
});
