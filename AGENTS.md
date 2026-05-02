# Agent Guidelines

This file contains the guidelines and best practices for AI agents working on this repository.

## Project Structure & Best Practices

To ensure consistency and quality across the codebase, specialized skill files have been created. Agents MUST refer to these documents before implementing new features or refactoring existing code:

- **Backend Development:** Refer to `skills/backend.md` for Java, Spring Boot, and REST API standards.
- **Frontend Development:** Refer to `skills/frontend.md` for React Native, TypeScript, and UI Kitten standards.

## Core Principles

- **Language:** All code (variable names, classes, methods, documentation, and commits) must be in **English**.
- **Architecture:** 
  - **Backend:** Follow a standard layered architecture (Controller, Service, Repository, Entity/Model).
  - **Frontend:** Use functional components, React Hooks, and maintain strong typing with TypeScript.
- **Verification:** Always run the project's build and linting tools before considering a task complete.
  - Backend: `./gradlew build` and `./gradlew spotlessApply`.
  - Frontend: `npm run lint` and `npm run format`.

## Database

- **Engine:** PostgreSQL.
- **Schema Management:** JPA automatic generation is currently used for rapid prototyping. For production-ready changes, schema migrations should be discussed.

## Workflow for Agents

1. **Research:** Systematically map the relevant parts of the codebase.
2. **Consult Skills:** Read the relevant skill file in the `skills/` directory (`backend.md` or `frontend.md`) based on the task.
3. **Implement:** Follow the patterns, naming conventions, and architectural standards described in the skill files.
4. **Test:** Add unit and integration tests to verify your changes, as mandated by the guidelines.
5. **Lint & Format:** Ensure all code passes formatting and linting checks (Spotless for backend, ESLint/Prettier for frontend).
