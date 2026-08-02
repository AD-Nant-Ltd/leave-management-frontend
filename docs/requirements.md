# Requirements Specification

## 1. Introduction

This document defines the functional and non-functional requirements for the Leave Management System frontend.

The frontend will communicate with the existing Laravel Leave Management API and provide functionality for employees, managers and administrators.

---

# 2. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR01 | The system shall allow registered users to log in using valid credentials. |
| FR02 | The system shall allow authenticated users to log out. |
| FR03 | Employees shall be able to view their current leave balance. |
| FR04 | Employees shall be able to submit leave requests. |
| FR05 | Employees shall be able to view their own leave requests. |
| FR06 | Employees shall be able to cancel pending leave requests. |
| FR07 | Managers shall be able to view outstanding leave requests. |
| FR08 | Managers shall be able to approve leave requests. |
| FR09 | Managers shall be able to reject leave requests. |
| FR10 | Managers shall be able to view staff leave balances. |
| FR11 | Administrators shall be able to manage users. |
| FR12 | Administrators shall be able to update employee leave allowances. |
| FR13 | Administrators shall be able to view management reports. |

---

# 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR01 | The application shall be responsive across desktop, tablet and mobile devices. |
| NFR02 | The application shall communicate with the Laravel REST API. |
| NFR03 | The application shall use JWT authentication. |
| NFR04 | Restricted functionality shall only be accessible to authorised users. |
| NFR05 | Forms shall display meaningful validation messages. |
| NFR06 | The application shall provide loading and error feedback during API requests. |
| NFR07 | The application shall follow a consistent user interface throughout the application. |
| NFR08 | The application shall be accessible using keyboard navigation where appropriate. |

---

# 4. User Roles

The application supports three user roles:

- Employee
- Manager
- Administrator

Each role has different permissions which are enforced by the backend API.

---

# 5. Assumptions

- The Laravel API already exists.
- Authentication is handled using JWT.
- The frontend consumes REST API endpoints.
- The frontend is implemented using React.