import { createSlice } from '@reduxjs/toolkit';

const CART_KEY = 'sheishop_cart';

const loadCartFromLocalStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const serializedCart = localStorage.getItem(CART_KEY);
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (e) {
    return [];
  }
};

const saveCartToLocalStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    // localStorage full or unavailable — silently ignore
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromLocalStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.selectedColor === action.payload.selectedColor,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToLocalStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === action.payload.id &&
            item.selectedColor === action.payload.selectedColor
          ),
      );
      saveCartToLocalStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, selectedColor, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.id === id && item.selectedColor === selectedColor,
      );
      if (item && quantity >= 1) {
        item.quantity = quantity;
      }
      saveCartToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToLocalStorage(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
