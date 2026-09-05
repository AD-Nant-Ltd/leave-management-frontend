import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AuthProvider from "../../context/AuthProvider";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";

vi.mock("../../services/authService", () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const localStorageMock = (() => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] ?? null),

    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),

    removeItem: vi.fn((key) => {
      delete store[key];
    }),

    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

function AuthStateProbe() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();

  return (
    <div>
      <p data-testid="loading">
        {isLoading ? "loading" : "ready"}
      </p>

      <p data-testid="authenticated">
        {isAuthenticated ? "authenticated" : "unauthenticated"}
      </p>

      <p data-testid="token">
        {token ?? "no-token"}
      </p>

      <p data-testid="user">
        {user
          ? `${user.first_name} ${user.surname}`
          : "no-user"}
      </p>

      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  test("remains unauthenticated when no stored token exists", async () => {
    renderAuthProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId("loading")
      ).toHaveTextContent("ready");
    });

    expect(
      screen.getByTestId("authenticated")
    ).toHaveTextContent("unauthenticated");

    expect(
      screen.getByTestId("token")
    ).toHaveTextContent("no-token");

    expect(
      screen.getByTestId("user")
    ).toHaveTextContent("no-user");

    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  test("restores authentication from a valid stored token", async () => {
    localStorageMock.setItem(
      "leave_management_token",
      "valid-token"
    );

    authService.getCurrentUser.mockResolvedValue({
      id: 1,
      first_name: "Test",
      surname: "Employee",
      role_id: 1,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("authenticated");
    });

    expect(authService.getCurrentUser).toHaveBeenCalledWith(
      "valid-token"
    );

    expect(
      screen.getByTestId("token")
    ).toHaveTextContent("valid-token");

    expect(
      screen.getByTestId("user")
    ).toHaveTextContent("Test Employee");
  });

  test("removes an invalid stored token when session restoration fails", async () => {
    localStorageMock.setItem(
      "leave_management_token",
      "invalid-token"
    );

    authService.getCurrentUser.mockRejectedValue(
      new Error("Unauthorized")
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId("loading")
      ).toHaveTextContent("ready");
    });

    expect(
      localStorageMock.getItem("leave_management_token")
    ).toBeNull();

    expect(
      localStorageMock.removeItem
    ).toHaveBeenCalledWith("leave_management_token");

    expect(
      screen.getByTestId("authenticated")
    ).toHaveTextContent("unauthenticated");

    expect(
      screen.getByTestId("token")
    ).toHaveTextContent("no-token");

    expect(
      screen.getByTestId("user")
    ).toHaveTextContent("no-user");
  });

  test("logout removes the stored token and clears authentication state", async () => {
    localStorageMock.setItem(
      "leave_management_token",
      "valid-token"
    );

    authService.getCurrentUser.mockResolvedValue({
      id: 3,
      first_name: "Alex",
      surname: "Admin",
      role_id: 3,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("authenticated");
    });

    await act(async () => {
      screen.getByRole("button", { name: "Logout" }).click();
    });

    expect(
      localStorageMock.getItem("leave_management_token")
    ).toBeNull();

    expect(
      localStorageMock.removeItem
    ).toHaveBeenCalledWith("leave_management_token");

    expect(
      screen.getByTestId("authenticated")
    ).toHaveTextContent("unauthenticated");

    expect(
      screen.getByTestId("token")
    ).toHaveTextContent("no-token");

    expect(
      screen.getByTestId("user")
    ).toHaveTextContent("no-user");
  });
});