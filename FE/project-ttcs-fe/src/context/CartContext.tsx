"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { cartApi } from "@/lib/api-endpoints";
import { useAuth } from "./AuthContext"; // isLoading = AuthContext đang đọc localStorage
import { CartItem } from "@/types/api";

interface CartContextType {
  cart: CartItem[];
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      setCart(res.items || []);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chờ AuthContext load xong (đọc localStorage) mới fetch cart
  // Nếu fetch khi authLoading=true thì user=null → cart bị xoá sạch sai
  useEffect(() => {
    if (authLoading) return;
    fetchCart();
  }, [user, authLoading]);

  const addToCart = async (variantId: number, quantity = 1) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    try {
      setIsLoading(true);
      const res = await cartApi.addToCart(variantId, quantity);
      setCart(res.items || []);
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert("Thêm vào giỏ hàng thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setIsLoading(true);
      const res = await cartApi.removeFromCart(itemId);
      setCart(res.items || []);
    } catch (error) {
      console.error("Failed to remove from cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      setIsLoading(true);
      const res = await cartApi.updateQuantity(itemId, quantity);
      setCart(res.items || []);
    } catch (error) {
      console.error("Failed to update cart quantity", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartApi.clearCart();
      setCart([]);
    } catch (error) {
      console.error("Failed to clear cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
