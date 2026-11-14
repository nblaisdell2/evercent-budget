import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { budgetGroups } from "@/lib/data/placeholder/budget-groups";
import { BudgetTable } from "./budget-table";

function setup() {
  render(<BudgetTable groups={budgetGroups} />);
  return userEvent.setup();
}

describe("BudgetTable", () => {
  it("lists every category from the data", () => {
    setup();
    const grid = screen.getByRole("treegrid", { name: "Budget" });
    for (const group of budgetGroups) {
      for (const category of group.categories) {
        expect(within(grid).getByText(category.name)).toBeInTheDocument();
      }
    }
  });

  it("collapsing a group hides its categories, and expanding brings them back", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Collapse Monthly Bills" }));
    expect(screen.queryByText("Rent")).not.toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand Monthly Bills" }));
    expect(screen.getByText("Rent")).toBeInTheDocument();
  });

  it("select all checks every category", async () => {
    const user = setup();
    await user.click(screen.getByRole("checkbox", { name: "Select all categories" }));
    expect(screen.getByRole("checkbox", { name: "Select Rent" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("checkbox", { name: "Select Gas" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("editing a Budgeted amount shows the new value", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Budgeted for Rent" }));
    await user.keyboard("2000{Enter}");
    expect(screen.getByRole("button", { name: "Budgeted for Rent" })).toHaveTextContent(
      "$2,000.00",
    );
  });
});
