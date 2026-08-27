import React, { useState, useEffect } from 'react';
import sharedStyles from '../admin.shared.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminOrdenes = () => {
    const { admin } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrdenes = async () => {
        try {
            setLoading(true);
            const res = await adminApi.get('/ordenes');
            setOrdenes(res.data.ordenes || []);
        } catch (error) {
            console.error('Error fetching ordenes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            await adminApi.patch(`/ordenes/${id}/estado`, { estado: nuevoEstado });
            fetchOrdenes();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el estado del pedido.');
        }
    };

    if (loading) {
        return <div className={sharedStyles.spinner}>Cargando pedidos...</div>;
    }

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Pedidos / Órdenes</h1>
            </div>

            <div className={sharedStyles.tableWrap}>
                <table className={sharedStyles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={sharedStyles.emptyState}>No hay pedidos registrados.</td>
                            </tr>
                        ) : (
                            ordenes.map(orden => (
                                <tr key={orden.id}>
                                    <td>#{orden.id}</td>
                                    <td>{new Date(orden.created_at || orden.createdAt).toLocaleDateString()}</td>
                                    <td>{orden.cliente_nombre}</td>
                                    <td>{orden.cliente_email}</td>
                                    <td>${Number(orden.total).toLocaleString()}</td>
                                    <td>
                                        <span className={
                                            orden.estado === 'completada' ? sharedStyles.badgeGreen :
                                            orden.estado === 'pendiente' ? sharedStyles.badgeYellow :
                                            orden.estado === 'cancelada' ? sharedStyles.badgeRed :
                                            sharedStyles.badgeGray
                                        }>
                                            {orden.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={orden.estado}
                                            onChange={(e) => handleUpdateStatus(orden.id, e.target.value)}
                                            className={sharedStyles.select}
                                            style={{ padding: '0.2rem', fontSize: '0.8rem', width: '120px' }}
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="procesando">Procesando</option>
                                            <option value="enviada">Enviada</option>
                                            <option value="completada">Completada</option>
                                            <option value="cancelada">Cancelada</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdenes;
