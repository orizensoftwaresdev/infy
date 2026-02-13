// src/contexts/ProductContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await api.get('/products/featured');
      setFeaturedProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch featured products:', err);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await api.get('/products/trending');
      setTrendingProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch trending products:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  return (
    <ProductContext.Provider value={{
      products, loading, error, pagination,
      featuredProducts, trendingProducts, categories,
      fetchProducts, fetchProductById, fetchFeatured, fetchTrending, fetchCategories
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);