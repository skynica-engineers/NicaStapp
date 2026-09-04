# Proyecto NicaStapp

NicaStapp es una plataforma digital e integral orientada a la administración deportiva, diseñada para gestionar ligas, equipos y proveer a los atletas de una identidad digital única con estadísticas en tiempo real y verificables. 

## Arquitectura del Proyecto

El proyecto está estructurado como un **Monorepo** que divide claramente las responsabilidades en dos aplicaciones principales:

1. **Frontend (`frontend_nicastapp`)**: Aplicación móvil multiplataforma (iOS / Android / Web) desarrollada con **React Native** y **Expo**. Utiliza `expo-router` para la navegación basada en archivos y TypeScript para tipado estricto.
2. **Backend (`backend_nicastapp`)**: API RESTful construida con **Node.js** y **Express**. Escrita totalmente en TypeScript.
3. **Base de Datos**: PostgreSQL alojado en **Supabase**. *(Nota: Supabase se utiliza exclusivamente como motor de base de datos relacional PostgreSQL. No utilizamos sus servicios de Auth ni Storage, manteniendo la lógica de negocio 100% controlada en nuestro Backend).*
4. **ORM**: **Prisma ORM** para interactuar de forma segura y tipada con nuestra base de datos PostgreSQL.

## Seguridad y Autenticación
- **Frontend**: Protección de rutas centralizada mediante `AuthContext` e inyección automática de tokens JWT en cada petición API. Redirección automática al Login al expirar sesión.
- **Backend**: Middleware personalizado con `jsonwebtoken` para proteger rutas privadas y endpoints de mutación, asegurando que solo usuarios autenticados realicen acciones. Las contraseñas se aseguran mediante cifrado `bcryptjs`.

## Estructura de Carpetas

```text
Proyecto_NicaStapp/
├── frontend_nicastapp/       # App Móvil (Expo + React Native)
│   ├── src/app/              # Rutas y Pantallas (Expo Router)
│   ├── src/components/       # Componentes visuales reutilizables
│   ├── src/services/         # Clientes de API para hablar con el Backend
│   └── package.json
└── backend_nicastapp/        # API RESTful (Express)
    ├── prisma/               # Esquema de Prisma (schema.prisma) y Seeders
    ├── src/config/           # Configuración (Base de datos, CORS)
    ├── src/controllers/      # Lógica de Negocio
    ├── src/routes/           # Definición de Endpoints
    ├── src/index.ts          # Punto de entrada de la app
    └── package.json
```

## Requisitos Previos

Antes de correr el proyecto, asegúrate de tener instalados:
- [Node.js](https://nodejs.org/en/) (Versión 18 o superior recomendada).
- Una cuenta en Supabase con un proyecto activo para obtener la cadena de conexión de PostgreSQL.
- [Expo CLI](https://expo.dev/) (Opcional, pero recomendado).

## Instalación y Configuración

### 1. Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend_nicastapp
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `backend_nicastapp` y agrega tus variables de entorno para Prisma:
   ```env
   # PostgreSQL connection string provista por Supabase
   DATABASE_URL="postgres://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgres://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
   ```
4. Sincroniza la base de datos (crear tablas) usando Prisma:
   ```bash
   npx prisma db push
   ```
5. Si quieres llenar la base de datos con datos de prueba (Mock Data):
   ```bash
   npx tsx prisma/seed.ts
   ```

### 2. Frontend

1. En una nueva terminal, navega a la carpeta del frontend:
   ```bash
   cd frontend_nicastapp
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Si estás ejecutando tu app en un dispositivo físico, asegúrate de actualizar la IP base del backend en `frontend_nicastapp/src/services/api.ts` para que apunte a la IP de tu computadora (ej. `http://192.168.1.XX:3000`).

## Cómo Ejecutar (Entorno de Desarrollo)

Para levantar el ecosistema completo en desarrollo, necesitas abrir dos terminales.

**Terminal 1 (Backend):**
```bash
cd backend_nicastapp
npm run dev
```
El servidor backend iniciará (gracias a `nodemon` y `tsx`) en el puerto 3000.

**Terminal 2 (Frontend):**
```bash
cd frontend_nicastapp
npx expo start
```
Esto abrirá la consola de Expo. Puedes presionar `i` para abrir el emulador de iOS, `a` para Android, o escanear el código QR con la app de "Expo Go" en tu teléfono móvil.

## Tecnologías Principales Utilizadas

- **Frontend**: React Native, Expo, Expo Router, Axios, AsyncStorage, Vector Icons.
- **Backend**: Node.js, Express, TypeScript, bcrypt, jsonwebtoken, CORS.
- **Base de Datos / ORM**: PostgreSQL, Prisma.
- **Infraestructura**: Supabase (Únicamente DB Engine).

## Notas sobre Supabase

Hemos tomado la decisión arquitectónica de utilizar **Supabase** estrictamente como un proveedor de base de datos relacional robusto (Postgres). Toda la lógica de autenticación (JWT) y el manejo de archivos se ejecuta mediante código propio en el backend de Node.js. Esto permite una mayor flexibilidad, portabilidad y evita el acoplamiento a servicios específicos de la plataforma.
