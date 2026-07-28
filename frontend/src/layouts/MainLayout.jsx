import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import CartDrawer from '../components/CartDrawer/CartDrawer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ScrollToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-accent)',
            fontSize: '0.875rem',
            background: '#fff',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: 'var(--color-primary)', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
