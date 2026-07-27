# 🌿 La Yerbería — Tienda Virtual de Mates & Té Premium

Aplicación web de e-commerce completa para una tienda de mates, bombillas, termos, yerbas y blends de té. Arquitectura **Frontend + Backend** desacoplada, lista para producción.

---

## 🚀 Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 19, Vite, JavaScript, CSS Modules, HTML5 |
| **Routing** | React Router v7 |
| **Animaciones** | Framer Motion |
| **Estado global** | Context API + useReducer |
| **Notificaciones** | React Hot Toast |
| **Backend** | Node.js, Express.js |
| **Base de datos** | SQLite (sqlite3) |
| **Tests Frontend** | Vitest + React Testing Library |
| **Tests Backend** | Jest + Supertest |

---

## 📂 Estructura del Proyecto

```
PW-MATE/
├── frontend/
│   ├── src/
│   │   ├── assets/             # Imágenes y recursos estáticos
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── Badge/
│   │   │   ├── Button/
│   │   │   ├── CartDrawer/     # Panel lateral del carrito
│   │   │   ├── Footer/
│   │   │   ├── Navbar/         # Barra de navegación sticky
│   │   │   ├── ProductCard/    # Tarjeta de producto
│   │   │   ├── ProductGrid/    # Grilla de productos + skeleton
│   │   │   ├── ScrollToTop/
│   │   │   └── Skeleton/       # Estados de carga
│   │   ├── context/
│   │   │   └── CartContext.jsx # Estado global del carrito (persist.)
│   │   ├── data/
│   │   │   └── productos.json  # ← AQUÍ SE AGREGAN PRODUCTOS
│   │   ├── hooks/
│   │   │   ├── useFiltros.js   # Lógica de filtros y búsqueda
│   │   │   └── useScrollTop.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx  # Layout raíz con Navbar+Footer
│   │   ├── pages/
│   │   │   ├── Home/           # Página de inicio (Hero+Categorías+Destacados)
│   │   │   ├── Productos/      # Catálogo con filtros
│   │   │   ├── ProductoDetalle/# Detalle individual
│   │   │   ├── Nosotros/
│   │   │   ├── Contacto/
│   │   │   └── NotFound/       # Página 404
│   │   ├── styles/
│   │   │   ├── variables.css   # Design tokens (colores, tipografía, etc.)
│   │   │   └── global.css      # Reset y estilos base
│   │   ├── utils/
│   │   │   ├── constants.js    # WhatsApp, categorías, etc.
│   │   │   └── helpers.js      # Formateo, filtrado, mensaje WA
│   │   ├── App.jsx             # Rutas + Providers
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── app.js              # Express app (sin listen)
    │   ├── index.js            # Servidor (listen)
    │   ├── config/
    │   ├── controllers/
    │   ├── db/                 # Archivos .sqlite
    │   ├── middlewares/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    ├── tests/
    │   └── app.test.js
    └── package.json
```

---

## 🛍️ Flujo de compra

```
Usuario entra → Navega / Busca / Filtra → Agrega al carrito
→ Abre drawer del carrito → Finalizar pedido → WhatsApp con el pedido completo
```

El número de WhatsApp es una **constante centralizada** en `frontend/src/utils/constants.js`:

```js
export const WHATSAPP_NUMBER = '5491100000000'; // ← Cambiar aquí
```

---

## ➕ Cómo agregar nuevos productos

Solo editá el archivo `frontend/src/data/productos.json`. Cada producto tiene esta forma:

```json
{
  "id": 13,
  "nombre": "Mi Nuevo Producto",
  "marca": "Mi Marca",
  "categoria": "mates",
  "tipo": "Mate artesanal",
  "precio": 15000,
  "stock": 20,
  "imagen": "https://url-de-la-imagen.com/foto.jpg",
  "imagenes": ["url1", "url2"],
  "descripcion": "Descripción del producto.",
  "destacado": false,
  "nuevo": true,
  "masVendido": false
}
```

**Categorías disponibles:** `mates` | `bombillas` | `termos` | `yerbas` | `blends`

---

## 🛠️ Instalación

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

## ▶️ Modo desarrollo

**Terminal 1 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd backend
node src/index.js
# → http://localhost:3000
```

## 🧪 Tests

```bash
# Backend (Jest + Supertest)
cd backend
npm run test

# Frontend (Vitest + React Testing Library)
cd frontend
npm run test
```

---

## 🎨 Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--color-deep-green` | `#23391c` | Color primario, CTAs |
| `--color-forest` | `#2e3b23` | Hover primario |
| `--color-mid-green` | `#404d36` | Acentos |
| `--color-sage` | `#828d78` | Texto secundario |
| `--color-olive` | `#62675c` | Muted |
| `--color-stone` | `#8d8479` | Badges |
| `--color-bg` | `#bfbdb6` | Fondo neutro |
| `--color-black` | `#0a0a0e` | Textos oscuros |

---

## 📋 Páginas incluidas

| Ruta | Página |
|---|---|
| `/` | Home (Hero + Categorías + Destacados) |
| `/productos` | Catálogo con búsqueda y filtros |
| `/producto/:id` | Detalle individual del producto |
| `/nosotros` | Historia y valores de la marca |
| `/contacto` | Datos y WhatsApp |
| `/*` | Página 404 |

---

*📝 Este README se actualiza automáticamente con cada cambio relevante en el proyecto.*
