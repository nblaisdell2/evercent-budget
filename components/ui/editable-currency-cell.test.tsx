import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditableCurrencyCell } from "./editable-currency-cell";

function setup(isEditing: boolean, valueCents = 123_456) {
  const handlers = { onStartEdit: vi.fn(), onCommit: vi.fn(), onCancel: vi.fn() };
  render(
    <EditableCurrencyCell
      valueCents={valueCents}
      isEditing={isEditing}
      ariaLabel="Budgeted for Rent"
      {...handlers}
    />,
  );
  return { user: userEvent.setup(), ...handlers };
}

describe("EditableCurrencyCell", () => {
  it("shows the formatted amount and asks to start editing when clicked", async () => {
    const { user, onStartEdit } = setup(false);
    const cell = screen.getByRole("button", { name: "Budgeted for Rent" });
    expect(cell).toHaveTextContent("$1,234.56");

    await user.click(cell);
    expect(onStartEdit).toHaveBeenCalledOnce();
  });

  it("opens with a bare number, selected, so typing replaces it", () => {
    setup(true);
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Budgeted for Rent" });
    expect(input).toHaveValue("1234.56");
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("1234.56".length);
  });

  it("Enter commits the typed amount in cents", async () => {
    const { user, onCommit, onCancel } = setup(true);
    await user.keyboard("2,000.5{Enter}");
    expect(onCommit).toHaveBeenCalledWith(200_050);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("Escape cancels without committing", async () => {
    const { user, onCommit, onCancel } = setup(true);
    await user.keyboard("999{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("text that isn't a number cancels instead of saving garbage", async () => {
    const { user, onCommit, onCancel } = setup(true);
    await user.keyboard("abc{Enter}");
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("clicking away commits", async () => {
    const { user, onCommit } = setup(true);
    await user.keyboard("15");
    await user.click(document.body);
    expect(onCommit).toHaveBeenCalledWith(1_500);
  });
});
