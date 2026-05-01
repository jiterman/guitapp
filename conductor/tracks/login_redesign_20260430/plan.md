# Implementation Plan: Redesign Login Screen

## Phase 1: Validation Utilities
- [x] Task: Create test file `frontend/__tests__/validation.test.ts` for email and password validation rules (Red Phase). [c545d02]
- [x] Task: Implement `frontend/src/utils/validation.ts` to make tests pass (Green Phase). [5281b1a]
- [~] Task: Conductor - User Manual Verification 'Validation Utilities' (Protocol in workflow.md)

## Phase 2: UI Implementation and Styling
- [ ] Task: Create `frontend/src/styles/loginStyles.ts` to centralize all styles for the login screen.
- [ ] Task: Refactor `frontend/src/screens/LoginScreen.tsx`:
    - [ ] Import and apply styles from `loginStyles.ts`.
    - [ ] Update UI components (header, icon, inputs, buttons) to match the mockup.
    - [ ] Integrate the new validation utility for inline errors instead of Alerts.
    - [ ] Add the "¿Olvidaste tu contraseña?" link with an Alert dialog.
    - [ ] Update the registration link text to "¿No tienes cuenta? Únete a nosotros ✨".
- [ ] Task: Conductor - User Manual Verification 'UI Implementation and Styling' (Protocol in workflow.md)