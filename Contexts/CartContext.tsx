import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

export interface CartItem {
  id: string;
  product_id: string;
  shop_id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  quantity: number;
  added_at: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useUser();

  // Load cart items from Supabase on mount
  useEffect(() => {
    if (userDetails?.id) {
      loadCartItems();
    }
  }, [userDetails?.id]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_cart')
        .select('*')
        .eq('user_id', userDetails?.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error loading cart items:', error);
        return;
      }

      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: any) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      // Get the product ID using fallback logic
      const productId = product.product_id || product.id?.toString() || String(product.id || '');
      
      // Validate that we have a valid product ID
      if (!productId || productId === 'undefined' || productId === 'null') {
        console.error('Invalid product ID:', productId);
        throw new Error('Invalid product ID');
      }
      
      // Check if product already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update quantity
        await updateQuantity(productId, existingItem.quantity + 1);
        return;
      }

      // Add new item to cart
      const newCartItem: Omit<CartItem, 'id'> = {
        product_id: productId,
        shop_id: product.shop_id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        quantity: 1,
        added_at: new Date().toISOString(),
      };

      console.log('New cart item to insert:', JSON.stringify(newCartItem, null, 2));

      const { data, error } = await supabase
        .from('user_cart')
        .insert([{ ...newCartItem, user_id: userDetails.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to cart:', error);
        return;
      }

      setCartItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      const { error } = await supabase
        .from('user_cart')
        .delete()
        .eq('user_id', userDetails.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from cart:', error);
        return;
      }

      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const { error } = await supabase
        .from('user_cart')
        .update({ quantity })
        .eq('user_id', userDetails.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }

      setCartItems(prev => 
        prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity } 
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      const { error } = await supabase
        .from('user_cart')
        .delete()
        .eq('user_id', userDetails.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }

      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
