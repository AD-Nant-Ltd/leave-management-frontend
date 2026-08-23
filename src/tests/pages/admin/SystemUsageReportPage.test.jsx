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
import SystemUsageReportPage from "../../../pages/admin/SystemUsageReportPage";

const mockGetSystemUsageReport = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "admin-token",
  }),
}));

vi.mock("../../../services/adminService", () => ({
  default: {
    getSystemUsageReport: (...args) =>
      mockGetSystemUsageReport(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SystemUsageReportPage />
    </MemoryRouter>
  );
}

function systemUsageReport() {
  return {
    total_requests: 41,
    pending_requests: 7,
    approved_requests: 21,
    rejected_requests: 8,
    cancelled_requests: 5,
    approved_days_used: 63,
  };
}

describe("SystemUsageReportPage", () => {
  beforeEach(() => {
    mockGetSystemUsageReport.mockReset();
  });

  test("shows a loading message while the report is retrieved", () => {
    mockGetSystemUsageReport.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      screen.getByText(/loading system usage report/i)
    ).toBeInTheDocument();
  });

  test("retrieves the report using the authenticated admin token", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      mockGetSystemUsageReport
    ).toHaveBeenCalledWith("admin-token");

    expect(
      mockGetSystemUsageReport
    ).toHaveBeenCalledTimes(1);
  });

  test("displays total requests", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: /total requests/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("41")
    ).toBeInTheDocument();
  });

  test("displays pending requests", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      screen.getByRole("heading", {
        name: /pending requests/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("7")
    ).toBeInTheDocument();
  });

  test("displays approved requests", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      screen.getByRole("heading", {
        name: /^approved requests$/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("21")
    ).toBeInTheDocument();
  });

  test("displays rejected requests", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      screen.getByRole("heading", {
        name: /rejected requests/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("8")
    ).toBeInTheDocument();
  });

  test("displays cancelled requests", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      screen.getByRole("heading", {
        name: /cancelled requests/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("5")
    ).toBeInTheDocument();
  });

  test("displays approved leave days used", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    await screen.findByText("41");

    expect(
      screen.getByRole("heading", {
        name: /approved leave days used/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("63")
    ).toBeInTheDocument();
  });

  test("displays an API error message when one is returned", async () => {
    mockGetSystemUsageReport.mockRejectedValue({
      response: {
        data: {
          error:
            "Only admins can view system usage reports",
        },
      },
    });

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Only admins can view system usage reports"
    );
  });

  test("displays a generic error when report retrieval fails", async () => {
    mockGetSystemUsageReport.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load system usage report."
    );
  });

  test("provides a refresh action", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    expect(
      await screen.findByRole("button", {
        name: /^refresh$/i,
      })
    ).toBeInTheDocument();
  });

  test("retrieves fresh report data when refresh is selected", async () => {
    const user = userEvent.setup();

    mockGetSystemUsageReport
      .mockResolvedValueOnce({
        data: systemUsageReport(),
      })
      .mockResolvedValueOnce({
        data: {
          total_requests: 42,
          pending_requests: 8,
          approved_requests: 21,
          rejected_requests: 8,
          cancelled_requests: 5,
          approved_days_used: 63,
        },
      });

    renderPage();

    expect(
      await screen.findByText("41")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /^refresh$/i,
      })
    );

    expect(
      await screen.findByText("42")
    ).toBeInTheDocument();

    const pendingHeading = screen.getByRole(
      "heading",
      {
        name: /pending requests/i,
      }
    );

    const pendingCard =
      pendingHeading.closest(".card");

    expect(pendingCard).not.toBeNull();

    expect(
      within(pendingCard).getByText("8")
    ).toBeInTheDocument();

    expect(
      mockGetSystemUsageReport
    ).toHaveBeenCalledTimes(2);
  });

  test("shows a refreshing state while fresh data is retrieved", async () => {
    const user = userEvent.setup();

    mockGetSystemUsageReport
      .mockResolvedValueOnce({
        data: systemUsageReport(),
      })
      .mockReturnValueOnce(
        new Promise(() => {})
      );

    renderPage();

    await screen.findByText("41");

    await user.click(
      screen.getByRole("button", {
        name: /^refresh$/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /refreshing/i,
      })
    ).toBeDisabled();

    expect(
      screen.getByText("41")
    ).toBeInTheDocument();
  });

  test("displays an error when refreshing fails", async () => {
    const user = userEvent.setup();

    mockGetSystemUsageReport
      .mockResolvedValueOnce({
        data: systemUsageReport(),
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error:
              "Unable to retrieve current statistics",
          },
        },
      });

    renderPage();

    await screen.findByText("41");

    await user.click(
      screen.getByRole("button", {
        name: /^refresh$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to retrieve current statistics"
    );

    expect(
      screen.getByText("41")
    ).toBeInTheDocument();
  });

  test("provides navigation back to the dashboard", async () => {
    mockGetSystemUsageReport.mockResolvedValue({
      data: systemUsageReport(),
    });

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });
});