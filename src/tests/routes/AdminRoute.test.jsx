import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import AdminRoute from "../../routes/AdminRoute";

const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  default: () => mockUseAuth(),
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin/test"]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/test"
            element={<p>Admin Content</p>}
          />
        </Route>

        <Route
          path="/dashboard"
          element={<p>Dashboard Content</p>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  test("allows an administrator to access admin content", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 3,
        role_id: 3,
      },
      isLoading: false,
    });

    renderRoute();

    expect(
      screen.getByText("Admin Content")
    ).toBeInTheDocument();
  });

  test("redirects an employee to the dashboard", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        role_id: 1,
      },
      isLoading: false,
    });

    renderRoute();

    expect(
      screen.getByText("Dashboard Content")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Admin Content")
    ).not.toBeInTheDocument();
  });

  test("redirects a manager to the dashboard", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 2,
        role_id: 2,
      },
      isLoading: false,
    });

    renderRoute();

    expect(
      screen.getByText("Dashboard Content")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Admin Content")
    ).not.toBeInTheDocument();
  });

  test("shows loading state while authentication is being restored", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    });

    renderRoute();

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Admin Content")
    ).not.toBeInTheDocument();
  });
});