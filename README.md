# GuitApp

Aplicación de gestión de gastos para el Trabajo Práctico de la facultad.

## Tecnologías

- **Frontend**: React Native con [Expo](https://expo.dev/) (TypeScript).
- **Backend**: Java 21 con Spring Boot 3, Gradle y JPA.
- **Base de Datos**: PostgreSQL.
- **Despliegue**: Render.

## Estructura del Proyecto

- `frontend/`: Aplicación móvil Expo.
- `backend/`: API REST construida con Spring Boot.

## Requisitos

- Node.js (v18+)
- Java 21
- Gradle
- Expo CLI

## Configuración Local

### Configuración Inicial
1. Configurar Git hooks (formatea código automáticamente antes de commits):
   ```bash
   git config core.hooksPath .githooks
   ```

### Backend
1. Ir a la carpeta `backend`.
2. Levantar la base de datos local: `make db-up`.
3. Compilar: `./gradlew clean build -x test`.
4. Ejecutar: `./gradlew bootRun`.

### Frontend
1. Ir a la carpeta `frontend`.
2. Instalar dependencias: `npm install`.
3. Iniciar Expo: `npx expo start`.
