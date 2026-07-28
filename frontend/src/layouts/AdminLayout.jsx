import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  {
    section: 'Catálogo',
    links: [
      { to: '/admin/productos',   icon: '📦', label: 'Productos'   },
      { to: '/admin/categorias',  icon: '🏷️',  label: 'Categorías' },
      { to: '/admin/marcas',      icon: '⭐',  label: 'Marcas'     },
      { to: '/admin/proveedores', icon: '🚚',  label: 'Proveedores'},
    ],
  },
  {
    section: 'Marketing',
    links: [
      { to: '/admin/banners',     icon: '🖼️',  label: 'Banners'    },
      { to: '/admin/promociones', icon: '🎁',  label: 'Promociones'},
    ],
  },
  {
    section: 'Sitio',
    links: [
      { to: '/admin/configuracion', icon: '⚙️', label: 'Contacto / Config' },
    ],
  },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const initials = admin?.nombre
    ? admin.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className={styles.layout}>
      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarBrandIcon}>🧉</span>
          <div>
            <div className={styles.sidebarBrandName}>Encontrarte</div>
            <div className={styles.sidebarBrandSub}>Panel Admin</div>
          </div>
        </div>

        <nav className={styles.sidebarNav} aria-label="Navegación del panel">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <div className={styles.sidebarSection}>{group.section}</div>
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.sidebarLinkIcon}>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>{initials}</div>
            <div>
              <div className={styles.adminName}>{admin?.nombre || 'Admin'}</div>
              <div className={styles.adminRol}>{admin?.rol || 'editor'}</div>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            id="admin-logout-btn"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir menú"
              id="admin-menu-toggle"
            >
              ☰
            </button>
            <span className={styles.topbarTitle}>Panel de Administración</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.topbarAdminBadge}>
              👤 {admin?.nombre}
            </span>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
