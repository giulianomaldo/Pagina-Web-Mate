# 🧉 Encontrarte Infusiones - API Backend

Backend desarrollado en **Node.js, Express y MySQL (Sequelize)** para la tienda online "Encontrarte Infusiones". Incluye un panel administrativo protegido y endpoints públicos para el frontend.

---

## 🛠️ Requisitos previos

- **Node.js** (v18 o superior recomendado)
- **MySQL** (v8 o superior)
- Cuenta en **Cloudinary** (para el almacenamiento de imágenes)

---

## ⚙️ Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz de la carpeta `backend` con las siguientes variables requeridas:

```env
# Servidor
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173 # URL de tu frontend React para configurar CORS

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=encontrarte_db

# JWT (Autenticación)
# Genera strings aleatorios largos (mínimo 32 caracteres)
JWT_SECRET=tu_secreto_super_seguro_access
JWT_REFRESH_SECRET=tu_secreto_super_seguro_refresh

# Cloudinary (Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 🚀 Cómo iniciar el proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Crear la base de datos MySQL:**
   ```sql
   CREATE DATABASE encontrarte_db;
   ```

3. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
   *Nota: Sequelize sincronizará los modelos automáticamente con la base de datos (alter: true).*

---

## 🔗 Cómo conectarlo con React

1. En tu frontend (Vite/React), crea un archivo `.env` o configura tu cliente HTTP (Axios/Fetch) con la URL base del backend:
   ```javascript
   // Ejemplo con Axios
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:3000/api',
     withCredentials: true // IMPORTANTE para enviar y recibir la cookie del refresh token
   });
   ```

2. Asegúrate de que `CLIENT_URL` en el `.env` del backend coincida exactamente con la URL donde corre tu frontend (ej. `http://localhost:5173`) para que **CORS** no bloquee las peticiones.

---

## 📂 Estructura del Proyecto

```text
backend/
├── src/
│   ├── config/         # Configuración de base de datos, entorno y Cloudinary
│   ├── controllers/    # Lógica HTTP (req, res), delegan en servicios
│   ├── middlewares/    # Protecciones (Auth, Rate Limit, Uploads, Validaciones, Errores)
│   ├── models/         # Modelos de Sequelize (Esquemas de DB)
│   ├── repositories/   # Acceso directo a base de datos (findAll, create, etc.)
│   ├── routes/         # Definición de endpoints por módulo
│   ├── services/       # Lógica de negocio core (Cloudinary, JWT, validaciones complejas)
│   ├── utils/          # Helpers (ApiError, ApiResponse, paginación, slugify)
│   ├── validators/     # Reglas de express-validator
│   ├── app.js          # Configuración global de Express y middlewares de seguridad
│   └── index.js        # Punto de entrada de la aplicación
├── .env.example        # Ejemplo de variables de entorno
└── package.json
```

---

## 📡 Endpoints de la API

Todas las rutas tienen el prefijo `/api`.

### 🔐 Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión (Genera cookie de refresh token).
- `POST /logout` - Cierra sesión local (Limpia cookie).
- `POST /refresh` - Renueva Access Token.
- `POST /logout-all` - *(Protegido)* Cierra sesión en todos los dispositivos.
- `GET /me` - *(Protegido)* Obtiene el perfil del admin actual.

### 📦 Productos (`/api/productos`)
- `GET /` - Listar productos (Con paginación y filtros).
- `GET /:id` - Detalle por ID o Slug.
- `POST /` - *(Protegido Admin)* Crear producto (Soporta `multipart/form-data`).
- `PUT /:id` - *(Protegido Admin)* Actualizar producto.
- `DELETE /:id` - *(Protegido Superadmin)* Eliminar permanentemente.
- `PATCH /:id/stock` - *(Protegido Admin)* Modificar stock.
- `PATCH /:id/precio` - *(Protegido Admin)* Modificar precio.
- `PATCH /:id/activar` / `desactivar` - *(Protegido Admin)* Soft delete o pausa.
- `PATCH /:id/destacado` / `nuevo` / `mas-vendido` - *(Protegido Admin)* Toggles visuales.

### 🏷️ Categorías (`/api/categorias`)
- `GET /` - Listar categorías principales y subcategorías.
- `GET /:id` - Obtener por ID o Slug.
- `POST /` - *(Protegido Admin)* Crear categoría (con imagen opcional).
- `PUT /:id` - *(Protegido Admin)* Actualizar.
- `DELETE /:id` - *(Protegido Superadmin)* Eliminar permanentemente.
- `PATCH /:id/activar` / `desactivar` - *(Protegido Admin)* Soft delete.

### 🏅 Marcas (`/api/marcas`)
- `GET /` - Listar todas.
- `GET /:id` - Obtener por ID o Slug.
- `POST /` - *(Protegido Admin)* Crear marca (con logo opcional).
- `PUT /:id`, `DELETE /:id`, `PATCH /activar` - Similares a Categorías.

### 🏢 Proveedores (`/api/proveedores`) - 100% Privado
- *Todos los endpoints (GET, POST, PUT, DELETE, PATCH) requieren token de Administrador.*

### 📊 Dashboard (`/api/dashboard`) - 100% Privado
- `GET /stats` - *(Protegido Admin)* Obtiene conteos globales, alertas de stock y listados recientes en una sola petición paralela.

---

## ✉️ Ejemplos de Respuestas JSON

Toda la API utiliza un formato estandarizado definido por la clase `ApiResponse`.

### ✅ Respuesta Exitosa (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Productos obtenidos correctamente.",
  "data": {
    "productos": [
      {
        "id": 1,
        "nombre": "Mate Imperial",
        "precio": 45000,
        "stock": 10
      }
    ]
  },
  "meta": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 12,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### ❌ Respuesta de Error Genérico (400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Producto no encontrado.",
  "errors": null
}
```

### ❌ Error de Validación de Formularios (400 Bad Request)
```json
{
  "success": false,
  "message": "Error de validación.",
  "errors": [
    {
      "campo": "email",
      "mensaje": "Formato de email inválido."
    },
    {
      "campo": "password",
      "mensaje": "La contraseña debe tener al menos 6 caracteres."
    }
  ]
}
```
