// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import VibeCheck from './pages/VibeCheck';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        {/* Auth pages (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Panel (separate layout with sidebar) */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Main app with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="vibecheck" element={<VibeCheck />} />
          <Route path="cart" element={<Cart />} />

          {/* Protected routes */}
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="order-confirmation/:id" element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="wishlist" element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-2xl font-bold">Wishlist</h1>
                <p className="text-gray-600 mt-2">Coming soon in Phase 3</p>
              </div>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;