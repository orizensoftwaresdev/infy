// src/components/Product.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';

const Product = ({ product }) => {
  const imageUrl = product.images?.[0]?.url || '/images/placeholder.png';
  const price = product.price;
  const offerPrice = product.offerPrice;
  const discount = offerPrice ? Math.round(((price - offerPrice) / price) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] bg-gray-100">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase rounded-md">Featured</span>
          )}
          {product.isTrending && (
            <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase rounded-md">Trending</span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md">-{discount}%</span>
          )}
        </div>

        {/* Quick action */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
          <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-purple-50 transition" aria-label="Add to wishlist">
            <FiHeart className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Hover overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs font-medium">View Details →</span>
        </div>
      </Link>

      <div className="p-3.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">{product.brand}</p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-tight">
          {product.title}
        </h3>

        {/* Rating */}
        {product.ratings > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-xs">
              <FiStar className="w-3 h-3 text-green-600 fill-green-600" />
              <span className="font-semibold text-green-700">{product.ratings.toFixed(1)}</span>
            </div>
            {product.numReviews > 0 && (
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{(offerPrice || price).toLocaleString('en-IN')}
          </span>
          {offerPrice && (
            <span className="text-sm text-gray-400 line-through">₹{price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.slice(0, 5).map(size => (
              <span key={size} className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] text-gray-500">
                {size}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="px-1.5 py-0.5 text-[10px] text-gray-400">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;