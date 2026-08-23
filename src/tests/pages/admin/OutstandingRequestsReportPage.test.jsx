import { render, screen } from "@testing-library/react";
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
});