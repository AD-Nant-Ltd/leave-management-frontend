import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import LoginPage from "../../../pages/auth/LoginPage";

const mockLogin = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    login: mockLogin,
  }),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  test("renders the login form", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: /login/i })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email address/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("allows the user to enter email and password", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("submits the entered credentials", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({});

    renderLoginPage();

    await user.type(
      screen.getByLabelText(/email address/i),
      "user@example.com"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "password123"
    );

    await user.click(
      screen.getByRole("button", { name: /sign in/i })
    );

    expect(mockLogin).toHaveBeenCalledWith(
      "user@example.com",
      "password123"
    );
  });

  test("shows an error when authentication fails", async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    renderLoginPage();

    await user.type(
      screen.getByLabelText(/email address/i),
      "user@example.com"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "wrong-password"
    );

    await user.click(
      screen.getByRole("button", { name: /sign in/i })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Invalid email address or password.");
  });
});