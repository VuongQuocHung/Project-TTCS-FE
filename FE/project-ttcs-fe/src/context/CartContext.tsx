"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { cartApi } from "@/lib/api-endpoints";
import { useAuth } from "./AuthContext";
import type { Cart, CartItem } from "@/types/api";

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
  const [cartData, setCartData] = useState<Cart>({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const syncCart = (nextCart?: Cart | null) => {
    setCartData({
      id: nextCart?.id,
      items: nextCart?.items ?? [],
      totalPrice: nextCart?.totalPrice ?? 0,
    });
  };

  const fetchCart = async () => {
    if (!user?.token) {
      syncCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartApi.getCart();
      syncCart(response);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void fetchCart();
  }, [authLoading, user?.token]);

  const addToCart = async (variantId: number, quantity = 1) => {
    if (!user?.token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartApi.addToCart(variantId, quantity);
      syncCart(response);
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
      const response = await cartApi.removeFromCart(itemId);
      syncCart(response);
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
      const response = await cartApi.updateQuantity(itemId, quantity);
      syncCart(response);
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
      syncCart(null);
    } catch (error) {
      console.error("Failed to clear cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cart = cartData.items ?? [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const totalPrice = cartData.totalPrice ?? 0;

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
