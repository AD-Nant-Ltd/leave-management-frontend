import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DashboardPage from "../../../pages/employee/DashboardPage";

const mockGetLeaveBalance = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "test-token",
  }),
}));

vi.mock("../../../services/leaveService", () => ({
  default: {
    getLeaveBalance: (...args) => mockGetLeaveBalance(...args),
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    mockGetLeaveBalance.mockReset();
  });

  test("shows a loading message while leave balance is being retrieved", () => {
    mockGetLeaveBalance.mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />);

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

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /leave balance/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /annual allowance/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /leave taken/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /remaining leave/i })
    ).toBeInTheDocument();

    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  test("retrieves the leave balance using the authenticated token", async () => {
    mockGetLeaveBalance.mockResolvedValue({
      annual_allowance: 25,
      days_used: 5,
      days_remaining: 20,
    });

    render(<DashboardPage />);

    await screen.findByText("25");

    expect(mockGetLeaveBalance).toHaveBeenCalledWith("test-token");
    expect(mockGetLeaveBalance).toHaveBeenCalledTimes(1);
  });

  test("shows an error when the leave balance cannot be retrieved", async () => {
    mockGetLeaveBalance.mockRejectedValue(
      new Error("API unavailable")
    );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load leave balance.");
  });
});