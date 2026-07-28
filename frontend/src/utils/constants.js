/* Constante centralizada — cambiar solo aquí para afectar todo el sitio */
export const WHATSAPP_NUMBER = '5491100000000'; // Formato: código país + área + número (sin +)

export const CATEGORIAS = [
  { id: 'mates',     label: 'Mates',     emoji: '🧉', descripcion: 'Artesanales y únicos' },
  { id: 'blends',    label: 'Blends',    emoji: '🫖', descripcion: 'Mezclas de autor'    },
  { id: 'yerbas',    label: 'Yerbas',    emoji: '🌿', descripcion: 'Selección premium'   },
  { id: 'termos',    label: 'Termos',    emoji: '🥤', descripcion: 'Para cada aventura'  },
  { id: 'bombillas', label: 'Bombillas', emoji: '🥄', descripcion: 'Precisión y calidad' },
];

export const ORDENAR_OPTIONS = [
  { value: 'destacado',    label: 'Destacados'     },
  { value: 'precio-asc',   label: 'Menor precio'   },
  { value: 'precio-desc',  label: 'Mayor precio'   },
  { value: 'nombre-asc',   label: 'A → Z'          },
  { value: 'nombre-desc',  label: 'Z → A'          },
  { value: 'mas-vendidos', label: 'Más vendidos'   },
  { value: 'nuevos',       label: 'Más nuevos'     },
];
