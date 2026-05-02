# Backend Development Skills (Java/Spring Boot)

This document outlines the best practices and standards for backend development in Guitapp.

## 1. Architecture & Design
- **Layered Architecture:** Maintain a clear separation between `Controller`, `Service`, `Repository`, and `Model` layers.
- **DTOs:** Use Data Transfer Objects (DTOs) for API requests and responses. Never expose Entities directly to the client.
- **Constructor Injection:** Prefer constructor-based dependency injection over field injection (`@Autowired`) for better testability and immutability.
- **Lombok:** Use Lombok to reduce boilerplate (e.g., `@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@Builder`), but be mindful of its impact on debugging.

## 2. Coding Standards
- **Java 21 Features:** Utilize modern Java features like Records for DTOs, Pattern Matching, and Sealed Classes where appropriate.
- **Spotless:** All code must adhere to the formatting rules defined in `code_style.xml`. Run `./gradlew spotlessApply` before committing.
- **Naming Conventions:** Use PascalCase for classes, camelCase for methods and variables, and UPPER_SNAKE_CASE for constants.
- **Validation:** Use `@Valid` and JSR-303 annotations (`@NotNull`, `@NotBlank`, etc.) in Controllers to validate incoming data.

## 3. REST API Design
- **Nouns over Verbs:** Use nouns for resource paths (e.g., `/users` instead of `/getUsers`).
- **HTTP Methods:** Use appropriate HTTP methods: `GET` for retrieval, `POST` for creation, `PUT`/`PATCH` for updates, and `DELETE` for removal.
- **Status Codes:** Return meaningful HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error).
- **Global Exception Handling:** Use `@ControllerAdvice` and `ResponseEntityExceptionHandler` to provide consistent error responses (refer to `GlobalExceptionHandler.java`).

## 4. Security
- **JWT:** Use JWT for stateless authentication. Ensure tokens are validated on every secured request.
- **Spring Security:** Configure security filters appropriately in `SecurityConfig.java`.
- **Sensitive Data:** Never log passwords or personal identifiable information (PII). Ensure sensitive data is encrypted or hashed.

## 5. Testing
- **JUnit 5 & Mockito:** Use JUnit 5 for unit and integration tests. Use Mockito to mock dependencies in unit tests.
- **Test Coverage:** Aim for high test coverage. Use JaCoCo to monitor coverage reports.
- **Integration Tests:** Use `@SpringBootTest` and H2 database for integration tests to verify the interaction between components.

## 6. Database
- **PostgreSQL:** Use PostgreSQL for production and staging environments.
- **Repositories:** Extend `JpaRepository` for standard CRUD operations. Use custom queries only when necessary.
- **Migrations:** (If added) Use Liquibase or Flyway for database schema versioning.
