# Implementation Plan: User Onboarding Flow

## 1. Objective
Implement an onboarding flow for new users that is triggered on their first login. The onboarding consists of two steps: setting a first name and optionally configuring budget target percentages. If the user does not complete the flow, it will be shown again on their next login.

## 2. Approach: Atomic Save
Data will be managed internally by the frontend across the two steps and sent to the backend in a single API call when the user completes the final step. This ensures that the onboarding state is atomic—either it is fully completed or not started.

## 3. Backend Changes

### 3.1. Update User Entity
Modify `org.fiuba.guitapp.model.User` to include:
- `firstName` (String)
- `onboardingCompleted` (Boolean, default: false)
- `targetFixedExpenses` (Integer)
- `targetVariableExpenses` (Integer)
- `targetSavings` (Integer)

### 3.2. DTOs
- Create `UserProfileResponse` to expose user data to the frontend.
- Create `OnboardingRequest` to receive `firstName`, `targetFixedExpenses`, and `targetVariableExpenses`.

### 3.3. UserController
Create a new controller `UserController` with the following endpoints:
- `GET /api/users/me`: Returns the authenticated user's `UserProfileResponse`.
- `PUT /api/users/me/onboarding`: Accepts `OnboardingRequest`, updates the user's fields, sets `onboardingCompleted = true`, and saves the user to the database.

## 4. Frontend Changes

### 4.1. Services
- Create `userService.ts` to handle API calls to `/api/users/me` and `/api/users/me/onboarding`.

### 4.2. Onboarding Screen
- Create `src/screens/OnboardingScreen.tsx` handling two steps using internal state (`currentStep`).
- **Step 1:** Welcome text and `firstName` input.
  - Validation: Mandatory, no spaces, no numbers (e.g., regex `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/`).
- **Step 2:** Budget Targets.
  - Inputs for "Gastos Fijos" and "Gastos Variables".
  - A disabled input for "Ahorro" auto-calculated as `100 - (Gastos Fijos + Gastos Variables)`.
  - Validation: Sum of the three must equal 100. None of the values can be 0.
- Submit the data via `userService.completeOnboarding()` on the final step and redirect to `/home`.

### 4.3. Routing Logic
- Update `src/screens/LoginScreen.tsx`: After successfully obtaining the JWT token, call `userService.getProfile()`.
- If `onboardingCompleted` is `true`, redirect to `/home`.
- If `onboardingCompleted` is `false` (or undefined), redirect to `/onboarding`.
- Create `app/onboarding.tsx` to mount `OnboardingScreen`.

## 5. Verification & Testing
- **Backend:** Write unit tests for `UserController` and `UserService` (if a service layer is added) to ensure validation and correct data persistence.
- **Frontend:** Write component tests for `OnboardingScreen` to verify step transitions and form validations (especially the auto-calculated savings and the 100% sum rule). Update `validation.test.ts` for the name validation logic.