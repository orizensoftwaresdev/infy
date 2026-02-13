// src/contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the CartContext
export const CartContext = createContext();

// Create the CartProvider component to wrap your application
export const CartProvider = ({ children }) => {
  // Initialize cart state, attempting to load from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      return []; // Return empty array on error
    }
  });

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // Dependency array ensures effect runs when 'cart' changes

  // Function to add a product to the cart
  const addToCart = (product, size) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );

    if (existingItemIndex > -1) {
      // If item (with same size) exists, increase its quantity
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      // If item is new, add it to the cart with quantity 1
      setCart([...cart, { ...product, quantity: 1, selectedSize: size }]);
    }
  };

  // Function to remove an item from the cart
  const removeFromCart = (id, size) => {
    setCart(cart.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  // Function to increase the quantity of an item in the cart
  const increaseQuantity = (id, size) => {
    setCart(
      cart.map(item =>
        item.id === id && item.selectedSize === size ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Function to decrease the quantity of an item in the cart
  const decreaseQuantity = (id, size) => {
    setCart(
      cart.map(item =>
        item.id === id && item.selectedSize === size ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  // Function to clear the entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Function to get the total number of items in the cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to get the total price of all items in the cart
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: cart,
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to easily consume the CartContext
export const useCartContext = () => useContext(CartContext);