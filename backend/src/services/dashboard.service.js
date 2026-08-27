'use strict';

const { Op, Sequelize } = require('sequelize');
const { Producto, Categoria, Marca, Orden } = require('../models');

/**
 * dashboard.service.js
 *
 * Agrupa consultas estadísticas y métricas generales para
 * el panel de administración.
 */

async function getStats() {
  // Consultas en paralelo para mayor velocidad
  const [
    totalProductos,
    totalCategorias,
    totalMarcas,
    totalOrdenes,
    totalSinStock,
    totalPocoStock,
    ultimosAgregados,
    productosDestacados,
  ] = await Promise.all([
    // 1. Cantidades generales
    Producto.count(),
    Categoria.count(),
    Marca.count(),
    Orden.count(),

    // 2. Productos sin stock (cuenta)
    Producto.count({ where: { stock: 0 } }),

    // 3. Productos con poco stock (cuenta: 0 < stock <= stock_minimo)
    Producto.count({
      where: {
        stock: {
          [Op.gt]: 0,
          [Op.lte]: Sequelize.col('stock_minimo'),
        },
      },
    }),

    // 4. Últimos 5 productos agregados (lista para preview)
    Producto.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'nombre', 'stock', 'precio', 'is_active', 'created_at'],
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
      ]
    }),

    // 5. Productos destacados (lista limit 5)
    Producto.findAll({
      where: { is_destacado: true },
      limit: 5,
      attributes: ['id', 'nombre', 'stock', 'precio', 'is_active'],
    }),
  ]);

  // Construcción del objeto de respuesta con las estadísticas consolidadas
  return {
    cantidades: {
      productos: totalProductos,
      categorias: totalCategorias,
      marcas: totalMarcas,
    },
    totalOrdenes,
    alertas_stock: {
      sinStock: totalSinStock,
      pocoStock: totalPocoStock,
    },
    listas: {
      ultimosAgregados,
      productosDestacados,
    },
  };
}

module.exports = {
  getStats,
};
