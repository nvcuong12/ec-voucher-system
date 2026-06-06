import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "voucherhub_cart";

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredCart); // [{ voucher, quantity }]

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((voucher, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.voucher.id === voucher.id);
      if (existing) {
        return prev.map((i) =>
          i.voucher.id === voucher.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { voucher, quantity }];
    });
  }, []);

  const removeItem = useCallback((voucherId) => {
    setItems((prev) => prev.filter((i) => i.voucher.id !== voucherId));
  }, []);

  const updateQuantity = useCallback((voucherId, quantity) => {
    if (quantity <= 0) return removeItem(voucherId);
    setItems((prev) =>
      prev.map((i) => (i.voucher.id === voucherId ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce(
    (sum, i) => sum + parseFloat(i.voucher.sale_price) * i.quantity,
    0
  );

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
