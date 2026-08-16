import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import ManagerRoute from "../../routes/ManagerRoute";

const mockAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  default: () => mockAuth(),
}));

function LocationDisplay() {
  const location = useLocation();

  return (
    <div data-testid="location">
      {location.pathname}
    </div>
  );
}

function renderManagerRoute() {
  return render(
    <MemoryRouter
      initialEntries={["/manager/requests"]}
    >
      <Routes>
        <Route element={<ManagerRoute />}>
          <Route
            path="/manager/requests"
            element={<div>Manager Content</div>}
          />
        </Route>

        <Route
          path="/dashboard"
          element={
            <>
              <div>Dashboard</div>
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ManagerRoute", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  test("shows a loading state while authentication is loading", () => {
    mockAuth.mockReturnValue({
      user: null,
      isLoading: true,
    });

    renderManagerRoute();

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();
  });

  test("allows a manager to access manager routes", () => {
    mockAuth.mockReturnValue({
      user: {
        id: 2,
        first_name: "Mia",
        surname: "Manager",
        role_id: 2,
      },
      isLoading: false,
    });

    renderManagerRoute();

    expect(
      screen.getByText("Manager Content")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Dashboard")
    ).not.toBeInTheDocument();
  });

  test("redirects a non-manager to the dashboard", async () => {
    mockAuth.mockReturnValue({
      user: {
        id: 1,
        first_name: "Test",
        surname: "Employee",
        role_id: 1,
      },
      isLoading: false,
    });

    renderManagerRoute();

    expect(
      await screen.findByText("Dashboard")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("location")
    ).toHaveTextContent("/dashboard");

    expect(
      screen.queryByText("Manager Content")
    ).not.toBeInTheDocument();
  });

  test("redirects when no authenticated manager user is available", async () => {
    mockAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    renderManagerRoute();

    expect(
      await screen.findByText("Dashboard")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("location")
    ).toHaveTextContent("/dashboard");
  });
});