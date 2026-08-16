import { render, screen } from "@testing-library/react";
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

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "manager-token",
  }),
}));

vi.mock("../../../services/managerService", () => ({
  default: {
    getOutstandingLeaveRequests: (...args) =>
      mockGetOutstandingLeaveRequests(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <OutstandingLeaveRequestsPage />
    </MemoryRouter>
  );
}

describe("OutstandingLeaveRequestsPage", () => {
  beforeEach(() => {
    mockGetOutstandingLeaveRequests.mockReset();
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
      {
        id: 10,
        start_date:
          "2026-09-01T00:00:00.000000Z",
        end_date:
          "2026-09-03T00:00:00.000000Z",
        status: "Pending",
        user: {
          first_name: "Test",
          surname: "Employee",
        },
      },
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
      {
        id: 10,
        start_date:
          "2026-09-01T00:00:00.000000Z",
        end_date:
          "2026-09-03T00:00:00.000000Z",
        status: "Pending",
        user: {
          first_name: "Test",
          surname: "Employee",
        },
      },
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

  test("displays multiple outstanding requests", async () => {
    mockGetOutstandingLeaveRequests.mockResolvedValue([
      {
        id: 10,
        start_date:
          "2026-09-01T00:00:00.000000Z",
        end_date:
          "2026-09-03T00:00:00.000000Z",
        status: "Pending",
        user: {
          first_name: "Test",
          surname: "Employee",
        },
      },
      {
        id: 11,
        start_date:
          "2026-10-05T00:00:00.000000Z",
        end_date:
          "2026-10-06T00:00:00.000000Z",
        status: "Pending",
        user: {
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
    mockGetOutstandingLeaveRequests.mockResolvedValue(
      []
    );

    renderPage();

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent(
      "There are no outstanding leave requests."
    );
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
    mockGetOutstandingLeaveRequests.mockResolvedValue(
      []
    );

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });
});