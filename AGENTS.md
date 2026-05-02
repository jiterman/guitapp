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
- **Lombok Usage (Backend):**
  - **Entities/Models with fields:** Use `@Getter` and `@Setter` annotations instead of manual getter/setter methods
  - **Classes with dependency injection:** Use `@RequiredArgsConstructor` for constructor injection of `final` fields
  - **DTOs:** Prefer Java Records over classes with Lombok annotations
  - **Utility classes:** Do not use Lombok if the class has no injected dependencies or mutable fields
  - **Exception:** Only write manual getters/setters when implementing interfaces that require them (e.g., `UserDetails`)
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
6. **Pre-Commit Verification:** Before creating any commit, ALWAYS verify:
   - ✅ All backend tests pass: `cd backend && ./gradlew test`
   - ✅ All frontend tests pass: `cd frontend && npm test -- --watchAll=false`
   - ✅ Backend coverage meets requirements: 
     - Overall project coverage: **≥80%**
     - New/modified code (patch): **≥90%** (minimum 85% with threshold)
     - Check Jacoco report at `backend/build/reports/jacoco/test/html/index.html`
   - ✅ Lint passes for both backend and frontend
   - ❌ NEVER commit without running these checks first

## Pre-Commit Checklist

Before running `git commit`, ensure:

```bash
# Backend checks
cd backend
./gradlew clean test jacocoTestReport
./gradlew spotlessApply

# Frontend checks  
cd ../frontend
npm test -- --watchAll=false
npm run lint

# Verify coverage reports
# Backend: open backend/build/reports/jacoco/test/html/index.html
# Review that your changes have adequate test coverage
```

If any of these steps fail, DO NOT commit. Fix the issues first.

## Test Coverage Requirements

Based on `codecov.yml` configuration:

- **Project Coverage:** Minimum **80%** overall coverage (no threshold)
- **Patch Coverage (New/Modified Code):** Minimum **90%** coverage (with 5% threshold = 85% minimum)
- **Backend:** Tests are run with Jacoco coverage reporting enabled
- **Codecov:** All PRs will be checked by Codecov bot - PRs failing these requirements will not be merged

### Ignored Files (No coverage required):
- `**/GuitappApplication.java`
- `**/*Application.java`
