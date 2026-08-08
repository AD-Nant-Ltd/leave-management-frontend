import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ProtectedRoute from "../../routes/ProtectedRoute";

let mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
};

vi.mock("../../hooks/useAuth", () => ({
  default: () => mockAuthState,
}));

function renderProtectedRoute(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<p>Login Page</p>} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<p>Dashboard Page</p>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: false,
      isLoading: false,
    };
  });

  test("redirects unauthenticated users to login", () => {
    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Dashboard Page")
    ).not.toBeInTheDocument();
  });

  test("allows authenticated users to access protected content", () => {
    mockAuthState = {
      isAuthenticated: true,
      isLoading: false,
    };

    renderProtectedRoute();

    expect(
      screen.getByText("Dashboard Page")
    ).toBeInTheDocument();
  });

  test("shows loading state while authentication is being checked", () => {
    mockAuthState = {
      isAuthenticated: false,
      isLoading: true,
    };

    renderProtectedRoute();

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();
  });
});