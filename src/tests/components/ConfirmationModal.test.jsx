import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmationModal from "../../components/common/ConfirmationModal";

describe("ConfirmationModal accessibility", () => {
  it("moves focus to the safe cancel action when opened", () => {
    render(
      <ConfirmationModal
        show
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Keep Request" })
    ).toHaveFocus();
  });

  it("closes when Escape is pressed", () => {
    const onCancel = vi.fn();

    render(
      <ConfirmationModal
        show
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("traps forward Tab focus inside the modal", () => {
    render(
      <ConfirmationModal
        show
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    const confirmButton = screen.getByRole("button", {
      name: "Cancel Request",
    });

    confirmButton.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    expect(closeButton).toHaveFocus();
  });

  it("traps reverse Tab focus inside the modal", () => {
    render(
      <ConfirmationModal
        show
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    const confirmButton = screen.getByRole("button", {
      name: "Cancel Request",
    });

    closeButton.focus();

    fireEvent.keyDown(document, {
      key: "Tab",
      shiftKey: true,
    });

    expect(confirmButton).toHaveFocus();
  });

  it("restores focus to the triggering control when closed", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open modal";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <ConfirmationModal
        show
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Keep Request" })
    ).toHaveFocus();

    rerender(
      <ConfirmationModal
        show={false}
        title="Cancel Leave Request"
        message="Are you sure?"
        cancelLabel="Keep Request"
        confirmLabel="Cancel Request"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(trigger).toHaveFocus();

    trigger.remove();
  });
});