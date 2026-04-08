import { useState, useContext, createContext, useEffect } from "react";
import { useAuth } from "./auth";
import {toast} from "sonner";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const existingCart = localStorage.getItem("cart");
    return existingCart ? JSON.parse(existingCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  // Derived orderItems for backend
  const orderItems = cart.map((item) => ({
    service: item._id, // backend expects _id as service
    quantity: item.quantity || 1, // default 1
  }));

  const addToCart = (newItem) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((item) => item._id === newItem._id);
      const incomingQty = newItem.quantity || 1;

      if (itemIndex !== -1) {
        const updatedCart = [...prevCart];

        // ⚠️ Just override with latest quantity, not add blindly
        updatedCart[itemIndex].quantity = incomingQty;
        toast.success("Dish successfully added to the Order.");

        return updatedCart;
      } else {
        return [...prevCart, { ...newItem, quantity: incomingQty }];
      }
    });
  };

  const increaseQty = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (itemId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item._id === itemId
            ? {
              ...item,
              quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity,
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
     toast.success("Dish Removed from the Order");

  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart"); // Optional: fully remove the key
     toast.success("Order Has Been Discarded !!");
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orderItems, // ✅ export filtered array for backend
        setCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
