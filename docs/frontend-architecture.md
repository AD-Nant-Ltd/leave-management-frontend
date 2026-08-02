# Frontend Architecture

## 1. Purpose

This document defines the proposed architecture for the Leave Management System frontend.

The frontend will be developed using React and Vite and will communicate with the existing Laravel Leave Management API. The purpose of this document is to establish a consistent architecture before development begins, ensuring that the application remains maintainable, scalable and easy to understand throughout implementation.

This document is intended to evolve alongside the project and will be updated as architectural decisions are made.

---

## 2. Technology Stack

| Technology | Purpose |
|------------|---------|
| React | User interface library |
| Vite | Frontend build tool and development server |
| JavaScript | Application programming language |
| React Router | Client-side routing |
| Axios | API communication |
| Bootstrap 5 *(planned)* | Responsive layout and UI styling |
| Git & GitHub | Version control |
| Vitest *(planned)* | Unit testing |
| React Testing Library *(planned)* | Component testing |

---

## 3. Repository Structure

The project consists of two independent applications.

### Backend

Repository:

`leave-management-api`

Responsibilities:

- Authentication
- Business logic
- Data validation
- Database interaction
- Authorisation
- REST API

### Frontend

Repository:

`leave-management-frontend`

Responsibilities:

- User interface
- Navigation
- Form handling
- API communication
- Session management
- Responsive layouts

Keeping the frontend and backend in separate repositories provides a clear separation of responsibilities and allows each application to evolve independently.

---

## 4. High-Level Architecture

The application will follow a layered architecture.

```text
Browser
    │
    ▼
React Router
    │
    ▼
Application Layout
    │
    ▼
Page
    │
    ▼
Reusable Components
    │
    ▼
Service Layer
    │
    ▼
Axios API Client
    │
    ▼
Laravel API
```

Each layer has a single responsibility.

| Layer | Responsibility |
|-------|----------------|
| React Router | Determines which page is displayed |
| Layout | Shared page structure and navigation |
| Pages | Complete application screens |
| Components | Reusable user interface elements |
| Services | Business-specific API requests |
| Axios Client | Shared HTTP configuration |
| Laravel API | Authentication, business logic and data |

---

## 5. Proposed Folder Structure

```text
src/
│
├── assets/
├── components/
│   ├── common/
│   ├── forms/
│   ├── layout/
│   └── ui/
│
├── context/
├── hooks/
├── layouts/
│
├── pages/
│   ├── auth/
│   ├── employee/
│   ├── manager/
│   └── admin/
│
├── routes/
├── services/
├── tests/
├── utils/
│
├── App.jsx
├── main.jsx
└── index.css
```

This structure separates application concerns and encourages reusable components rather than duplicating functionality.

---

## 6. Design Principles

The frontend will be developed using the following principles.

### Separation of Concerns

Each file should have a single responsibility.

Pages should coordinate components.

Components should render user interface.

Services should communicate with the API.

---

### Reusability

Reusable components should be created where functionality or layouts are repeated.

Examples include:

- Buttons
- Cards
- Tables
- Form controls
- Loading indicators
- Error messages

---

### Maintainability

The application should remain easy to modify by:

- using consistent naming conventions;
- avoiding duplicated code;
- keeping components small;
- separating API logic from presentation.

---

### Security

The frontend should:

- use JWT authentication;
- protect restricted routes;
- avoid exposing sensitive information;
- rely on the backend for authorisation.

---

### Accessibility

The application should be designed to support:

- semantic HTML;
- keyboard navigation;
- visible focus indicators;
- sufficient colour contrast;
- accessible forms.

Accessibility should be considered throughout development rather than added afterwards.

---

## 7. Initial Implementation Plan

Development will follow an incremental approach.

### Phase 1

- Initialise React application
- Configure GitHub repository
- Create project architecture
- Configure routing
- Configure Axios

### Phase 2

- Authentication
- Login
- Session management
- Protected routes

### Phase 3

Employee functionality

- View leave balance
- Submit leave request
- View own requests
- Cancel leave request

### Phase 4

Manager functionality

- Outstanding requests
- Approve requests
- Reject requests
- View staff leave balance

### Phase 5

Administrator functionality

- User management
- Leave allowance management
- Reporting

### Phase 6

Testing and refinement

- Unit testing
- Responsive testing
- Accessibility testing
- Cross-browser testing
- Performance improvements

---

## 8. Future Updates

This document represents the initial architecture of the project.

Additional sections will be added as development progresses, including:

- Authentication architecture
- Routing strategy
- Service layer
- State management
- API integration
- Testing architecture
- Security considerations
- Final architecture review