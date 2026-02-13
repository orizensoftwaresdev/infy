// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;