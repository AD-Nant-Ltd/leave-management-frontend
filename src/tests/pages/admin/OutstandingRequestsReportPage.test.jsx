import {
  render,
  screen,
  within,
} from "@testing-library/react";
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

async function findRequestTable() {
  return screen.findByRole("table");
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

    const table = await findRequestTable();

    expect(
      within(table).getByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("01/09/2026")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("03/09/2026")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("3")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("Pending")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("20/08/2026")
    ).toBeInTheDocument();
  });

  test("displays the expected report headings", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [pendingRequest()],
    });

    renderPage();

    await findRequestTable();

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

    const table = await findRequestTable();

    expect(
      within(table).getByText("Test Employee")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("Another Employee")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("05/10/2026")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("06/10/2026")
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

    await findRequestTable();

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

    await findRequestTable();

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

    await findRequestTable();

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

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("Test Employee")
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

    await findRequestTable();

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

    await findRequestTable();

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
      screen.queryByRole("table")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Test Employee",
      })
    ).toBeInTheDocument();
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

    await findRequestTable();

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

    await findRequestTable();

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

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("Test Employee")
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

    await findRequestTable();

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

    await findRequestTable();

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

    await findRequestTable();

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

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("Test Employee")
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

    await findRequestTable();

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

    await findRequestTable();

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

    await findRequestTable();

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
      screen.queryByRole("table")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Test Employee",
      })
    ).toBeInTheDocument();
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

    await findRequestTable();

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

    await findRequestTable();

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

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("Test Employee")
    ).toBeInTheDocument();
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

    await findRequestTable();

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

  test("displays a staff filter populated from outstanding request users", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [
        pendingRequest(),
        {
          ...pendingRequest(),
          id: 11,
          user_id: 2,
          user: {
            id: 2,
            first_name: "Another",
            surname: "Employee",
          },
        },
      ],
    });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    expect(filter).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /all staff/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Test Employee",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Another Employee",
      })
    ).toBeInTheDocument();
  });

  test("displays each staff member only once in the filter", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue({
      data: [
        pendingRequest(),
        {
          ...pendingRequest(),
          id: 11,
        },
      ],
    });

    renderPage();

    await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    expect(
      screen.getAllByRole("option", {
        name: "Test Employee",
      })
    ).toHaveLength(1);
  });

  test("retrieves outstanding requests for the selected staff member", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenNthCalledWith(
      2,
      "admin-token",
      "1"
    );
  });

  test("displays the filtered outstanding requests returned by the API", async () => {
    const user = userEvent.setup();

    const anotherRequest = {
      ...pendingRequest(),
      id: 11,
      user_id: 2,
      user: {
        id: 2,
        first_name: "Another",
        surname: "Employee",
      },
    };

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest(), anotherRequest],
      })
      .mockResolvedValueOnce({
        data: [anotherRequest],
      });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "2");

    const table = await findRequestTable();

    expect(
      within(table).getByText("Another Employee")
    ).toBeInTheDocument();

    expect(
      within(table).queryByText("Test Employee")
    ).not.toBeInTheDocument();
  });

  test("clears the staff filter and returns to company-wide outstanding requests", async () => {
    const user = userEvent.setup();

    const anotherRequest = {
      ...pendingRequest(),
      id: 11,
      user_id: 2,
      user: {
        id: 2,
        first_name: "Another",
        surname: "Employee",
      },
    };

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest(), anotherRequest],
      })
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockResolvedValueOnce({
        data: [pendingRequest(), anotherRequest],
      });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");
    await user.selectOptions(filter, "");

    expect(
      mockGetOutstandingLeaveRequests
    ).toHaveBeenNthCalledWith(
      3,
      "admin-token",
      null
    );

    const table = await findRequestTable();

    expect(
      within(table).getByText("Another Employee")
    ).toBeInTheDocument();

    expect(
      within(table).getByText("Test Employee")
    ).toBeInTheDocument();
  });

  test("displays a filtered empty state when the selected staff member has no outstanding requests", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockResolvedValueOnce({
        data: [],
      });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");

    expect(
      await screen.findByText(
        /there are currently no outstanding leave requests for this staff member/i
      )
    ).toBeInTheDocument();
  });

  test("displays an API error when filtering outstanding requests fails", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error:
              "Unable to retrieve requests for this staff member",
          },
        },
      });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to retrieve requests for this staff member"
    );
  });

  test("displays a generic error when filtering fails without an API message", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockRejectedValueOnce(
        new Error("Network failure")
      );

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to filter outstanding leave requests."
    );
  });

  test("keeps the selected staff filter after approving a request", async () => {
    const user = userEvent.setup();

    mockGetOutstandingLeaveRequests
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      })
      .mockResolvedValueOnce({
        data: [pendingRequest()],
      });

    mockApproveLeaveRequest.mockResolvedValue({
      message: "Leave request approved successfully",
    });

    renderPage();

    const filter = await screen.findByRole("combobox", {
      name: /filter by staff member/i,
    });

    await user.selectOptions(filter, "1");

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

    expect(filter).toHaveValue("1");

    expect(
      await screen.findByText(
        /there are currently no outstanding leave requests for this staff member/i
      )
    ).toBeInTheDocument();
  });
});