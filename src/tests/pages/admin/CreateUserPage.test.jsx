import {
  fireEvent,
  render,
  screen,
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
import CreateUserPage from "../../../pages/admin/CreateUserPage";

const mockCreateUser = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    token: "admin-token",
  }),
}));

vi.mock("../../../services/adminService", () => ({
  default: {
    createUser: (...args) =>
      mockCreateUser(...args),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CreateUserPage />
    </MemoryRouter>
  );
}

async function completeValidForm(user) {
  await user.type(
    screen.getByLabelText(/first name/i),
    "Test"
  );

  await user.type(
    screen.getByLabelText(/surname/i),
    "User"
  );

  await user.type(
    screen.getByLabelText(/email address/i),
    "test.user@example.com"
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "password123"
  );
}

describe("CreateUserPage", () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
  });

  test("renders the create user form", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: /create user/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/first name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/surname/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email address/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^role/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/annual leave allowance/i)
    ).toBeInTheDocument();
  });

  test("defaults the role to employee and leave allowance to 25", () => {
    renderPage();

    expect(
      screen.getByLabelText(/^role/i)
    ).toHaveValue("1");

    expect(
      screen.getByLabelText(/annual leave allowance/i)
    ).toHaveValue(25);
  });

  test("prevents submission when required fields are incomplete", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please complete all required fields."
    );

    expect(
      mockCreateUser
    ).not.toHaveBeenCalled();
  });

  test("prevents submission when email is invalid", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByLabelText(/first name/i),
      "Test"
    );

    await user.type(
      screen.getByLabelText(/surname/i),
      "User"
    );

    await user.type(
      screen.getByLabelText(/email address/i),
      "invalid-email"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please enter a valid email address."
    );

    expect(
      mockCreateUser
    ).not.toHaveBeenCalled();
  });

  test("prevents submission when password is shorter than six characters", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByLabelText(/first name/i),
      "Test"
    );

    await user.type(
      screen.getByLabelText(/surname/i),
      "User"
    );

    await user.type(
      screen.getByLabelText(/email address/i),
      "test.user@example.com"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "abc"
    );

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Password must be at least 6 characters."
    );

    expect(
      mockCreateUser
    ).not.toHaveBeenCalled();
  });

  test("prevents submission when annual leave allowance is negative", async () => {
    const user = userEvent.setup();

    renderPage();

    await completeValidForm(user);

    const allowanceInput =
      screen.getByLabelText(
        /annual leave allowance/i
      );

    fireEvent.change(allowanceInput, {
      target: {
        value: "-1",
      },
    });

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Annual leave allowance cannot be negative."
    );

    expect(
      mockCreateUser
    ).not.toHaveBeenCalled();
  });

  test("submits a valid employee using the authenticated admin token", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
      data: {
        id: 10,
        email: "test.user@example.com",
        role_id: 1,
      },
    });

    renderPage();

    await completeValidForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      mockCreateUser
    ).toHaveBeenCalledWith(
      "admin-token",
      {
        first_name: "Test",
        surname: "User",
        email: "test.user@example.com",
        password: "password123",
        role_id: 1,
        annual_leave_balance: 25,
      }
    );

    expect(
      mockCreateUser
    ).toHaveBeenCalledTimes(1);
  });

  test("submits manager role as role id 2", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
    });

    renderPage();

    await completeValidForm(user);

    await user.selectOptions(
      screen.getByLabelText(/^role/i),
      "2"
    );

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      mockCreateUser
    ).toHaveBeenCalledWith(
      "admin-token",
      expect.objectContaining({
        role_id: 2,
      })
    );
  });

  test("submits admin role as role id 3", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
    });

    renderPage();

    await completeValidForm(user);

    await user.selectOptions(
      screen.getByLabelText(/^role/i),
      "3"
    );

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      mockCreateUser
    ).toHaveBeenCalledWith(
      "admin-token",
      expect.objectContaining({
        role_id: 3,
      })
    );
  });

  test("allows the administrator to change annual leave allowance", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
    });

    renderPage();

    await completeValidForm(user);

    const allowanceInput =
      screen.getByLabelText(
        /annual leave allowance/i
      );

    await user.clear(allowanceInput);
    await user.type(allowanceInput, "30");

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      mockCreateUser
    ).toHaveBeenCalledWith(
      "admin-token",
      expect.objectContaining({
        annual_leave_balance: 30,
      })
    );
  });

  test("displays success feedback after user creation", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
    });

    renderPage();

    await completeValidForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent(
      "User created successfully"
    );
  });

  test("resets the form after successful user creation", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockResolvedValue({
      message: "User created successfully",
    });

    renderPage();

    await completeValidForm(user);

    await user.selectOptions(
      screen.getByLabelText(/^role/i),
      "2"
    );

    const allowanceInput =
      screen.getByLabelText(
        /annual leave allowance/i
      );

    await user.clear(allowanceInput);
    await user.type(allowanceInput, "30");

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    await screen.findByRole("status");

    expect(
      screen.getByLabelText(/first name/i)
    ).toHaveValue("");

    expect(
      screen.getByLabelText(/surname/i)
    ).toHaveValue("");

    expect(
      screen.getByLabelText(/email address/i)
    ).toHaveValue("");

    expect(
      screen.getByLabelText(/password/i)
    ).toHaveValue("");

    expect(
      screen.getByLabelText(/^role/i)
    ).toHaveValue("1");

    expect(
      screen.getByLabelText(/annual leave allowance/i)
    ).toHaveValue(25);
  });

  test("displays backend validation errors", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockRejectedValue({
      response: {
        data: {
          message:
            "The email has already been taken.",
        },
      },
    });

    renderPage();

    await completeValidForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "The email has already been taken."
    );
  });

  test("displays Laravel field validation errors", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockRejectedValue({
      response: {
        data: {
          errors: {
            email: [
              "The email has already been taken.",
            ],
          },
        },
      },
    });

    renderPage();

    await completeValidForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "The email has already been taken."
    );
  });

  test("displays a generic error when user creation fails without an API message", async () => {
    const user = userEvent.setup();

    mockCreateUser.mockRejectedValue(
      new Error("Network failure")
    );

    renderPage();

    await completeValidForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /^create user$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to create user."
    );
  });

  test("provides navigation back to the dashboard", () => {
    renderPage();

    expect(
      screen.getByRole("link", {
        name: /back to dashboard/i,
      })
    ).toHaveAttribute("href", "/dashboard");
  });
});