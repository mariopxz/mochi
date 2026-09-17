# Mochi

> Tu espacio en internet, reunido en un perfil fácil de compartir.

Mochi es una aplicación full-stack para crear una página de perfil personal con una URL pública, enlaces editables y una pequeña capa de gestión para cada usuario. El proyecto combina una interfaz React responsive con una API REST en Express y persistencia en MySQL.

## Índice

- [Qué incluye](#qué-incluye)
- [Stack](#stack)
- [Estructura](#estructura)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Rutas principales](#rutas-principales)
- [API](#api)
- [Scripts](#scripts)
- [Estado del proyecto](#estado-del-proyecto)
- [Contribuir](#contribuir)

## Qué incluye

- Registro e inicio de sesión con JWT.
- Rutas públicas y protegidas según el estado de autenticación.
- Perfil público accesible mediante `/u/:username`.
- Edición del nombre, nombre de usuario, biografía y avatar.
- Subida de avatares a Cloudinary.
- Creación, edición, borrado y reordenación de enlaces.
- Registro de clics en enlaces públicos.
- Página de cuenta para actualizar datos y contraseña.
- Página de ayuda y flujo visual para iniciar la recuperación de contraseña.
- Diseño responsive con Tailwind CSS.

## Stack

### Cliente

- React 19
- Vite
- React Router
- Tailwind CSS 4
- Axios
- `@dnd-kit` para ordenar enlaces
- Lucide React para iconos

### Servidor

- Node.js
- Express 5
- MySQL mediante `mysql2`
- JWT para sesiones
- `bcrypt` para contraseñas
- CORS

## Estructura

```text
mochi/
├── client/                 # Aplicación React + Vite
│   ├── public/
│   └── src/
│       ├── components/     # Componentes reutilizables
│       ├── constants/      # Datos de ejemplo
│       ├── context/        # Estado de autenticación
│       ├── pages/          # Vistas y rutas de la aplicación
│       └── services/       # Cliente HTTP y llamadas a la API
├── server/                 # API REST con Express
│   ├── db/                 # Conexión a MySQL
│   ├── middleware/         # Autenticación y middleware común
│   ├── routes/             # Rutas de auth, enlaces y perfiles
│   └── utils/              # Sanitización de entradas
└── README.md
```

## Requisitos

- Node.js 18 o superior.
- pnpm 9 o superior.
- MySQL 8 o compatible.
- Una cuenta de Cloudinary si se quiere activar la subida de avatares.

Puedes comprobar las versiones instaladas con:

```bash
node --version
pnpm --version
```

## Puesta en marcha

### 1. Instalar dependencias

Desde la raíz del proyecto:

```bash
cd server
pnpm install

cd ../client
pnpm install
```

### 2. Configurar el servidor

Crea `server/.env` a partir de las variables descritas en [Variables de entorno](#variables-de-entorno).

Asegúrate de que MySQL esté disponible y que la base de datos configurada contenga las tablas que utiliza la API. El repositorio no incluye actualmente un script de migraciones o un archivo SQL de inicialización.

### 3. Configurar el cliente

Crea `client/.env` con la URL de la API y las credenciales públicas de subida de Cloudinary.

### 4. Arrancar la aplicación

Necesitarás dos terminales:

```bash
# Terminal 1
cd server
pnpm dev
```

```bash
# Terminal 2
cd client
pnpm dev
```

Por defecto:

- Cliente: http://localhost:5173
- API: http://localhost:3000
- Health check: http://localhost:3000/health

Para probar la conexión con MySQL, abre `/health`. Una respuesta correcta tiene esta forma:

```json
{
  "status": "ok",
  "message": "Servidor y DB funcionando"
}
```

## Variables de entorno

### `server/.env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=mochi
JWT_SECRET=una_clave_larga_y_privada
```

`JWT_SECRET` debe ser una cadena larga, aleatoria y diferente en cada entorno. No la subas al repositorio.

### `client/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

Las variables `VITE_*` se incluyen en el bundle del navegador. No pongas secretos privados en ellas. El upload preset de Cloudinary debe estar configurado para permitir la subida desde el cliente.

## Rutas principales

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Público | Página de inicio |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuario |
| `/forgot-password` | Público | Formulario visual de recuperación |
| `/u/:username` | Público | Perfil compartible de un usuario |
| `/dashboard` | Protegido | Gestión de enlaces |
| `/account` | Protegido | Datos personales, avatar y contraseña |
| `/help` | Público | Ayuda |

## API

La API se monta directamente sobre `http://localhost:3000`.

### Autenticación y cuenta

| Método | Endpoint | Acceso | Uso |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Crear una cuenta |
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `GET` | `/auth/me` | JWT | Obtener el perfil autenticado |
| `PUT` | `/auth/profile` | JWT | Actualizar el perfil |
| `PUT` | `/auth/password` | JWT | Cambiar la contraseña actual |
| `PUT` | `/auth/email` | JWT | Cambiar el correo |

### Enlaces y perfiles

| Método | Endpoint | Acceso | Uso |
| --- | --- | --- | --- |
| `GET` | `/links` | JWT | Obtener los enlaces propios |
| `POST` | `/links` | JWT | Crear un enlace |
| `PUT` | `/links/:id` | JWT | Editar un enlace |
| `DELETE` | `/links/:id` | JWT | Borrar un enlace |
| `PUT` | `/links/reorder` | JWT | Guardar el orden de los enlaces |
| `POST` | `/links/:id/click` | Público | Registrar un clic |
| `GET` | `/u/:username` | Público | Obtener un perfil público |
| `GET` | `/health` | Público | Comprobar API y base de datos |

Las rutas protegidas esperan un token JWT en la cabecera:

```http
Authorization: Bearer <token>
```

## Scripts

### Cliente

Ejecuta los comandos desde `client/`:

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Arranca Vite en modo desarrollo |
| `pnpm build` | Genera la build de producción |
| `pnpm preview` | Sirve localmente la build generada |
| `pnpm lint` | Ejecuta ESLint |

### Servidor

Ejecuta los comandos desde `server/`:

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Arranca Express con Nodemon |
| `pnpm start` | Arranca Express en modo normal |
| `pnpm test` | Pendiente de implementar |

## Estado del proyecto

Mochi está en desarrollo activo. La autenticación, los perfiles, la gestión de enlaces y la subida de avatares están implementados.

La ruta `/forgot-password` ya está integrada en el cliente como flujo visual, pero todavía necesita un endpoint en el servidor y un proveedor de correo para enviar enlaces reales de recuperación.

También quedan como siguientes mejoras naturales:

- Añadir migraciones o un esquema SQL versionado.
- Implementar recuperación de contraseña con token de un solo uso y caducidad.
- Incorporar tests unitarios y de integración.
- Añadir validación de esquemas en las entradas de la API.
- Configurar una estrategia de despliegue y variables por entorno.

## Contribuir

1. Crea una rama descriptiva desde `dev`.
2. Instala las dependencias de `client` y `server` con pnpm.
3. Configura los archivos `.env` localmente.
4. Mantén los cambios centrados en una funcionalidad.
5. Ejecuta `pnpm lint` y `pnpm build` en `client` antes de abrir una propuesta.
6. Describe en el cambio qué problema resuelve y cómo probarlo.

## Licencia

El proyecto todavía no define una licencia pública. Consulta con el propietario antes de reutilizarlo fuera de este repositorio.
