import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RejectLeaveModal from "../../components/manager/RejectLeaveModal";

const request = {
  user: {
    first_name: "Test",
    surname: "Employee",
  },
};

describe("RejectLeaveModal accessibility", () => {
  it("moves focus to Keep Pending when opened", () => {
    render(
      <RejectLeaveModal
        show
        request={request}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Keep Pending" })
    ).toHaveFocus();
  });

  it("closes when Escape is pressed", () => {
    const onCancel = vi.fn();

    render(
      <RejectLeaveModal
        show
        request={request}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("traps forward Tab focus inside the modal", () => {
    render(
      <RejectLeaveModal
        show
        request={request}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    const rejectButton = screen.getByRole("button", {
      name: "Reject Leave",
    });

    rejectButton.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    expect(closeButton).toHaveFocus();
  });

  it("traps reverse Tab focus inside the modal", () => {
    render(
      <RejectLeaveModal
        show
        request={request}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    const rejectButton = screen.getByRole("button", {
      name: "Reject Leave",
    });

    closeButton.focus();

    fireEvent.keyDown(document, {
      key: "Tab",
      shiftKey: true,
    });

    expect(rejectButton).toHaveFocus();
  });

  it("restores focus to the triggering control when closed", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Reject";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <RejectLeaveModal
        show
        request={request}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Keep Pending" })
    ).toHaveFocus();

    rerender(
      <RejectLeaveModal
        show={false}
        request={request}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(trigger).toHaveFocus();

    trigger.remove();
  });
});