import { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const uniqueIds = (ids) => [...new Set(ids.filter(Boolean))];

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
          selectedCartIds: uniqueIds([...state.selectedCartIds, item.cartId]),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
          selectedCartIds: uniqueIds([...state.selectedCartIds, item.cartId]),
        };
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.cartId !== action.payload),
        selectedCartIds: state.selectedCartIds.filter((cartId) => cartId !== action.payload),
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
        const shouldSelectMerged = state.selectedCartIds.includes(cartId) || state.selectedCartIds.includes(nextCartId);

        return {
          ...state,
          cartItems: state.cartItems
            .filter((item) => item.cartId !== cartId)
            .map((item) =>
              item.cartId === nextCartId ? { ...item, qty: mergedQty } : item
            ),
          selectedCartIds: uniqueIds([
            ...state.selectedCartIds.filter((id) => id !== cartId && id !== nextCartId),
            ...(shouldSelectMerged ? [nextCartId] : []),
          ]),
        };
      }

      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.cartId === cartId
            ? { ...item, size, cartId: nextCartId }
            : item
        ),
        selectedCartIds: uniqueIds(
          state.selectedCartIds.map((id) => id === cartId ? nextCartId : id)
        ),
      };
    }
    case 'TOGGLE_CART_SELECTION': {
      const cartId = action.payload;
      const isSelected = state.selectedCartIds.includes(cartId);

      return {
        ...state,
        selectedCartIds: isSelected
          ? state.selectedCartIds.filter((id) => id !== cartId)
          : uniqueIds([...state.selectedCartIds, cartId]),
      };
    }
    case 'SELECT_ALL_CART_ITEMS':
      return {
        ...state,
        selectedCartIds: state.cartItems.map((item) => item.cartId),
      };
    case 'CLEAR_CART_SELECTION':
      return {
        ...state,
        selectedCartIds: [],
      };
    case 'CLEAR_SELECTED_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => !state.selectedCartIds.includes(item.cartId)),
        selectedCartIds: [],
      };
    case 'CLEAR_CART':
      return { ...state, cartItems: [], selectedCartIds: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [], selectedCartIds: [] });

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

  const toggleCartSelection = (cartId) => {
    dispatch({ type: 'TOGGLE_CART_SELECTION', payload: cartId });
  };

  const selectAllCartItems = () => {
    dispatch({ type: 'SELECT_ALL_CART_ITEMS' });
  };

  const clearCartSelection = () => {
    dispatch({ type: 'CLEAR_CART_SELECTION' });
  };

  const clearSelectedCart = () => {
    dispatch({ type: 'CLEAR_SELECTED_CART' });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cartItems: state.cartItems,
      selectedCartIds: state.selectedCartIds,
      addToCart,
      removeFromCart,
      updateCartQty,
      updateCartSize,
      toggleCartSelection,
      selectAllCartItems,
      clearCartSelection,
      clearSelectedCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
