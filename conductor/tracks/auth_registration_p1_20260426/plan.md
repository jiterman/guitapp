# Implementation Plan: Phase 1 - Registration Flow

## Phase 1: Foundation & UI Guidelines [checkpoint: 025472a]
- [x] Task: Establish UI Guidelines and Theme
    - [x] Create `conductor/ui-guidelines.md` documenting the Monefy-inspired Light Blue theme.
    - [x] Define button styles, input decorations, and typography in the guidelines.
- [x] Task: Project Dependency Setup
    - [x] Backend: Add `spring-boot-starter-security`, `spring-boot-starter-mail`, and `jakarta.validation` to `build.gradle`.
    - [x] Frontend: Install `@ui-kitten/components`, `@eva-design/eva`, and `react-native-svg`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md) (025472a)

## Phase 2: Backend Persistence & Security Infrastructure [checkpoint: 148a229]
- [x] Task: Implement User Persistence Layer
    - [x] Write failing tests for `User` entity and `UserRepository` (Red).
    - [x] Implement `User` entity with `id`, `email` (unique), `password`, and `status` (Green).
    - [x] Verify persistence and email uniqueness constraint.
- [x] Task: Configure Base Spring Security
    - [x] Write failing tests for security configuration (Red).
    - [x] Implement `SecurityConfig` to permit access to auth endpoints and set up BCrypt (Green).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Persistence & Security' (Protocol in workflow.md) (148a229)

## Phase 3: OTP and Email Services [checkpoint: fcccbb2]
- [x] Task: Implement OTP Generation Logic
    - [x] Write failing tests for `OtpService` (generation and 10min expiry) (Red).
    - [x] Implement `OtpService` using a 6-digit numeric generator (Green).
- [x] Task: Implement Email Delivery Service
    - [x] Write failing tests for `EmailService` (Red).
    - [x] Implement `EmailService` using `JavaMailSender` and Gmail SMTP configuration (Green).
- [x] Task: Conductor - User Manual Verification 'Phase 3: OTP & Email' (Protocol in workflow.md) (fcccbb2)

## Phase 4: Registration API Endpoints
- [x] Task: Implement Registration Logic
    - [x] Write failing tests for `AuthService.register` (Red).
    - [x] Implement `AuthService.register`: create user, hash password, generate/save OTP, send email (Green).
- [x] Task: Implement Verification Logic
    - [x] Write failing tests for `AuthService.verifyRegistration` (Red).
    - [x] Implement verification logic to activate user status upon valid OTP (Green).
- [x] Task: Expose Authentication Controller (6de3795)
    - [x] Write failing integration tests for `/register` and `/verify-registration` (Red).
    - [x] Implement `AuthController` to handle requests and return standardized responses (Green).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Registration API' (Protocol in workflow.md)

## Phase 5: Frontend Registration UI
- [ ] Task: Implement Registration Screen
    - [ ] Write failing tests for `RegistrationScreen` component and validation logic (Red).
    - [ ] Implement `RegistrationScreen` using UI Kitten with Light Blue theme (Green).
- [ ] Task: Implement OTP Verification Screen
    - [ ] Write failing tests for `OtpVerificationScreen` (Red).
    - [ ] Implement `OtpVerificationScreen` with numeric input and success feedback (Green).
- [ ] Task: Set up Navigation & Integration
    - [ ] Configure Expo Router for Registration -> OTP flow.
    - [ ] Integrate frontend screens with backend API endpoints.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Frontend UI' (Protocol in workflow.md)

## Phase 6: Final Integration & Coverage
- [ ] Task: End-to-End Testing
    - [ ] Perform a full manual registration and verification flow.
    - [ ] Verify user status in the database after successful OTP entry.
- [ ] Task: Quality Gate & Coverage Check
    - [ ] Ensure unit test coverage is >80% for all new modules.
    - [ ] Run linters and fix any style violations in Java and TypeScript.
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Final Integration' (Protocol in workflow.md)
