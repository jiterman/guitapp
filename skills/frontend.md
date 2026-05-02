# Frontend Development Skills (React Native/TypeScript)

This document outlines the best practices and standards for frontend development in Guitapp.

## Stack Versions
- **React 19** (not 18 — do not downgrade or use React 18 APIs that were changed in 19)
- **Expo SDK 54**
- **React Native 0.81.5**
- **expo-router 6**

## 1. Component Architecture
- **Functional Components:** Use functional components with Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Custom Hooks:** Extract complex logic into custom hooks to keep components focused on rendering.
- **UI Kitten:** Use `@ui-kitten/components` for UI elements to maintain a consistent look and feel.
- **Atomic Design:** (Optional) Organize components by their complexity (atoms, molecules, organisms).

## 2. TypeScript & Type Safety
- **Strict Typing:** Avoid `any`. Define interfaces and types for all props, state, and API responses.
- **Enums:** Use `enums` or literal types for constants like status codes or UI themes.
- **Type Guards:** Use type guards to handle conditional rendering and data processing safely.

## 3. Styling & Layout
- **StyleSheet:** Use `StyleSheet.create` for performance and organization.
- **Flexbox:** Leverage Flexbox for responsive layouts. Avoid hardcoded dimensions.
- **Themes:** Use UI Kitten's theming system to manage colors and typography consistently.

## 4. State Management & Data Fetching
- **Hooks:** Use local state (`useState`) for component-specific state.
- **Context API:** Use React Context for global state (e.g., Auth state, User profile).
- **Services:** Centralize API calls in the `src/services/` directory (e.g., `authService.ts`).

## 5. Navigation
- **Expo Router:** Use file-based routing provided by `expo-router`. Follow the directory structure in the `app/` folder.
- **Deep Linking:** Ensure routes are compatible with deep linking requirements.

## 6. Security
- **SecureStore:** Use `expo-secure-store` for sensitive data like JWT tokens or user credentials.
- **Validation:** Use utility functions (e.g., `src/utils/validation.ts`) for client-side form validation.

## 7. Testing
- **Jest:** Use Jest for unit testing logic and utility functions.
- **React Native Testing Library:** Use RNTL for component testing to ensure they render and behave as expected.
- **Mocks:** Mock external dependencies and API calls in tests.

## 8. Workflow
- **Linting & Formatting:** Adhere to ESLint and Prettier rules. Run `npm run lint` and `npm run format` before committing.
- **Expo CLI:** Use Expo CLI for development and debugging.
