# Git Hooks

Este directorio contiene hooks de Git compartidos para el proyecto.

## Configuración

Después de clonar el repositorio, ejecuta:

```bash
git config core.hooksPath .githooks
```

Esto configura Git para usar los hooks de este directorio.

## Hooks disponibles

### pre-commit
Formatea automáticamente el código antes de cada commit:
- **Backend**: Spotless (Google Java Format)
- **Frontend**: Prettier

El código se formatea automáticamente y los cambios se agregan al commit.
