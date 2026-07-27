import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/',           label: 'Inicio'    },
  { to: '/productos',  label: 'Productos' },
  { to: '/nosotros',   label: 'Nosotros'  },
  { to: '/contacto',   label: 'Contacto'  },
];

export default function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar menu al redimensionar a desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  }, [searchQuery, navigate]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="banner">
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="La Yerbería — Inicio">
            <span className={styles.logoIcon}>🌿</span>
            <span className={styles.logoText}>La Yerbería</span>
          </Link>

          {/* Navegación Desktop */}
          <nav className={styles.nav} aria-label="Navegación principal">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones */}
          <div className={styles.actions}>
            {/* Buscador */}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Abrir buscador"
            >
              <SearchIcon />
            </button>

            {/* Carrito */}
            <button
              className={styles.cartBtn}
              onClick={openDrawer}
              aria-label={`Abrir carrito — ${totalItems} productos`}
            >
              <CartIcon />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  className={styles.badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </button>

            {/* Hamburguesa */}
            <button
              className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda expandible */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchBar}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <form className={`container ${styles.searchForm}`} onSubmit={handleSearch}>
                <SearchIcon />
                <input
                  autoFocus
                  type="search"
                  placeholder="Buscar mates, yerbas, termos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Buscar productos"
                />
                <button type="submit" className={styles.searchSubmit}>Buscar</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              aria-hidden="true"
            />
            <motion.nav
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              aria-label="Menú móvil"
            >
              <button className={styles.closeMenu} onClick={closeMenu} aria-label="Cerrar menú">✕</button>
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${styles.mobileLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
