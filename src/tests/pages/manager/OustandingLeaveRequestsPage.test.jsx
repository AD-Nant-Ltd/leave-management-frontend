import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import OutstandingLeaveRequestsPage from "../../../pages/manager/OutstandingLeaveRequestsPage";

const mockGetOutstandingLeaveRequests = vi.fn();
const mockApproveLeaveRequest = vi.fn();
const mockRejectLeaveRequest = vi.fn();
const mockGetStaffLeaveBalance = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "manager-token",
  }),
}));

vi.mock("../../../services/managerService", () => ({
  default: {
    getOutstandingLeaveRequests: (...args) =>
      mockGetOutstandingLeaveRequests(...args),

    approveLeaveRequest: (...args) =>
      mockApproveLeaveRequest(...args),

    rejectLeaveRequest: (...args) =>
      mockRejectLeaveRequest(...args),

    getStaffLeaveBalance: (...args) =>
      mockGetStaffLeaveBalance(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <OutstandingLeaveRequestsPage />
    </MemoryRouter>
  );
}

function pendingRequest() {
  return {
    id: 10,
    user_id: 1,
    start_date: "2026-09-01T00:00:00.000000Z",
    end_date: "2026-09-03T00:00:00.000000Z",
    days_requested: 3,
    status: "Pending",
    user: {
      id: 1,
      first_name: "Test",
      surname: "Employee",
    },
  };
}

describe("OutstandingLeaveRequestsPage", () => {
  beforeEach(() => {
    mockGetOutstandingLeaveRequests.mockReset();
    mockApproveLeaveRequest.mockReset();
    mockRejectLeaveRequest.mockReset();
    mockGetStaffLeaveBalance.mockReset();
  });

  test("shows a loading message while requests are retrieved", () => {
    mockGetOutstandingLeaveRequests.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      screen.getByText(
        /loading outstanding leave requests/i
      )
    ).toBeInTheDocument();
  });

  test("retrieves outstanding requests using the authenticated token", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await screen.findByText("Test Employee");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenCalledWith("manager-token");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenCalledTimes(1);
  });

  test("displays employee name, start date, end date and status", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    expect(
      await screen.findByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("01/09/2026")
    ).toBeInTheDocument();

    expect(
      screen.getByText("03/09/2026")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();
  });

  test("displays the number of days requested", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await screen.findByText("Test Employee");

    expect(
      screen.getByRole("columnheader", {
        name: /days/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("3")
    ).toBeInTheDocument();
  });

  test("displays multiple outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
      {
        id: 11,
        user_id: 2,
        start_date: "2026-10-05T00:00:00.000000Z",
        end_date: "2026-10-06T00:00:00.000000Z",
        days_requested: 2,
        status: "Pending",
        user: {
          id: 2,
          first_name: "Another",
          surname: "Employee",
        },
      },
    ]);

    renderPage();

    expect(
      await screen.findByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Another Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("01/09/2026")
    ).toBeInTheDocument();

    expect(
      screen.getByText("05/10/2026")
    ).toBeInTheDocument();
  });

  test("displays an empty state when there are no outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText(
        "There are no outstanding leave requests."
      )
    ).toBeInTheDocument();
  });

  test("displays an error when outstanding requests cannot be loaded", async () => {
    mockGetOutstandingLeaveRequests.mockRejectedValue(
      new Error("API unavailable")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load outstanding leave requests."
    );
  });

  test("displays an API error message when one is returned", async () => {
    mockGetOutstandingLeaveRequests.mockRejectedValue({
      response: {
        data: {
          error:
            "Only managers can view outstanding staff leave requests",
        },
      },
    });

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Only managers can view outstanding staff leave requests"
    );
  });

  test("provides navigation back to the dashboard", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });

  test("displays a view balance action for an outstanding request", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    expect(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    ).toBeInTheDocument();
  });

  test("retrieves staff leave balance using the authenticated token and employee id", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    expect(
      mockGetStaffLeaveBalance
    ).toHaveBeenCalledWith(
      "manager-token",
      1
    );

    expect(
      mockGetStaffLeaveBalance
    ).toHaveBeenCalledTimes(1);
  });

  test("shows a loading state while staff leave balance is retrieved", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    expect(
      screen.getByText(
        /loading staff leave balance/i
      )
    ).toBeInTheDocument();
  });

  test("displays the selected employee leave balance in a modal", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    expect(
      await screen.findByRole("dialog")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /test employee - leave balance/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /annual allowance/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /leave taken/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /remaining leave/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("25")
    ).toBeInTheDocument();

    expect(
      screen.getByText("10")
    ).toBeInTheDocument();

    expect(
      screen.getByText("15")
    ).toBeInTheDocument();
  });

  test("closes the staff leave balance modal", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    await screen.findByRole("dialog");

    await user.click(
      screen.getByRole("button", {
        name: /^close$/i,
      })
    );

    expect(
      screen.queryByRole("dialog")
    ).not.toBeInTheDocument();
  });

  test("displays an API error when staff leave balance cannot be retrieved", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockRejectedValue({
      response: {
        data: {
          error:
            "This manager is not authorised to view this staff member's leave balance",
        },
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "This manager is not authorised to view this staff member's leave balance"
    );

    expect(
      screen.getByText("Test Employee")
    ).toBeInTheDocument();
  });

  test("displays a generic error when staff balance retrieval fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockGetStaffLeaveBalance.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /view balance/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load staff leave balance."
    );
  });

  test("displays an approve action for an outstanding request", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    expect(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    ).toBeInTheDocument();
  });

  test("opens confirmation modal when approve is selected", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /approve leave request/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /are you sure you want to approve this leave request/i
      )
    ).toBeInTheDocument();
  });

  test("keeps the request pending when approval is dismissed", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /keep pending/i,
      })
    );

    expect(
      mockApproveLeaveRequest
    ).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", {
        name: /approve leave request/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();
  });

  test("submits approval using the authenticated token and request id", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockApproveLeaveRequest.mockResolvedValue({
      message:
        "Leave request 10 for user_id 1 has been approved",
      data: {
        status: "Approved",
        days_remaining: 22,
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    );

    expect(
      mockApproveLeaveRequest
    ).toHaveBeenCalledWith(
      "manager-token",
      10
    );

    expect(
      mockApproveLeaveRequest
    ).toHaveBeenCalledTimes(1);
  });

  test("removes an approved request from the outstanding queue", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockApproveLeaveRequest.mockResolvedValue({
      message:
        "Leave request 10 for user_id 1 has been approved",
      data: {
        status: "Approved",
        days_remaining: 22,
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    );

    expect(
      await screen.findByText(
        "There are no outstanding leave requests."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Test Employee")
    ).not.toBeInTheDocument();
  });

  test("displays success feedback after approval", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockApproveLeaveRequest.mockResolvedValue({
      message:
        "Leave request 10 for user_id 1 has been approved",
      data: {
        status: "Approved",
        days_remaining: 22,
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    );

    expect(
      await screen.findByText(
        "Leave request 10 for user_id 1 has been approved"
      )
    ).toBeInTheDocument();
  });

  test("displays an API error when approval fails", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockApproveLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error:
            "Insufficient remaining leave balance to approve this request",
        },
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Insufficient remaining leave balance to approve this request"
    );

    expect(
      screen.getByText("Test Employee")
    ).toBeInTheDocument();
  });

  test("displays a generic error when approval fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockApproveLeaveRequest.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to approve leave request."
    );
  });

  test("displays a reject action for an outstanding request", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    expect(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    ).toBeInTheDocument();
  });

  test("opens rejection modal when reject is selected", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /reject leave request/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/reason for rejection/i)
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/test employee/i)
    ).toHaveLength(2);
  });

  test("keeps the request pending when rejection is dismissed", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /keep pending/i,
      })
    );

    expect(
      mockRejectLeaveRequest
    ).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", {
        name: /reject leave request/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();
  });

  test("submits rejection with a reason", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request 10 has been rejected",
      data: {
        status: "Rejected",
        reason: "Insufficient team coverage",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.type(
      screen.getByLabelText(/reason for rejection/i),
      "Insufficient team coverage"
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      mockRejectLeaveRequest
    ).toHaveBeenCalledWith(
      "manager-token",
      10,
      "Insufficient team coverage"
    );

    expect(
      mockRejectLeaveRequest
    ).toHaveBeenCalledTimes(1);
  });

  test("allows rejection without a reason", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request 10 has been rejected",
      data: {
        status: "Rejected",
        reason: "Rejected by manager",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      mockRejectLeaveRequest
    ).toHaveBeenCalledWith(
      "manager-token",
      10,
      ""
    );
  });

  test("removes rejected request from the outstanding queue", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request 10 has been rejected",
      data: {
        status: "Rejected",
        reason: "Rejected by manager",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      await screen.findByText(
        "There are no outstanding leave requests."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Test Employee")
    ).not.toBeInTheDocument();
  });

  test("displays success feedback after rejection", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request 10 has been rejected",
      data: {
        status: "Rejected",
        reason: "Rejected by manager",
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      await screen.findByText(
        "Leave request 10 has been rejected"
      )
    ).toBeInTheDocument();
  });

  test("displays an API error when rejection fails", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error:
            "This manager is not authorised to reject this leave request",
        },
      },
    });

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "This manager is not authorised to reject this leave request"
    );

    expect(
      screen.getAllByText("Test Employee")
    ).toHaveLength(2);
  });

  test("displays a generic error when rejection fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue([
      pendingRequest(),
    ]);

    mockRejectLeaveRequest.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to reject leave request."
    );
  });
});