import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import DashboardPage from "../../../pages/employee/DashboardPage";

const mockGetLeaveBalance = vi.fn();
const mockUser = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "test-token",
    user: mockUser(),
  }),
}));

vi.mock("../../../services/leaveService", () => ({
  default: {
    getLeaveBalance: (...args) =>
      mockGetLeaveBalance(...args),
  },
}));

function renderDashboardPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    mockGetLeaveBalance.mockReset();
    mockUser.mockReset();

    mockUser.mockReturnValue({
      id: 1,
      first_name: "Test",
      surname: "Employee",
      role_id: 1,
    });
  });

  test("shows a loading message while leave balance is being retrieved", () => {
    mockGetLeaveBalance.mockReturnValue(
      new Promise(() => {})
    );

    renderDashboardPage();

    expect(
      screen.getByText(/loading leave balance/i)
    ).toBeInTheDocument();
  });

  test("displays annual allowance, leave taken and remaining leave", async () => {
    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("heading", {
        name: /leave balance/i,
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
      screen.getByText("5")
    ).toBeInTheDocument();

    expect(
      screen.getByText("20")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /request leave/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /my requests/i,
      })
    ).toBeInTheDocument();
  });

  test("retrieves the leave balance using the authenticated token", async () => {
    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    await screen.findByText("25");

    expect(
      mockGetLeaveBalance
    ).toHaveBeenCalledWith("test-token");

    expect(
      mockGetLeaveBalance
    ).toHaveBeenCalledTimes(1);
  });

  test("shows an error when the leave balance cannot be retrieved", async () => {
    mockGetLeaveBalance.mockRejectedValue(
      new Error("API unavailable")
    );

    renderDashboardPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load leave balance."
    );
  });

  test("shows the manager section for a manager", async () => {
    mockUser.mockReturnValue({
      id: 2,
      first_name: "Mia",
      surname: "Manager",
      role_id: 2,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("heading", {
        name: /^manager$/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /view outstanding requests/i,
      })
    ).toHaveAttribute(
      "href",
      "/manager/requests"
    );
  });

  test("shows staff leave balance navigation for a manager", async () => {
    mockUser.mockReturnValue({
      id: 2,
      first_name: "Mia",
      surname: "Manager",
      role_id: 2,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("link", {
        name: /view staff balances/i,
      })
    ).toHaveAttribute(
      "href",
      "/manager/staff-balances"
    );
  });

  test("does not show the manager section for an employee", async () => {
    mockUser.mockReturnValue({
      id: 1,
      first_name: "Test",
      surname: "Employee",
      role_id: 1,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    await screen.findByText("25");

    expect(
      screen.queryByRole("heading", {
        name: /^manager$/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /view outstanding requests/i,
      })
    ).not.toBeInTheDocument();
  });

  test("does not show staff leave balance navigation for an employee", async () => {
    mockUser.mockReturnValue({
      id: 1,
      first_name: "Test",
      surname: "Employee",
      role_id: 1,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    await screen.findByText("25");

    expect(
      screen.queryByRole("link", {
        name: /view staff balances/i,
      })
    ).not.toBeInTheDocument();
  });

  test("shows the administration section for an admin", async () => {
    mockUser.mockReturnValue({
      id: 3,
      first_name: "Alex",
      surname: "Admin",
      role_id: 3,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("heading", {
        name: /^administration$/i,
      })
    ).toBeInTheDocument();
  });

  test("shows create user navigation for an admin", async () => {
    mockUser.mockReturnValue({
      id: 3,
      first_name: "Alex",
      surname: "Admin",
      role_id: 3,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("link", {
        name: /^create user$/i,
      })
    ).toHaveAttribute(
      "href",
      "/admin/users/create"
    );
  });

  test("shows outstanding requests report navigation for an admin", async () => {
    mockUser.mockReturnValue({
      id: 3,
      first_name: "Alex",
      surname: "Admin",
      role_id: 3,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    expect(
      await screen.findByRole("link", {
        name: /view report/i,
      })
    ).toHaveAttribute(
      "href",
      "/admin/reports/outstanding-requests"
    );
  });

  test("does not show the administration section for an employee", async () => {
    mockUser.mockReturnValue({
      id: 1,
      first_name: "Test",
      surname: "Employee",
      role_id: 1,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    await screen.findByText("25");

    expect(
      screen.queryByRole("heading", {
        name: /^administration$/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /^create user$/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /view report/i,
      })
    ).not.toBeInTheDocument();
  });

  test("does not show the administration section for a manager", async () => {
    mockUser.mockReturnValue({
      id: 2,
      first_name: "Mia",
      surname: "Manager",
      role_id: 2,
    });

    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    renderDashboardPage();

    await screen.findByRole("heading", {
      name: /^manager$/i,
    });

    expect(
      screen.queryByRole("heading", {
        name: /^administration$/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /^create user$/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /view report/i,
      })
    ).not.toBeInTheDocument();
  });
});