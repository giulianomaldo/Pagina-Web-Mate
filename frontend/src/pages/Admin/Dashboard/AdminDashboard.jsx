import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminApi } from '../../../utils/api';
import styles from './AdminDashboard.module.css';
import sharedStyles from '../admin.shared.module.css';

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminApi.get('/dashboard/stats');
        // Handle axios response (.data) vs fetch response
        setStats(response.data || response || {});
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('No se pudieron cargar las estadísticas. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.welcome}>Bienvenido, {admin?.nombre || 'Administrador'}</h1>
        <p className={styles.subtitle}>Este es un resumen del estado actual de la tienda.</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando estadísticas...</div>
      ) : (
        <div className={sharedStyles.statsGrid || 'stats-grid'}>
          <div className={sharedStyles.statCard || 'stat-card'}>
            <div className={sharedStyles.statIcon || 'stat-icon'}>📦</div>
            <div className={sharedStyles.statValue || 'stat-value'}>
              {stats?.cantidades?.productos ?? 0}
            </div>
            <div className={sharedStyles.statLabel || 'stat-label'}>Total Productos Activos</div>
          </div>
          
          <div className={sharedStyles.statCard || 'stat-card'}>
            <div className={sharedStyles.statIcon || 'stat-icon'}>⚠️</div>
            <div className={sharedStyles.statValue || 'stat-value'} style={{ color: '#d32f2f' }}>
              {(stats?.alertas_stock?.sinStock ?? 0) + (stats?.alertas_stock?.pocoStock ?? 0)}
            </div>
            <div className={sharedStyles.statLabel || 'stat-label'}>Productos Stock Bajo</div>
          </div>

          <div className={sharedStyles.statCard || 'stat-card'}>
            <div className={sharedStyles.statIcon || 'stat-icon'}>🏷️</div>
            <div className={sharedStyles.statValue || 'stat-value'}>
              {stats?.cantidades?.categorias ?? 0}
            </div>
            <div className={sharedStyles.statLabel || 'stat-label'}>Total Categorías</div>
          </div>

          <div className={sharedStyles.statCard || 'stat-card'}>
            <div className={sharedStyles.statIcon || 'stat-icon'}>🛒</div>
            <div className={sharedStyles.statValue || 'stat-value'}>
              {stats?.totalOrdenes ?? 0}
            </div>
            <div className={sharedStyles.statLabel || 'stat-label'}>Total Órdenes/Pedidos</div>
          </div>
        </div>
      )}

      <section className={styles.quickLinks}>
        <h2 className={styles.linksTitle}>Accesos Rápidos</h2>
        <div className={styles.linksGrid}>
          <NavLink to="/admin/productos" className={styles.quickLink}>
            <span>📦</span> Gestionar Productos
          </NavLink>
          <NavLink to="/admin/categorias" className={styles.quickLink}>
            <span>🏷️</span> Gestionar Categorías
          </NavLink>
          <NavLink to="/admin/pedidos" className={styles.quickLink}>
            <span>🛒</span> Ver Pedidos
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
