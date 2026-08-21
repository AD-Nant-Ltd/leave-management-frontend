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
import StaffLeaveBalancesPage from "../../../pages/manager/StaffLeaveBalancesPage";

const mockGetManagerStaffForBalanceSelection = vi.fn();
const mockGetStaffLeaveBalance = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "manager-token",
  }),
}));

vi.mock("../../../services/managerService", () => ({
  default: {
    getManagerStaffForBalanceSelection: (...args) =>
      mockGetManagerStaffForBalanceSelection(...args),

    getStaffLeaveBalance: (...args) =>
      mockGetStaffLeaveBalance(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <StaffLeaveBalancesPage />
    </MemoryRouter>
  );
}

describe("StaffLeaveBalancesPage", () => {
  beforeEach(() => {
    mockGetManagerStaffForBalanceSelection.mockReset();
    mockGetStaffLeaveBalance.mockReset();

    vi.restoreAllMocks();
  });

  test("shows a loading message while staff balances are retrieved", () => {
    mockGetManagerStaffForBalanceSelection.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      screen.getByText(/loading staff leave balances/i)
    ).toBeInTheDocument();
  });

  test("retrieves manager staff using the authenticated token", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([]);

    renderPage();

    await screen.findByRole("status");

    expect(
      mockGetManagerStaffForBalanceSelection
    ).toHaveBeenCalledWith("manager-token");

    expect(
      mockGetManagerStaffForBalanceSelection
    ).toHaveBeenCalledTimes(1);
  });

  test("retrieves the leave balance for each discovered employee", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
      {
        id: 5,
        first_name: "Emily",
        surname: "Employee",
      },
    ]);

    mockGetStaffLeaveBalance
      .mockResolvedValueOnce({
        user_id: 1,
        annual_allowance: 25,
        days_used: 10,
        days_remaining: 15,
      })
      .mockResolvedValueOnce({
        user_id: 5,
        annual_allowance: 25,
        days_used: 5,
        days_remaining: 20,
      });

    renderPage();

    await screen.findByText("Adam Employee");

    expect(
      mockGetStaffLeaveBalance
    ).toHaveBeenCalledWith(
      "manager-token",
      1
    );

    expect(
      mockGetStaffLeaveBalance
    ).toHaveBeenCalledWith(
      "manager-token",
      5
    );

    expect(
      mockGetStaffLeaveBalance
    ).toHaveBeenCalledTimes(2);
  });

  test("displays employee names and leave balances", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
      {
        id: 5,
        first_name: "Emily",
        surname: "Employee",
      },
    ]);

    mockGetStaffLeaveBalance
      .mockResolvedValueOnce({
        user_id: 1,
        annual_allowance: 25,
        days_used: 10,
        days_remaining: 15,
      })
      .mockResolvedValueOnce({
        user_id: 5,
        annual_allowance: 30,
        days_used: 8,
        days_remaining: 22,
      });

    renderPage();

    expect(
      await screen.findByText("Adam Employee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Emily Employee")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("25")
    ).toHaveLength(1);

    expect(
      screen.getByText("10")
    ).toBeInTheDocument();

    expect(
      screen.getByText("15")
    ).toBeInTheDocument();

    expect(
      screen.getByText("30")
    ).toBeInTheDocument();

    expect(
      screen.getByText("8")
    ).toBeInTheDocument();

    expect(
      screen.getByText("22")
    ).toBeInTheDocument();
  });

  test("displays the expected table headings", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    renderPage();

    await screen.findByText("Adam Employee");

    expect(
      screen.getByRole("columnheader", {
        name: /employee/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /annual allowance/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /leave taken/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /remaining leave/i,
      })
    ).toBeInTheDocument();
  });

  test("displays an empty state when no staff are available", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent(
      "There are currently no staff balances available to view."
    );

    expect(
      mockGetStaffLeaveBalance
    ).not.toHaveBeenCalled();
  });

  test("displays an API error when staff cannot be loaded", async () => {
    mockGetManagerStaffForBalanceSelection.mockRejectedValue({
      response: {
        data: {
          error:
            "Only managers can view staff leave balances",
        },
      },
    });

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Only managers can view staff leave balances"
    );
  });

  test("displays a generic error when staff loading fails without an API message", async () => {
    mockGetManagerStaffForBalanceSelection.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load staff leave balances."
    );
  });

  test("displays an error when an employee balance cannot be retrieved", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
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

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "This manager is not authorised to view this staff member's leave balance"
    );
  });

  test("provides navigation back to the dashboard", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });

  test("shows the CSV export action when staff balance data exists", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    renderPage();

    expect(
      await screen.findByRole("button", {
        name: /export csv/i,
      })
    ).toBeInTheDocument();
  });

  test("does not show the CSV export action when no staff balances exist", async () => {
    mockGetManagerStaffForBalanceSelection.mockResolvedValue([]);

    renderPage();

    await screen.findByRole("status");

    expect(
      screen.queryByRole("button", {
        name: /export csv/i,
      })
    ).not.toBeInTheDocument();
  });

  test("exports the displayed staff balance data to CSV", async () => {
    const user = userEvent.setup();

    mockGetManagerStaffForBalanceSelection.mockResolvedValue([
      {
        id: 1,
        first_name: "Adam",
        surname: "Employee",
      },
    ]);

    mockGetStaffLeaveBalance.mockResolvedValue({
      user_id: 1,
      annual_allowance: 25,
      days_used: 10,
      days_remaining: 15,
    });

    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test-url");

    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: /export csv/i,
      })
    );

    expect(createObjectURL).toHaveBeenCalledTimes(1);

    const blob = createObjectURL.mock.calls[0][0];

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8;");

    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith(
      "blob:test-url"
    );
  });
});