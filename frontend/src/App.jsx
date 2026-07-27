import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';

// Lazy loading de todas las páginas
const Home             = lazy(() => import('./pages/Home/Home'));
const Productos        = lazy(() => import('./pages/Productos/Productos'));
const ProductoDetalle  = lazy(() => import('./pages/ProductoDetalle/ProductoDetalle'));
const Nosotros         = lazy(() => import('./pages/Nosotros/Nosotros'));
const Contacto         = lazy(() => import('./pages/Contacto/Contacto'));
const NotFound         = lazy(() => import('./pages/NotFound/NotFound'));

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
      <CartProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index               element={<Home />}            />
              <Route path="productos"    element={<Productos />}       />
              <Route path="producto/:id" element={<ProductoDetalle />} />
              <Route path="nosotros"     element={<Nosotros />}        />
              <Route path="contacto"     element={<Contacto />}        />
              <Route path="*"            element={<NotFound />}        />
            </Route>
          </Routes>
        </Suspense>
      </CartProvider>
    </BrowserRouter>
  );
}
