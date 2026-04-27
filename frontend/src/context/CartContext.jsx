import { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id && x.size === item.size && x.color === item.color);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x._id === existItem._id && x.size === existItem.size && x.color === existItem.color ? item : x
          ),
        };
      } else {
        return { ...state, cartItems: [...state.cartItems, item] };
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.cartId !== action.payload),
      };
    case 'UPDATE_CART_QTY':
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.cartId === action.payload.cartId
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case 'UPDATE_CART_SIZE': {
      const { cartId, size } = action.payload;
      const currentItem = state.cartItems.find((item) => item.cartId === cartId);

      if (!currentItem) {
        return state;
      }

      const nextCartId = `${currentItem._id}-${size}-${currentItem.color}`;
      const mergedItem = state.cartItems.find(
        (item) => item.cartId === nextCartId && item.cartId !== cartId
      );

      if (mergedItem) {
        const mergedQty = currentItem.countInStock > 0
          ? Math.min(currentItem.countInStock, mergedItem.qty + currentItem.qty)
          : mergedItem.qty + currentItem.qty;

        return {
          ...state,
          cartItems: state.cartItems
            .filter((item) => item.cartId !== cartId)
            .map((item) =>
              item.cartId === nextCartId ? { ...item, qty: mergedQty } : item
            ),
        };
      }

      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.cartId === cartId
            ? { ...item, size, cartId: nextCartId }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

  const addToCart = (product, qty, size, color) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, qty, size, color, cartId: `${product._id}-${size}-${color}` },
    });
  };

  const removeFromCart = (cartId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartId });
  };

  const updateCartQty = (cartId, qty) => {
    dispatch({
      type: 'UPDATE_CART_QTY',
      payload: { cartId, qty: Math.max(1, qty) },
    });
  };

  const updateCartSize = (cartId, size) => {
    dispatch({
      type: 'UPDATE_CART_SIZE',
      payload: { cartId, size },
    });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, updateCartQty, updateCartSize, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
