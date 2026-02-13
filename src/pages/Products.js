// src/pages/Products.js
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import Product from '../components/Product';
import Loader from '../components/common/Loader';
import { FiFilter, FiChevronDown, FiX } from 'react-icons/fi';

const sortOptions = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const Products = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination, fetchProducts, categories, fetchCategories } = useProducts();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');

  // Get values from URL or VibeCheck state
  const vibeState = location.state;
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    bodyType: vibeState?.bodyType || searchParams.get('bodyType') || '',
    occasion: vibeState?.occasion || searchParams.get('occasion') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const loadProducts = useCallback(() => {
    const params = { page: searchParams.get('page') || 1, limit: 12 };
    if (sortBy) params.sort = sortBy;
    if (filters.category) params.category = filters.category;
    if (filters.bodyType) params.bodyType = filters.bodyType;
    if (filters.occasion) params.occasion = filters.occasion;
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (searchParams.get('featured')) params.featured = 'true';
    if (searchParams.get('trending')) params.trending = 'true';

    fetchProducts(params);
  }, [sortBy, filters, searchParams, fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSort = (value) => {
    setSortBy(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('sort', value); else newParams.delete('sort');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ category: '', bodyType: '', occasion: '', search: '', minPrice: '', maxPrice: '' });
    setSortBy('');
    setSearchParams({});
  };

  const goToPage = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-1">{pagination.total} items found</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${showFilters ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'}`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs font-bold">{activeFilterCount}</span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Products</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                <FiX className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name} ({cat.productCount})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
              <select
                value={filters.bodyType}
                onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Body Types</option>
                {['Pear', 'Rectangle', 'Hourglass', 'Apple', 'Inverted Triangle', 'Slim Build', 'Muscular Build', 'Broader Build'].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <select
                value={filters.occasion}
                onChange={(e) => handleFilterChange('occasion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Occasions</option>
                {['Party', 'Casual', 'Traditional', 'Professional', 'Travel', 'Fitness', 'Date Night', 'Festivals', 'Weddings'].map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <Loader text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map(product => (
              <Product key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition ${p === pagination.page ? 'bg-purple-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;