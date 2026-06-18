<h1>
  GuitApp
  <img src="./frontend/assets/splash-icon-down5.svg" width="38" />
</h1>

<p>

Aplicación de gestión de gastos desarrollada como trabajo práctico de la materia <b>Gestión del Desarrollo de Sistemas Informáticos</b>.

</p>

---

## Tabla de Contenido

* [Introducción](#introducción)
* [Tecnologías](#tecnologías)
* [Estructura del Proyecto](#estructura-del-proyecto)
* [Pre-requisitos](#pre-requisitos)
* [Configuración Local](#configuración-local)

  * [Configuración Inicial](#configuración-inicial)
  * [Backend](#backend)
  * [Frontend](#frontend)
* [Builds Mobile (EAS)](#builds-mobile-eas)
* [Migraciones de Base de Datos](#migraciones-de-base-de-datos)

  * [Llenar título a partir de la descripción](#llenar-título-a-partir-de-la-descripción)

---

## Introducción

GuitApp es una aplicación orientada al seguimiento de finanzas personales que busca reducir el esfuerzo manual de registrar movimientos y brindar mayor visibilidad sobre los hábitos de consumo.

La plataforma permite registrar ingresos y gastos, configurar movimientos recurrentes, organizar gastos por categorías y visualizar información mediante gráficos e informes periódicos.

Además, incorpora funcionalidades de análisis y acompañamiento financiero como detección de patrones de consumo, alertas sobre desvíos respecto de objetivos definidos por el usuario, proyección de saldo y notificaciones configurables.

---

## Tecnologías

- **Frontend**: React Native con [Expo](https://expo.dev/) SDK 54, React 19 (TypeScript).
- **Backend**: Java 21 con Spring Boot 3, Gradle y JPA.
- **Base de Datos**: PostgreSQL.
- **Despliegue**: Render.

---

## Estructura del Proyecto

- `frontend/`: Aplicación móvil Expo.
- `backend/`: API REST construida con Spring Boot.

---

## Pre-requisitos

Para ejecutar el proyecto es necesario contar con las siguientes herramientas instaladas:

- Node.js (v18+)
- Java 21
- Gradle
- Expo CLI

---

## Configuración Local

### Configuración Inicial

1. Configurar Git hooks (formatea código automáticamente antes de commits):
   ```bash
   git config core.hooksPath .githooks
   ```

---

### Backend

1. Ir a la carpeta `backend`.
2. Levantar la base de datos local: `make db-up`.
3. Levantar redis: `make redis-up`.
4. Compilar: `./gradlew clean build -x test`.
5. Ejecutar: `./gradlew bootRun`.

---

### Frontend

1. Ir a la carpeta `frontend`.
2. Instalar dependencias: `npm install`.
3. Iniciar Expo: `npx expo start`.

---

## Builds Mobile (EAS)

La generación de builds móviles requiere contar con una cuenta en [expo.dev](https://expo.dev) y tener instalada la herramienta EAS CLI.

### Instalación y configuración

```bash
npm install -g eas-cli
eas login
eas init  # solo la primera vez, vincula el proyecto a tu cuenta
```

### Perfiles disponibles

| Perfil | Comando | Para qué sirve |
|--------|---------|---------------|
| `development` | `eas build --profile development --platform android` | Reemplaza Expo Go, con splash e íconos propios |
| `preview` | `eas build --profile preview --platform android` | APK para testear sin Play Store |
| `production` | `eas build --profile production --platform android` | Build final (AAB) para publicar |

> **Nota:** En Expo Go el splash screen y los íconos no se ven como en la build final. Usar `preview` o `development` build para verlos correctamente.

---

## Migraciones de Base de Datos

Las migraciones se corren manualmente contra la base de datos. Los scripts están en `backend/src/main/resources/migrations/`.

### Llenar título a partir de la descripción

Copia el valor existente del campo `description` al nuevo campo `title` (truncado a 20 caracteres) para movimientos creados antes de la separación de ambos campos.

Si tenés `psql` instalado:
```bash
psql -d guitapp -f backend/src/main/resources/migrations/V1__backfill_title_from_description.sql
```

Si usás el contenedor Docker local (`make db-up`):
```bash
docker exec -i guitapp-db psql -U postgres -d guitapp -f - < backend/src/main/resources/migrations/V1__backfill_title_from_description.sql
```

> El nombre de la base por defecto es `guitapp`. Si usás la variable de entorno `DB_NAME`, reemplazalo.
