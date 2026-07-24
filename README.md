# 🛒 Tienda Virtual (E-commerce)

Este proyecto es una aplicación web completa para una tienda virtual, construida con un stack de tecnologías moderno separando la lógica del cliente (**Frontend**) y del servidor (**Backend**).

## 🚀 Tecnologías Principales

- **Frontend:** React, Vite, JavaScript, HTML, CSS.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** SQLite.
- **Testing:** Vitest + React Testing Library (Frontend), Jest + Supertest (Backend).

## 📂 Estructura del Proyecto

El proyecto está dividido en dos directorios principales:

### `frontend/` (Cliente)
Aplicación React inicializada con Vite.
- `src/components/`: Componentes UI reutilizables (Botones, Tarjetas, Navbar).
- `src/pages/`: Vistas de la aplicación (Home, Carrito, Detalles del producto).
- `src/services/`: Lógica de comunicación con la API del backend.
- `src/hooks/`: Custom Hooks de React.
- `src/context/`: Manejo del estado global de la aplicación.
- `src/utils/`: Funciones auxiliares y formateadores.
- `src/styles/`: Hojas de estilo CSS.

### `backend/` (Servidor API)
API REST desarrollada en Node.js y Express.
- `src/routes/`: Definición de los endpoints de la API.
- `src/controllers/`: Controladores encargados de manejar las solicitudes HTTP.
- `src/services/`: Lógica de negocio (Cálculos de precios, reglas de compra).
- `src/models/`: Interacción directa con la base de datos (SQLite).
- `src/middlewares/`: Funciones intermedias (Autenticación, logs, manejo de errores).
- `src/config/`: Configuraciones de variables de entorno y base de datos.
- `src/db/`: Archivos físicos de la base de datos `.sqlite` y migraciones.
- `src/utils/`: Funciones de utilidad general compartidas.
- `tests/`: Pruebas de integración de la API.

## 🛠️ Instalación y Configuración

Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu equipo.

### 1. Backend
```bash
cd backend
npm install
```

### 2. Frontend
```bash
cd frontend
npm install
```

## ▶️ Ejecución en Desarrollo

Para trabajar en el proyecto, necesitas levantar ambos servicios en simultáneo usando dos terminales:

**Terminal 1 (Backend):**
```bash
cd backend
node src/index.js
```
*(El servidor correrá en el puerto 3000 por defecto).*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 🧪 Testing

Ambos entornos están completamente configurados con herramientas de pruebas profesionales.

**Backend (Jest + Supertest):**
```bash
cd backend
npm run test
# o para que quede escuchando los cambios:
npm run test:watch
```

**Frontend (Vitest + React Testing Library):**
```bash
cd frontend
npm run test
# o para la interfaz visual de vitest:
npm run test:ui
```

---
*📝 **Mantenimiento del Documento**: Este archivo `README.md` se irá modificando y actualizando automáticamente a medida que avancemos con la creación de tablas, rutas y funcionalidades de la tienda.*
