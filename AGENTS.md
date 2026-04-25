# Agents Guidance

Este archivo contiene las directrices para los agentes de IA que trabajen en este repositorio.

## Arquitectura

- **Backend**: Sigue una arquitectura de capas estándar (Controller, Service, Repository, Entity).
- **Frontend**: Uso de componentes funcionales y hooks de React. Preferencia por limpieza y tipado fuerte con TypeScript.

## Convenciones de Código

- Idioma: El código (nombres de variables, clases, métodos) debe estar en **inglés**.
- Documentación/Comentarios: Pueden estar en español o inglés según se prefiera, pero el código es estrictamente en inglés.
- Backend: Paquete base `org.fiuba.guitapp`.
- Frontend: Estilos integrados o CSS-in-JS.

## Base de Datos

- Se utiliza PostgreSQL.
- Las migraciones (si se agregan en el futuro) se manejarán preferentemente con Flyway o Liquibase. Por ahora, se utiliza la generación automática de JPA para prototipado rápido.
