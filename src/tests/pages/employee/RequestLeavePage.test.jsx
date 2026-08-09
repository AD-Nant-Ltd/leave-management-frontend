import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import RequestLeavePage from "../../../pages/employee/RequestLeavePage";

const mockCreateLeaveRequest = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "test-token",
  }),
}));

vi.mock("../../../services/leaveService", () => ({
  default: {
    createLeaveRequest: (...args) => mockCreateLeaveRequest(...args),
  },
}));

function renderRequestLeavePage() {
  return render(
    <MemoryRouter>
      <RequestLeavePage />
    </MemoryRouter>
  );
}

describe("RequestLeavePage", () => {
  beforeEach(() => {
    mockCreateLeaveRequest.mockReset();
  });

  test("renders start date, end date and submit button", () => {
    renderRequestLeavePage();

    expect(
      screen.getByLabelText(/start date/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/end date/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /submit request/i })
    ).toBeInTheDocument();
  });

  test("allows the user to select start and end dates", async () => {
    const user = userEvent.setup();

    renderRequestLeavePage();

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, "2026-08-20");
    await user.type(endDateInput, "2026-08-22");

    expect(startDateInput).toHaveValue("2026-08-20");
    expect(endDateInput).toHaveValue("2026-08-22");
  });

  test("prevents submission when end date is before start date", async () => {
    const user = userEvent.setup();

    renderRequestLeavePage();

    await user.type(
      screen.getByLabelText(/start date/i),
      "2026-08-22"
    );

    await user.type(
      screen.getByLabelText(/end date/i),
      "2026-08-20"
    );

    await user.click(
      screen.getByRole("button", { name: /submit request/i })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "End date cannot be before start date."
    );

    expect(mockCreateLeaveRequest).not.toHaveBeenCalled();
  });

  test("submits a valid leave request to the API service", async () => {
    const user = userEvent.setup();

    mockCreateLeaveRequest.mockResolvedValue({
      message: "Leave request has been submitted for review",
      data: {
        id: 1,
        user_id: 1,
        start_date: "2026-08-20",
        end_date: "2026-08-22",
        status: "Pending",
      },
    });

    renderRequestLeavePage();

    await user.type(
      screen.getByLabelText(/start date/i),
      "2026-08-20"
    );

    await user.type(
      screen.getByLabelText(/end date/i),
      "2026-08-22"
    );

    await user.click(
      screen.getByRole("button", { name: /submit request/i })
    );

    expect(mockCreateLeaveRequest).toHaveBeenCalledWith(
      "test-token",
      "2026-08-20",
      "2026-08-22"
    );
  });

  test("shows success feedback after successful submission", async () => {
    const user = userEvent.setup();

    mockCreateLeaveRequest.mockResolvedValue({
      message: "Leave request has been submitted for review",
      data: {
        id: 1,
        user_id: 1,
        start_date: "2026-08-20",
        end_date: "2026-08-22",
        status: "Pending",
      },
    });

    renderRequestLeavePage();

    await user.type(
      screen.getByLabelText(/start date/i),
      "2026-08-20"
    );

    await user.type(
      screen.getByLabelText(/end date/i),
      "2026-08-22"
    );

    await user.click(
      screen.getByRole("button", { name: /submit request/i })
    );

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent(
      "Leave request has been submitted for review"
    );
  });

  test("displays backend business-rule errors", async () => {
    const user = userEvent.setup();

    mockCreateLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error: "Date range of request overlaps with another existing request",
        },
      },
    });

    renderRequestLeavePage();

    await user.type(
      screen.getByLabelText(/start date/i),
      "2026-08-20"
    );

    await user.type(
      screen.getByLabelText(/end date/i),
      "2026-08-22"
    );

    await user.click(
      screen.getByRole("button", { name: /submit request/i })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Date range of request overlaps with another existing request"
    );
  });
});