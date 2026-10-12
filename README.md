# Merchant Portal


## User Roles and Isolation

The portal implements strict role-based access control and data isolation:

- SALES:
  - Sales Representative 1 (sales)
  - Sales Representative 2 (sales2)
  - Sales Representative 3 (sales3)
  - Permissions: Creates and edits merchant applications. Only sees applications created by their own user account.

- REVIEWER:
  - Risk Underwriter 1 (reviewer)
  - Risk Underwriter 2 (reviewer2)
  - Risk Underwriter 3 (reviewer3)
  - Permissions: Reviews submitted applications and records risk decisions (APPROVE, REJECT, REQUEST_CHANGES). Only sees applications assigned to their own user account.

- ADMIN:
  - Administrator (admin)
  - Permissions: Global visibility across all applications, manages reviewer assignments, and records underwriting decisions.

### Default Credentials

| Username | Password | Full Name | Role | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| sales | sales | Sales Representative 1 | SALES | Own created applications |
| sales2 | sales2 | Sales Representative 2 | SALES | Own created applications |
| sales3 | sales3 | Sales Representative 3 | SALES | Own created applications |
| reviewer | reviewer | Risk Underwriter 1 | REVIEWER | Own assigned applications |
| reviewer2 | reviewer2 | Risk Underwriter 2 | REVIEWER | Own assigned applications |
| reviewer3 | reviewer3 | Risk Underwriter 3 | REVIEWER | Own assigned applications |
| admin | admin | Administrator | ADMIN | All applications and assignments |

## Running the Application with Docker Compose

Prerequisites: Docker and Docker Compose installed and running. No additional environment setup or configuration is required.

Run the entire platform using Docker Compose:

```bash
docker compose up --build
```

Access Points:
- Web Application: http://localhost:4200
- Backend REST API: http://localhost:3000/api

To run in detached mode in the background:

```bash
docker compose up -d --build
```

To stop containers:

```bash
docker compose down
```

## Running Without Docker (Simultaneous Runner Script)

If Docker is not installed, you can run both the NestJS API and Angular frontend simultaneously using a single command:

### 1. Install Dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 2. Start Both Projects Simultaneously

Run the unified runner script:

```bash
npm run start:all
```

Alternatively:

```bash
npm run dev
```

On Windows, you can also run:

```cmd
start.bat
```

On macOS / Linux, you can also run:

```bash
./start.sh
```

What the simultaneous runner does:
- Automatically compiles the backend TypeScript codebase
- Starts the NestJS API server on port 3000 with prefixed console logs
- Starts the Angular client on port 4200 with automatic proxying of `/api` calls to port 3000
- Handles clean shutdown of both processes upon pressing Ctrl+C

### Alternative: Running in Separate Terminals

Terminal 1 (Backend API):

```bash
npm run start:server
```

Terminal 2 (Frontend Client):

```bash
npm start
```

## Running Unit Tests

Execute the Vitest test suite across all 26 unit test suites (111 tests):

```bash
npm test
```

To execute a single test run without file watching:

```bash
npm test -- --run
```

## Content Security Policy (CSP) Protection

Merchant portals process sensitive merchant tax identifiers (EIN/TIN) and settlement bank accounts. The portal enforces Content Security Policy (CSP) protection configured at the web server and application levels:

- Data Exfiltration Barrier:
  `connect-src 'self'` prevents injected malicious scripts or cross-site scripting (XSS) payloads from sending unmasked tax identifiers or bank account details to external servers.
- Anti-Clickjacking Protection:
  `frame-ancestors 'none'` prevents the merchant portal from being rendered within hidden iframes on external websites, mitigating UI redressing attacks against underwriter approval actions.
- Script and Source Boundaries:
  `default-src 'self'` restricts executable code and script assets strictly to trusted origin resources.

In addition to CSP headers, sensitive financial fields (Tax IDs and Bank Account numbers) remain masked client-side by default with controlled role-based reveal privileges granted only to Reviewers and Admins, coupled with audit logging.

## Key Architectural Highlights

- Modular Multi-Step Wizard: 4 dedicated step components (Business Profile, Contact Info, Banking Info, Processing & Review) with reactive draft auto-saving.
- Shared Reusable Pagination: Independent component with configurable page sizes, pagination controls, and range indicators.
- Base Component Inheritance: Shared base class injecting standard services and providing subscription lifecycle cleanup.
- Sensitive Data Masking: EIN, TIN, and bank account numbers masked by default with audit trails for reveal events.
- Resilient Concurrent 401 Mutex: Interceptor queues parallel requests when token expires and automatically re-executes all pending requests after refresh.
- Custom Validation Directives and Pipes: Custom directives for numeric-only input, phone formatting, and tax ID formatting.
