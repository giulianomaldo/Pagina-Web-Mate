import { useState, useMemo } from 'react';
import { filtrarProductos } from '../utils/helpers';

export function useFiltros(productos) {
  const [busqueda, setBusqueda]     = useState('');
  const [categoria, setCategoria]   = useState('');
  const [marcas, setMarcas]         = useState([]);
  const [precioMin, setPrecioMin]   = useState('');
  const [precioMax, setPrecioMax]   = useState('');
  const [soloStock, setSoloStock]   = useState(false);
  const [orden, setOrden]           = useState('destacado');

  const productosFiltrados = useMemo(
    () => filtrarProductos(productos, { busqueda, categoria, marcas, precioMin, precioMax, soloStock, orden }),
    [productos, busqueda, categoria, marcas, precioMin, precioMax, soloStock, orden]
  );

  const resetFiltros = () => {
    setBusqueda('');
    setCategoria('');
    setMarcas([]);
    setPrecioMin('');
    setPrecioMax('');
    setSoloStock(false);
    setOrden('destacado');
  };

  const toggleMarca = (marca) => {
    setMarcas((prev) =>
      prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]
    );
  };

  return {
    busqueda, setBusqueda,
    categoria, setCategoria,
    marcas, toggleMarca,
    precioMin, setPrecioMin,
    precioMax, setPrecioMax,
    soloStock, setSoloStock,
    orden, setOrden,
    productosFiltrados,
    resetFiltros,
  };
}
