# Specification: Redesign Login Screen

## Overview
Redesign the existing Login screen in the frontend application to match the new visual mockup provided (`frontend/img.png`), utilizing the existing UI Kitten component library.

## Functional Requirements
- Update the layout and styling to include the new header, icon, input fields, and buttons as per the design.
- Implement inline validation error messages for both the email and password fields.
- Wire the "¿Olvidaste tu contraseña?" link to display a simple alert dialog for now.
- Ensure the existing login functionality (calling `authService.login`) remains fully functional and integrated with the new UI.
- The bottom text "¿No tienes cuenta? Únete a nosotros ✨" should navigate to the existing registration screen.

## Non-Functional Requirements
- Utilize `@ui-kitten/components` for the base elements (Input, Button, Text) and customize their styling to match the specific colors, borders, and rounded corners shown in the mockup.
- **Style Centralization:** All custom styles (React Native `StyleSheet` definitions) for this screen must be extracted into a dedicated separate file (e.g., `src/styles/loginStyles.ts`) to keep the component file clean and styles centralized.
- The layout should be responsive and look good across different mobile device screen sizes.

## Acceptance Criteria
- The visual appearance of the login screen matches the provided mockup closely.
- Submitting the form with empty or invalid data displays inline error messages below the corresponding fields.
- Tapping "¿Olvidaste tu contraseña?" shows an alert dialog.
- Valid credentials successfully authenticate the user and navigate to the home screen.
- Tapping "Únete a nosotros ✨" navigates to the registration screen.
- Styles are successfully extracted and imported from a centralized styling file.

## Out of Scope
- Implementing the actual backend logic or new screens for the "Forgot Password" flow.
- Modifying the underlying authentication service logic (`authService.ts`).