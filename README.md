# NicaStapp

Bienvenido al ecosistema deportivo de alto rendimiento. NicaStapp es una aplicación diseñada para facilitar la interacción y gestión en el ámbito deportivo en Nicaragua, permitiendo la administración de perfiles, equipos, inscripciones, torneos, estadísticas y más.

---

## 🏗 Arquitectura y Tecnologías Utilizadas

Este proyecto utiliza una arquitectura **Monorepo**, dividida en dos carpetas principales: el Frontend Móvil y el Backend API. Ambos ecosistemas están fuertemente tipados con **TypeScript**.

### Frontend (`frontend_nicastapp`)
Aplicación móvil híbrida desarrollada para iOS y Android.
- **Framework:** [React Native](https://reactnative.dev/) mediante [Expo](https://expo.dev/).
- **Enrutamiento:** [Expo Router](https://docs.expo.dev/router/introduction/) (Navegación basada en archivos de sistema, similar a Next.js).
- **Lenguaje:** TypeScript.
- **Componentes:** Hooks personalizados, Context API para estado global y componentes funcionales.
- **Almacenamiento Local:** AsyncStorage y SecureStore para tokens y sesión.

### Backend (`backend_nicastapp`)
API RESTful que provee todos los servicios de negocio a la aplicación.
- **Entorno de Ejecución:** [Node.js](https://nodejs.org/).
- **Framework:** [Express.js](https://expressjs.com/).
- **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/) (para interactuar y modelar la base de datos).
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) alojado en **[Supabase](https://supabase.com/)**.
  - ⚠️ *Nota Importante:* **Solo utilizamos Supabase como motor de base de datos PostgreSQL en la nube.** No se utilizan sus servicios de BaaS (Backend-as-a-Service) como Supabase Auth, Storage o sus auto-APIs. Toda la lógica, autenticación (JWT) y consultas las gestiona nuestro propio backend con Prisma.
- **Lenguaje:** TypeScript.

---

## 🚀 Cómo Ejecutar el Proyecto

Para levantar el ecosistema completo en tu entorno local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/skynica-engineers/NicaStapp.git
cd NicaStapp
```

### 2. Configurar Variables de Entorno (.env)
Asegúrate de NO subir nunca el archivo `.env` al repositorio (ya está en el `.gitignore`).

#### Para el Backend:
Navega a la carpeta del backend y crea un archivo `.env` basado en el de ejemplo:
```bash
cd backend_nicastapp
# Crea el archivo .env con el siguiente contenido:
DATABASE_URL="postgresql://usuario:password@dominio.supabase.co:5432/postgres"
PORT=3000
JWT_SECRET="tu_secreto_seguro_para_tokens"
```
*(Solicita a un administrador las credenciales exactas de Supabase).*

### 3. Levantar el Backend (Node/Express)
Desde la terminal, dentro de la carpeta `backend_nicastapp`:
```bash
# 1. Instalar dependencias
npm install

# 2. Sincronizar Prisma con la base de datos de Supabase
npx prisma generate
npx prisma db pull # Solo si necesitas actualizar tu esquema local con la nube

# 3. Levantar el servidor en modo desarrollo
npm run dev
```
El servidor debería estar corriendo en `http://localhost:3000`.

### 4. Levantar el Frontend (React Native/Expo)
Abre **otra ventana de terminal** y dirígete a la carpeta del frontend:
```bash
cd frontend_nicastapp

# 1. Instalar dependencias
npm install

# 2. Levantar la aplicación con Expo
npx expo start -c
```
Esto abrirá Metro Bundler en tu navegador o consola. Puedes escanear el código QR con tu celular usando la app de **Expo Go** (Android/iOS) o presionar `a` para emular en Android Studio o `i` para el simulador de iOS.

> **¡Ojo!**: Asegúrate de que la IP local configurada en `frontend_nicastapp/src/services/api.ts` apunte a la IP de red local de tu computadora para que tu celular pueda acceder a tu servidor Node local.

---

## 🌿 Flujo de Trabajo y Ramas (Git Flow)

Seguimos una estrategia de ramas estructurada:
- `main`: Código estable de producción.
- `develop`: Rama principal de integración y desarrollo. Aquí hacemos nuestros *Pull Requests* o *Commits*.
- `feature/*`: Ramas temporales para nuevas funcionalidades (Ej: `feature/inscripciones-torneo`).

## 🛡 Licencia
NicaStapp © 2026. Todos los derechos reservados.
