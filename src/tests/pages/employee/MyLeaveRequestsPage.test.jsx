import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import MyLeaveRequestsPage from "../../../pages/employee/MyLeaveRequestsPage";

const mockGetLeaveRequests = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "test-token",
  }),
}));

vi.mock("../../../services/leaveService", () => ({
  default: {
    getLeaveRequests: (...args) => mockGetLeaveRequests(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MyLeaveRequestsPage />
    </MemoryRouter>
  );
}

describe("MyLeaveRequestsPage", () => {
  beforeEach(() => {
    mockGetLeaveRequests.mockReset();
  });

  test("shows a loading message while requests are being retrieved", () => {
    mockGetLeaveRequests.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByText(/loading leave requests/i)
    ).toBeInTheDocument();
  });

  test("loads leave requests using the authenticated token", async () => {
    mockGetLeaveRequests.mockResolvedValue([
      {
        id: 1,
        start_date: "2026-12-01T00:00:00.000000Z",
        end_date: "2026-12-02T00:00:00.000000Z",
        status: "Pending",
      },
    ]);

    renderPage();

    await screen.findByText("Pending");

    expect(mockGetLeaveRequests).toHaveBeenCalledWith("test-token");
    expect(mockGetLeaveRequests).toHaveBeenCalledTimes(1);
  });

  test("displays request dates and status", async () => {
    mockGetLeaveRequests.mockResolvedValue([
      {
        id: 1,
        start_date: "2026-12-01T00:00:00.000000Z",
        end_date: "2026-12-02T00:00:00.000000Z",
        status: "Pending",
      },
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
});