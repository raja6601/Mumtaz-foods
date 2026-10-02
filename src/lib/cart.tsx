import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./menu-types";

export type CartOption = { name: string; extra_price: number };
export type CartItem = {
  key: string;
  product_id: string;
  name: string;
  image_url: string | null;
  price: number | null;
  quantity: number;
  options: CartOption[];
  instructions?: string;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (product: Product, options?: CartOption[], instructions?: string) => void;
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mumtaz-foods-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    setOpen,
    add: (product, options = [], instructions) => {
      const key = `${product.id}:${options.map((option) => option.name).sort().join("|")}:${instructions ?? ""}`;
      setItems((current) => {
        const found = current.find((item) => item.key === key);
        if (found) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
        return [...current, { key, product_id: product.id, name: product.name, image_url: product.image_url, price: product.price, quantity: 1, options, ...(instructions ? { instructions } : {}) }];
      });
      setOpen(true);
    },
    update: (key, quantity) => setItems((current) => quantity < 1 ? current.filter((item) => item.key !== key) : current.map((item) => item.key === key ? { ...item, quantity } : item)),
    remove: (key) => setItems((current) => current.filter((item) => item.key !== key)),
    clear: () => setItems([]),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + ((item.price ?? 0) + item.options.reduce((extra, option) => extra + option.extra_price, 0)) * item.quantity, 0),
  }), [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
