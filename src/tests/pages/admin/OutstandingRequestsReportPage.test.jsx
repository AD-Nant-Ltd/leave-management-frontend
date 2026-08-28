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
import OutstandingRequestsReportPage from "../../../pages/admin/OutstandingRequestsReportPage";

const mockGetOutstandingLeaveRequests = vi.fn();
const mockApproveLeaveRequest = vi.fn();
const mockRejectLeaveRequest = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "admin-token",
  }),
}));

vi.mock("../../../services/adminService", () => ({
  default: {
    getOutstandingLeaveRequests: (...args) =>
      mockGetOutstandingLeaveRequests(...args),
  },
}));

vi.mock("../../../services/leaveReviewService", () => ({
  default: {
    approveLeaveRequest: (...args) =>
      mockApproveLeaveRequest(...args),

    rejectLeaveRequest: (...args) =>
      mockRejectLeaveRequest(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <OutstandingRequestsReportPage />
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
    created_at: "2026-08-20T09:30:00.000000Z",
    user: {
      id: 1,
      first_name: "Test",
      surname: "Employee",
    },
  };
}

describe("OutstandingRequestsReportPage", () => {
  beforeEach(() => {
    mockGetOutstandingLeaveRequests.mockReset();
    mockApproveLeaveRequest.mockReset();
    mockRejectLeaveRequest.mockReset();
  });

  test("shows a loading message while outstanding requests are retrieved", () => {
    mockGetOutstandingLeaveRequests.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      screen.getByText(/loading outstanding requests/i)
    ).toBeInTheDocument();
  });

  test("retrieves outstanding requests using the authenticated admin token", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      message:
        "Outstanding leave requests retrieved successfully",
      filters: [],
      data: [],
    });

    renderPage();

    await screen.findByRole("status");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenCalledWith("admin-token");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenCalledTimes(1);
  });

  test("displays employee and request information", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      message:
        "Outstanding leave requests retrieved successfully",
      filters: [],
      data: [pendingRequest()],
    });

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
      screen.getByText("3")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();

    expect(
      screen.getByText("20/08/2026")
    ).toBeInTheDocument();
  });

  test("displays the expected report headings", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    expect(
      screen.getByRole("columnheader", {
        name: /employee/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /start date/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /end date/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /days/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /status/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /submitted/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /actions/i,
      })
    ).toBeInTheDocument();
  });

  test("displays multiple outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [
        pendingRequest(),
        {
          id: 11,
          user_id: 2,
          start_date: "2026-10-05T00:00:00.000000Z",
          end_date: "2026-10-06T00:00:00.000000Z",
          days_requested: 2,
          status: "Pending",
          created_at: "2026-08-21T11:00:00.000000Z",
          user: {
            id: 2,
            first_name: "Another",
            surname: "Employee",
          },
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Another Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("05/10/2026")
    ).toBeInTheDocument();

    expect(
      screen.getByText("06/10/2026")
    ).toBeInTheDocument();
  });

  test("displays an empty state when there are no outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [],
    });

    renderPage();

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent(
      "There are currently no outstanding leave requests."
    );
  });

  test("displays an API error message when one is returned", async () => {
    mockGetOutstandingLeaveRequests.mockRejectedValue({
      response: {
        data: {
          error:
            "Only admins can view all outstanding leave requests",
        },
      },
    });

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Only admins can view all outstanding leave requests"
    );
  });

  test("displays a generic error when retrieval fails without an API message", async () => {
    mockGetOutstandingLeaveRequests.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load outstanding requests report."
    );
  });

  test("provides navigation back to the dashboard", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [],
    });

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });

  test("displays approve and reject actions for outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    expect(
      screen.getByRole("button", {
        name: /^approve$/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /^reject$/i,
      })
    ).toBeInTheDocument();
  });

  test("opens the approval confirmation modal", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
        name: /^approve$/i,
      })
    );

    expect(
      screen.getByText(
        /are you sure you want to approve this leave request/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /approve leave/i,
      })
    ).toBeInTheDocument();
  });

  test("keeps the request pending when approval is cancelled", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
        name: /^approve$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /keep pending/i,
      })
    );

    expect(
      screen.getByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      mockApproveLeaveRequest
    ).not.toHaveBeenCalled();
  });

  test("submits approval using the authenticated admin token and request id", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockApproveLeaveRequest.mockResolvedValue({
      message: "Leave request approved successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
      "admin-token",
      10
    );

    expect(
      mockApproveLeaveRequest
    ).toHaveBeenCalledTimes(1);
  });

  test("removes an approved request from the outstanding queue", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockApproveLeaveRequest.mockResolvedValue({
      message: "Leave request approved successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
        /there are currently no outstanding leave requests/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Test Employee")
    ).not.toBeInTheDocument();
  });

  test("displays success feedback after approval", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockApproveLeaveRequest.mockResolvedValue({
      message: "Leave request approved successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
        "Leave request approved successfully"
      )
    ).toBeInTheDocument();
  });

  test("displays an API error when approval fails", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockApproveLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error: "This request cannot be approved",
        },
      },
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
      "This request cannot be approved"
    );

    expect(
      screen.getByText("Test Employee")
    ).toBeInTheDocument();
  });

  test("displays a generic error when approval fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockApproveLeaveRequest.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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

  test("opens the rejection modal", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
        name: /^reject$/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox")
    ).toBeInTheDocument();
  });

  test("keeps the request pending when rejection is cancelled", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /keep pending|cancel/i,
      })
    );

    expect(
      screen.getByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      mockRejectLeaveRequest
    ).not.toHaveBeenCalled();
  });

  test("submits rejection using the authenticated admin token, request id and reason", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request rejected successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
        name: /^reject$/i,
      })
    );

    await user.type(
      screen.getByRole("textbox"),
      "Insufficient cover"
    );

    await user.click(
      screen.getByRole("button", {
        name: /reject leave/i,
      })
    );

    expect(
      mockRejectLeaveRequest
    ).toHaveBeenCalledWith(
      "admin-token",
      10,
      "Insufficient cover"
    );

    expect(
      mockRejectLeaveRequest
    ).toHaveBeenCalledTimes(1);
  });

  test("allows rejection without a reason", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request rejected successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
      "admin-token",
      10,
      ""
    );
  });

  test("removes a rejected request from the outstanding queue", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request rejected successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
        /there are currently no outstanding leave requests/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Test Employee")
    ).not.toBeInTheDocument();
  });

  test("displays success feedback after rejection", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockResolvedValue({
      message: "Leave request rejected successfully",
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
        "Leave request rejected successfully"
      )
    ).toBeInTheDocument();
  });

  test("displays an API error when rejection fails", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockRejectedValue({
      response: {
        data: {
          error: "This request cannot be rejected",
        },
      },
    });

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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
      "This request cannot be rejected"
    );

    expect(
      screen.getAllByText("Test Employee").length
    ).toBeGreaterThan(0);
  });

  test("displays a generic error when rejection fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    mockRejectLeaveRequest.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await screen.findByText("Test Employee");

    await user.click(
      screen.getByRole("button", {
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