// src/pages/Home.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import Product from '../components/Product';
import Loader from '../components/common/Loader';
import { FiArrowRight, FiZap, FiTrendingUp, FiStar, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';

const Home = () => {
  const { featuredProducts, trendingProducts, categories, fetchFeatured, fetchTrending, fetchCategories } = useProducts();

  useEffect(() => {
    fetchFeatured();
    fetchTrending();
    fetchCategories();
  }, [fetchFeatured, fetchTrending, fetchCategories]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-purple-200 text-sm font-medium mb-6">
              <FiZap className="w-4 h-4" />
              <span>New Collection 2025</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Vibe In.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Style Out.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Fashion curated for your body type, occasion, and personal style.
              Take our VibeCheck quiz to discover outfits that are truly you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/vibecheck"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-xl shadow-purple-500/30 flex items-center gap-2"
              >
                <FiZap className="w-5 h-5" /> Take the VibeCheck
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition flex items-center gap-2"
              >
                Shop All <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path d="M0,60 C360,120 720,0 1440,60 L1440,100 L0,100 Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-50 py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: FiTruck, title: 'Free Shipping', desc: 'Orders above ₹999' },
              { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: FiShield, title: 'Secure Payment', desc: 'SSL protected' },
              { icon: FiStar, title: 'Top Quality', desc: 'Curated fashion' }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <badge.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
              <p className="text-gray-500">Find your perfect style</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.map(cat => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 aspect-square flex items-end p-6 hover:shadow-xl transition"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="relative">
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-gray-300 text-sm">{cat.productCount} items</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <FiArrowRight className="w-6 h-6 text-white" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  <FiStar className="inline w-7 h-7 mr-2 text-yellow-500" />
                  Featured Picks
                </h2>
                <p className="text-gray-500">Hand-picked styles just for you</p>
              </div>
              <Link to="/products?featured=true" className="hidden sm:flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-800 transition">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/products?featured=true" className="text-purple-600 font-semibold">View All Featured Products →</Link>
            </div>
          </div>
        </section>
      )}

      {/* VibeCheck Promo */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -left-10 w-60 h-60 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Not Sure What to Wear?</h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Take our VibeCheck quiz — tell us your body type, occasion, and style preferences,
            and we'll curate the perfect outfits for you.
          </p>
          <Link
            to="/vibecheck"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-xl"
          >
            <FiZap className="w-5 h-5" /> Start VibeCheck Quiz
          </Link>
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  <FiTrendingUp className="inline w-7 h-7 mr-2 text-orange-500" />
                  Trending Now
                </h2>
                <p className="text-gray-500">What everyone's loving right now</p>
              </div>
              <Link to="/products?trending=true" className="hidden sm:flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-800 transition">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.slice(0, 8).map(product => (
                <Product key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Stay in the Vibe</h2>
          <p className="text-gray-500 mb-6">Subscribe for exclusive drops, style tips, and special offers.</p>
          <form className="flex gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition shadow-md whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;