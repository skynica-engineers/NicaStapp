# NicaStapp

Bienvenido al ecosistema deportivo de alto rendimiento. NicaStapp es una aplicación diseñada para facilitar la interacción y gestión en el ámbito deportivo.

## Estructura del Proyecto

El repositorio está dividido en dos partes principales:
- `frontend_nicastapp/`: Aplicación móvil desarrollada con React Native Expo.
- `backend_nicastapp/`: API y servicios backend.

## Flujo de Trabajo y Ramas (Git Flow)

Seguimos una estrategia de ramas estructurada:
- `main`: Código estable de producción.
- `develop`: Rama principal de integración y desarrollo.
- `feature/*`: Ramas para nuevas funcionalidades.
- `fix/*`: Ramas para solución de errores.

**Conventional Commits**:
Se recomienda utilizar los estándares de [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nueva funcionalidad.
- `fix:` Solución a un bug.
- `docs:` Cambios en documentación.
- `style:` Formato, falta de puntos y comas, etc.
- `refactor:` Refactorización de código.

## Buenas Prácticas y Seguridad

- **Validación de Entradas:** Todas las entradas del usuario son validadas tanto en frontend como en backend.
- **Autenticación 2FA:** Soporte para verificación de dos pasos.
- **Manejo de Sesión:** Manejo de ciclo de vida seguro y expiración de estado utilizando `SecureStore`.
- **Rutas Protegidas:** Acceso restringido mediante roles y validación de tokens JWT.

## Configuración Inicial

1. Clona el repositorio:
   ```bash
   git clone https://github.com/skynica-engineers/NicaStapp.git
   ```
2. Crea el archivo de variables de entorno `.env` en la raíz (basado en `.env.example`).
3. Para iniciar el frontend:
   ```bash
   cd frontend_nicastapp
   npm install
   npx expo start
   ```

## Licencia
NicaStapp Todos los derechos reservados.
