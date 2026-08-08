import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import AppLayout from "../../layouts/AppLayout";

const mockLogout = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  default: () => ({
    logout: mockLogout,
  }),
}));

describe("AppLayout", () => {
  test("renders a logout button", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<p>Dashboard Page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: /logout/i })
    ).toBeInTheDocument();
  });

  test("calls logout and redirects to login", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<p>Login Page</p>} />

          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<p>Dashboard Page</p>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("button", { name: /logout/i })
    );

    expect(mockLogout).toHaveBeenCalledTimes(1);

    expect(
      await screen.findByText("Login Page")
    ).toBeInTheDocument();
  });
});