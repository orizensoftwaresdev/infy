// src/pages/Cart.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, getTotalPrice, getTotalItems, clearCart } = useCartContext();
  const { isAuthenticated } = useAuth();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
        >
          <FiShoppingBag className="w-5 h-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={() => { clearCart(); toast.info('Cart cleared'); }}
          className="text-sm text-red-500 hover:text-red-700 transition font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex gap-4">
              <Link to={`/product/${item.id || item._id}`} className="flex-shrink-0">
                <div className="w-24 h-28 sm:w-28 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={item.image_front || item.images?.[0]?.url || '/images/placeholder.png'}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>
              </Link>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link to={`/product/${item.id || item._id}`}>
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 hover:text-purple-600 transition line-clamp-2">{item.title}</h3>
                  </Link>
                  {item.selectedSize && (
                    <p className="text-xs text-gray-500 mt-1">Size: <span className="font-medium">{item.selectedSize}</span></p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id || item._id, item.selectedSize)}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id || item._id, item.selectedSize)}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">₹{((item.offerPrice || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => { removeFromCart(item.id || item._id, item.selectedSize); toast.info('Item removed'); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>₹{getTotalPrice().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={getTotalPrice() >= 999 ? 'text-green-600 font-medium' : ''}>
                  {getTotalPrice() >= 999 ? 'FREE' : '₹99'}
                </span>
              </div>
              {getTotalPrice() < 999 && (
                <div className="bg-purple-50 rounded-lg p-3 text-xs text-purple-700">
                  <FiTag className="inline w-3 h-3 mr-1" />
                  Add ₹{(999 - getTotalPrice()).toLocaleString('en-IN')} more for free shipping!
                </div>
              )}
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{(getTotalPrice() + (getTotalPrice() >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
            </div>

            {isAuthenticated ? (
              <Link
                to="/checkout"
                className="block w-full text-center py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
              >
                Proceed to Checkout <FiArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: '/cart' } }}
                className="block w-full text-center py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
              >
                Login to Checkout <FiArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            )}

            <Link
              to="/products"
              className="block w-full text-center py-2.5 mt-3 text-purple-600 font-medium text-sm hover:text-purple-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;