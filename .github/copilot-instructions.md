# 📎 Copilot Instructions for This Project

Welcome to the project! This document guides GitHub Copilot Chat (Agent Mode) and contributors on how to generate code and complete tasks in line with our architecture, best practices, and engineering standards.

---

## 🧠 Project Overview

This is a full-stack application featuring both **mobile and web frontends** backed by a **Node.js serverless architecture** on AWS. The goal is to maintain **clean, scalable code**, enforce **best practices**, and ensure **cross-platform consistency**.

Refer to `ApplicationArchitecture.txt` for full tech stack & design context.

---

## ✅ Coding Goals

* Follow **TypeScript-first development** across all layers.
* Write **modular, composable code** with **strong typing** and **DRY principles**.
* Enforce **code style via linters, formatters, and GitHub Actions**.
* All features must:

  * Align with `ApplicationArchitecture.txt`.
  * Be testable and tested (unit, integration, and optionally E2E).
  * Follow our folder & domain structure conventions.

---

## 🧱 Project Structure Guidelines

### 📱 Mobile App

* **Framework:** Expo + React Native (TypeScript)
* Keep platform-specific code to a minimum.
* Use reusable components from the shared `ui/` package.
* Organize code by **features/domains**: `features/`, `components/`, `screens/`.

### 🌐 Web App

* **Framework:** React (TypeScript)
* Share design system and logic with mobile where possible.
* Organize with a similar structure to mobile: `pages/`, `components/`, `hooks/`.

### 🖥️ Backend (API)

* **Node.js + TypeScript** in serverless format (AWS Lambda via CDK or Amplify).
* Structure as clean, composable services:

  * `handlers/`, `services/`, `models/`, `validators/`
* Implement proper input validation (e.g., Zod, Joi).
* Use async/await, avoid callback nesting.
* Respect separation of concerns (no business logic in Lambda handlers).

### 📡 Database

* PostgreSQL for relational data: follow strict schema migration rules.
* DynamoDB for real-time data (e.g. chat): enforce access patterns and TTLs.
* Use data access abstraction layers where needed (`repositories/`, etc).

---

## 📁 File & Folder Conventions

* Use `kebab-case` for folders, `camelCase` or `PascalCase` for files.
* Use `index.ts` to re-export module internals cleanly.
* Every module should contain a `README.md` if it’s complex or reusable.

---

## 🧪 Testing Strategy

* All code must include tests or test stubs:

  * **Jest** for unit/integration tests (both frontend & backend)
  * **React Testing Library** for UI components
  * Consider **Playwright or Detox** for E2E (mobile/web)
* Place tests near source files: `*.test.ts(x)?`

---

## 🚀 CI/CD Expectations

* All commits should pass:

  * TypeScript compilation
  * Lint checks (ESLint + Prettier)
  * Tests (CI runs via GitHub Actions)
* Deployments use Amplify CLI/CDK. Agent should generate/update deployment artifacts.

---

## 🔐 Auth & Security

* Use **AWS Cognito** for auth flows.
* Sensitive logic must be securely managed via **IAM policies** or **Lambda environment variables**.
* All API access must verify authentication state unless explicitly public.

---

## 📦 Libraries & Tools

* **pnpm** for mono-repo workspace
* **Zod** for data validation
* **Axios** or **Fetch API** for network requests
* **Stripe SDK** (web/mobile) for payments
* **Mapbox/Google Maps** SDK for geolocation
* **Stream Chat or Firebase SDK** for messaging
* **S3 SDK** for image uploads

---

## 🤖 Copilot Agent Instructions

### When Responding to Prompts:

* **Always** align output with our architecture in `../ApplicationArchitecture.txt`.
* **Always** be mindful that the mobile application and folders within `../mobile/` is an EXPO project.
* **Always** be sure to use components and packages that are compatible with EXPO when developing within the mobile folder or mobile application.
* Use idiomatic **TypeScript** across stack.
* Follow feature-first structure (i.e., generate features/modules, not flat files).
* For new endpoints or features:

  * Scaffold with handlers, services, types, and validators.
  * Include proper tests and documentation.
* For UI:

  * Use atomic or feature-based component structure.
  * Mobile code must use React Native idioms; web must use responsive design.
  * Avoid third-party packages unless justified.

### When Creating PRs:

* Link the PR to the corresponding issue.
* Include meaningful commit messages.
* Auto-assign reviewers based on `CODEOWNERS`.
* Use feature branches: `feature/<scope>` or `fix/<bug>`.

---

## 📚 References

* 📄 [`ApplicationArchitecture.txt`](./ApplicationArchitecture.txt)
* 📦 \[`package.json`] – for script references
* ⚙️ GitHub Actions CI – defined in `.github/workflows/`
* 🔐 AWS config – managed via Amplify/CDK
