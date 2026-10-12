# Merchant Portal - Workflow Manual & Operations Guide

This document provides an end-to-end operational guide and workflow specification for the Merchant Portal. It outlines the role-based onboarding lifecycle, state management architecture, underwriting decision governance, sensitive data controls, and user interface workflows.

---

## 1. System Architecture & Lifecycle Overview

The Merchant Portal orchestrates merchant onboarding across three distinct organizational roles: **Sales Representatives**, **Risk Underwriters**, and **Administrators**.


## 2. Role Permissions & Access Control Matrix

| Capability / Action | Sales Representative | Risk Underwriter | Administrator |
| :--- | :---: | :---: | :---: |
| Authenticate into Portal | Yes | Yes | Yes |
| View Application Scope | Own Created Applications Only | Assigned Applications Only | All Applications Globally |
| Create New Application | Yes | No | Yes |
| Auto-Save Application Draft | Yes | No | Yes |
| Submit Application | Yes | No | Yes |
| Assign Applications to Reviewers | No | No | Yes (with Notifications) |
| Reveal Masked Financial Data (PII/PCI) | Masked (Reveals Audited) | Masked (Reveals Audited) | Masked (Full Reveal & Audit) |
| Submit Initial Underwriting Decision | No | Yes (When Assigned) | Yes |
| Modify Underwriting Decision After Submission | No (Locked) | No (Locked) | Yes (Admin Override) |

---

## 3. Workflow Phase 1: Authentication & Sign-In

### 1.1 Secure Login Screen
- **Route**: `/login`
- **Interface**: Dedicated layout rendered outside the main navigation bar via router outlet isolation.
- **Security**: Strict credential validation returning role-scoped JWT tokens.

### Reference Capture
![Login Screen](docs/screenshots/01-login-screen.png)

### Credentials Reference
- **Sales Representative 1**: `sales` / `sales`
- **Risk Underwriter 1**: `reviewer` / `reviewer`
- **Administrator**: `admin` / `admin`

## 4. Workflow Phase 2: Dashboard & Pipeline Monitoring

### 2.1 Role-Filtered Pipeline Metrics
Upon login, users land on `/dashboard`. The status breakdown cards and application tables dynamically isolate data according to user permissions:
- **Sales**: Displays only applications created by that sales representative.
- **Reviewer**: Displays only applications assigned to that underwriter.
- **Admin**: Displays the complete global portfolio with assignment controls.

---

## 5. Workflow Phase 3: 4-Step Merchant Onboarding Wizard

### Step 1: Business Profile

### Step 2: Contact Information & Authorized Signatory

### Step 3: Settlement Bank Account (Protected Financial Data)

### Step 4: Processing Profile & Submission

---

## 6. Workflow Phase 4: Application Detail & Sensitive Data Controls

- **Route**: `/applications/:id`

### Sensitive Data Masking & Content Security Policy (CSP)

## 7. Workflow Phase 5: Underwriting Risk Decisions & Reviewer Locking

### 7.1 Reviewer Decision Submission
1. An assigned underwriter navigates to `/applications/:id`.
2. Underwriter inspects business credentials, financial accounts, and processing projections.
3. Underwriter clicks `Approve`, `Reject`, or `Request Changes`.
4. A modal opens requiring mandatory decision notes explaining the rationale.
5. Upon confirmation, the application status updates and the event is added to `riskHistory`.

### 7.2 Decision Locking Rules
- **Reviewer Restriction**: Locking applies strictly to finalized decisions (`APPROVED` or `REJECTED`). If changes are requested or an application remains under active review, the reviewer is not locked and can continue evaluations. Only once finalized as `APPROVED` or `REJECTED` is the decision permanently locked for reviewers:
  - UI displays a `Decision Locked (Admin Only)` indicator and disables reviewer submission buttons.
  - The backend API rejects reviewer submission attempts on approved/rejected applications with HTTP `403 Forbidden` (`"Reviewers cannot change a decision once approved or rejected. Only administrators can modify or override decisions."`).
- **Administrator Override**: Administrators retain unrestricted override capabilities, allowing them to reopen, re-evaluate, and update decisions at any stage.

---
