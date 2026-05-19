# GuitApp

Aplicación de gestión de gastos para el Trabajo Práctico de la facultad.

## Tecnologías

- **Frontend**: React Native con [Expo](https://expo.dev/) SDK 54, React 19 (TypeScript).
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
3. Levantar redis: `make redis-up`.
4. Compilar: `./gradlew clean build -x test`.
5. Ejecutar: `./gradlew bootRun`.

### Frontend
1. Ir a la carpeta `frontend`.
2. Instalar dependencias: `npm install`.
3. Iniciar Expo: `npx expo start`.

### Builds (EAS)

Requiere cuenta en [expo.dev](https://expo.dev) y EAS CLI:

```bash
npm install -g eas-cli
eas login
eas init  # solo la primera vez, vincula el proyecto a tu cuenta
```

| Perfil | Comando | Para qué sirve |
|--------|---------|---------------|
| `development` | `eas build --profile development --platform android` | Reemplaza Expo Go, con splash e íconos propios |
| `preview` | `eas build --profile preview --platform android` | APK para testear sin Play Store |
| `production` | `eas build --profile production --platform android` | Build final (AAB) para publicar |

> **Nota:** En Expo Go el splash screen y los íconos no se ven como en la build final. Usar `preview` o `development` build para verlos correctamente.
