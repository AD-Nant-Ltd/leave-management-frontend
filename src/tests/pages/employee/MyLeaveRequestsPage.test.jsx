import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import MyLeaveRequestsPage from "../../../pages/employee/MyLeaveRequestsPage";

const mockGetLeaveRequests = vi.fn();
const mockCancelLeaveRequest = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "test-token",
  }),
}));

vi.mock("../../../services/leaveService", () => ({
  default: {
    getLeaveRequests: (...args) => mockGetLeaveRequests(...args),
    cancelLeaveRequest: (...args) => mockCancelLeaveRequest(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MyLeaveRequestsPage />
    </MemoryRouter>
  );
}

function pendingRequest() {
  return {
    id: 1,
    start_date: "2026-12-01T00:00:00.000000Z",
    end_date: "2026-12-02T00:00:00.000000Z",
    status: "Pending",
  };
}

describe("MyLeaveRequestsPage", () => {
  beforeEach(() => {
    mockGetLeaveRequests.mockReset();
    mockCancelLeaveRequest.mockReset();
  });

  test("shows a loading message while requests are being retrieved", () => {
    mockGetLeaveRequests.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByText(/loading leave requests/i)
    ).toBeInTheDocument();
  });

  test("loads leave requests using the authenticated token", async () => {
    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);

    renderPage();

    await screen.findByText("Pending");

    expect(mockGetLeaveRequests).toHaveBeenCalledWith("test-token");
    expect(mockGetLeaveRequests).toHaveBeenCalledTimes(1);
  });

  test("displays request dates and status", async () => {
    mockGetLeaveRequests.mockResolvedValue([
      pendingRequest(),
      {
        id: 2,
        start_date: "2026-07-01T00:00:00.000000Z",
        end_date: "2026-07-03T00:00:00.000000Z",
        status: "Approved",
      },
    ]);

    renderPage();

    expect(await screen.findByText("01/12/2026")).toBeInTheDocument();
    expect(screen.getByText("02/12/2026")).toBeInTheDocument();

    expect(screen.getByText("01/07/2026")).toBeInTheDocument();
    expect(screen.getByText("03/07/2026")).toBeInTheDocument();

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  test("displays an empty state when no requests exist", async () => {
    mockGetLeaveRequests.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("You have no leave requests.");
  });

  test("displays an error when requests cannot be loaded", async () => {
    mockGetLeaveRequests.mockRejectedValue(
      new Error("API unavailable")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load leave requests.");
  });

  test("provides navigation back to the dashboard", async () => {
    mockGetLeaveRequests.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole("link", { name: /back to dashboard/i })
    ).toHaveAttribute("href", "/dashboard");
  });

  test("shows a cancel button for pending requests", async () => {
    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);

    renderPage();

    expect(
      await screen.findByRole("button", { name: /^cancel$/i })
    ).toBeInTheDocument();
  });

  test("does not show cancel for non-pending requests", async () => {
    mockGetLeaveRequests.mockResolvedValue([
      {
        id: 2,
        start_date: "2026-07-01T00:00:00.000000Z",
        end_date: "2026-07-03T00:00:00.000000Z",
        status: "Approved",
      },
      {
        id: 3,
        start_date: "2026-06-01T00:00:00.000000Z",
        end_date: "2026-06-03T00:00:00.000000Z",
        status: "Rejected",
      },
      {
        id: 4,
        start_date: "2026-05-01T00:00:00.000000Z",
        end_date: "2026-05-03T00:00:00.000000Z",
        status: "Cancelled",
      },
    ]);

    renderPage();

    await screen.findByText("Approved");

    expect(
      screen.queryByRole("button", { name: /^cancel$/i })
    ).not.toBeInTheDocument();
  });

  test("opens confirmation modal when cancel is selected", async () => {
    const user = userEvent.setup();

    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);

    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /^cancel$/i })
    );

    expect(
      screen.getByRole("heading", { name: /cancel leave request/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /are you sure you want to cancel this leave request/i
      )
    ).toBeInTheDocument();
  });

  test("keeps the request when cancellation is dismissed", async () => {
    const user = userEvent.setup();

    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);

    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /^cancel$/i })
    );

    await user.click(
      screen.getByRole("button", { name: /keep request/i })
    );

    expect(mockCancelLeaveRequest).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", { name: /cancel leave request/i })
    ).not.toBeInTheDocument();

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  test("submits cancellation using the authenticated token and request id", async () => {
    const user = userEvent.setup();

    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);
    mockCancelLeaveRequest.mockResolvedValue({
      message: "Leave request has been cancelled",
      data: {
        id: 1,
        status: "Cancelled",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /^cancel$/i })
    );

    await user.click(
      screen.getByRole("button", { name: /cancel leave/i })
    );

    expect(mockCancelLeaveRequest).toHaveBeenCalledWith(
      "test-token",
      1
    );
  });

  test("updates the request to cancelled after successful cancellation", async () => {
    const user = userEvent.setup();

    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);
    mockCancelLeaveRequest.mockResolvedValue({
      message: "Leave request has been cancelled",
      data: {
        id: 1,
        status: "Cancelled",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /^cancel$/i })
    );

    await user.click(
      screen.getByRole("button", { name: /cancel leave/i })
    );

    expect(
      await screen.findByText("Cancelled")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /^cancel$/i })
    ).not.toBeInTheDocument();
  });

  test("displays an API error when cancellation fails", async () => {
    const user = userEvent.setup();

    mockGetLeaveRequests.mockResolvedValue([pendingRequest()]);

    mockCancelLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error: "Unable to cancel this leave request",
        },
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /^cancel$/i })
    );

    await user.click(
      screen.getByRole("button", { name: /cancel leave/i })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to cancel this leave request");
  });
});