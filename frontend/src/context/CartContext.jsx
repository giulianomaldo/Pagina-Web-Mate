import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

/* ===================== REDUCER ===================== */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existe = state.items.find((i) => i.id === action.payload.id);
      if (existe) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stock) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

    case 'INCREMENT': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload
            ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stock) }
            : i
        ),
      };
    }

    case 'DECREMENT': {
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.payload ? { ...i, cantidad: i.cantidad - 1 } : i
          )
          .filter((i) => i.cantidad > 0),
      };
    }

    case 'CLEAR':
      return { ...state, items: [] };

    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

/* ===================== PROVIDER ===================== */
const initialState = {
  items: [],
  isOpen: false,
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('la-yerberia-cart');
      return saved ? { ...init, items: JSON.parse(saved) } : init;
    } catch {
      return init;
    }
  });

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem('la-yerberia-cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrice = state.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const actions = {
    addItem:      (producto) => dispatch({ type: 'ADD_ITEM',      payload: producto }),
    removeItem:   (id)       => dispatch({ type: 'REMOVE_ITEM',   payload: id       }),
    increment:    (id)       => dispatch({ type: 'INCREMENT',     payload: id       }),
    decrement:    (id)       => dispatch({ type: 'DECREMENT',     payload: id       }),
    clearCart:    ()         => dispatch({ type: 'CLEAR'                             }),
    toggleDrawer: ()         => dispatch({ type: 'TOGGLE_DRAWER'                     }),
    openDrawer:   ()         => dispatch({ type: 'OPEN_DRAWER'                       }),
    closeDrawer:  ()         => dispatch({ type: 'CLOSE_DRAWER'                      }),
  };

  return (
    <CartContext.Provider value={{ ...state, totalItems, totalPrice, ...actions }}>
      {children}
    </CartContext.Provider>
  );
}

/* ===================== HOOK ===================== */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
