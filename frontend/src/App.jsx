import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// ── Páginas públicas ──────────────────────────────────────────────────
const Home             = lazy(() => import('./pages/Home/Home'));
const Productos        = lazy(() => import('./pages/Productos/Productos'));
const ProductoDetalle  = lazy(() => import('./pages/ProductoDetalle/ProductoDetalle'));
const Nosotros         = lazy(() => import('./pages/Nosotros/Nosotros'));
const Contacto         = lazy(() => import('./pages/Contacto/Contacto'));
const NotFound         = lazy(() => import('./pages/NotFound/NotFound'));

// ── Páginas del panel admin ───────────────────────────────────────────
const AdminLogin         = lazy(() => import('./pages/Admin/Login/AdminLogin'));
const AdminDashboard     = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminProductos     = lazy(() => import('./pages/Admin/Productos/AdminProductos'));
const AdminCategorias    = lazy(() => import('./pages/Admin/Categorias/AdminCategorias'));
const AdminMarcas        = lazy(() => import('./pages/Admin/Marcas/AdminMarcas'));
const AdminProveedores   = lazy(() => import('./pages/Admin/Proveedores/AdminProveedores'));
const AdminBanners       = lazy(() => import('./pages/Admin/Banners/AdminBanners'));
const AdminPromociones   = lazy(() => import('./pages/Admin/Promociones/AdminPromociones'));
const AdminConfiguracion = lazy(() => import('./pages/Admin/Configuracion/AdminConfiguracion'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-text-muted)', fontSize: '1rem' }}>
        Cargando...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Tienda pública ── */}
              <Route path="/" element={<MainLayout />}>
                <Route index               element={<Home />}            />
                <Route path="productos"    element={<Productos />}       />
                <Route path="producto/:id" element={<ProductoDetalle />} />
                <Route path="nosotros"     element={<Nosotros />}        />
                <Route path="contacto"     element={<Contacto />}        />
                <Route path="*"            element={<NotFound />}        />
              </Route>

              {/* ── Panel admin ── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index               element={<Navigate to="/admin/productos" replace />} />
                <Route path="productos"    element={<AdminProductos />}     />
                <Route path="categorias"   element={<AdminCategorias />}    />
                <Route path="marcas"       element={<AdminMarcas />}        />
                <Route path="proveedores"  element={<AdminProveedores />}   />
                <Route path="banners"      element={<AdminBanners />}       />
                <Route path="promociones"  element={<AdminPromociones />}   />
                <Route path="configuracion" element={<AdminConfiguracion />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
