// src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Product from '../components/Product';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import {
  FiHeart, FiShoppingCart, FiStar, FiTruck, FiRefreshCw, FiShield,
  FiMinus, FiPlus, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import api from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const { fetchProductById, loading } = useProducts();
  const { addToCart } = useCartContext();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data.product);
        setReviews(data.reviews || []);
        setRelatedProducts(data.relatedProducts || []);
        if (data.product.sizes?.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
      }
    };
    loadProduct();
    window.scrollTo(0, 0);
  }, [id, fetchProductById]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.warn('Please select a size');
      return;
    }
    addToCart({
      ...product,
      id: product._id,
      image_front: product.images?.[0]?.url || '',
      price: product.offerPrice || product.price

    }, selectedSize, quantity);
    toast.success('Added to cart!');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      return;
    }
    try {
      const res = await api.post(`/auth/wishlist/${product._id}`);
      setIsWishlisted(!isWishlisted);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading || !product) return <Loader text="Loading product..." />;

  const displayPrice = product.offerPrice || product.price;
  const discount = product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-purple-600 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-purple-600 transition">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={product.images?.[selectedImageIndex]?.url || '/images/placeholder.png'}
              alt={product.images?.[selectedImageIndex]?.alt || product.title}
              className="w-full h-full object-cover"
            />
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(i => i === 0 ? product.images.length - 1 : i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(i => i === product.images.length - 1 ? 0 : i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition ${i === selectedImageIndex ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">{product.brand}</p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>

          {/* Rating */}
          {product.ratings > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                <FiStar className="w-4 h-4 text-green-600 fill-green-600" />
                <span className="text-sm font-semibold text-green-700">{product.ratings.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">{product.numReviews} reviews</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{displayPrice.toLocaleString('en-IN')}</span>
            {product.offerPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{discount}% off</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${selectedSize === size
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiPlus className="w-4 h-4" />
              </button>
              {product.stock <= 10 && product.stock > 0 && (
                <span className="text-sm text-orange-600 font-medium">Only {product.stock} left!</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <FiShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleWishlist}
              className={`p-3.5 border rounded-xl transition ${isWishlisted ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600'}`}
              aria-label="Add to wishlist"
            >
              <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: FiTruck, text: 'Free Shipping' },
              { icon: FiRefreshCw, text: 'Easy Returns' },
              { icon: FiShield, text: 'Secure Pay' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500 text-xs">
                <item.icon className="w-4 h-4 text-purple-500" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Product Meta */}
          <div className="space-y-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
            {product.sku && <p><span className="font-medium text-gray-700">SKU:</span> {product.sku}</p>}
            {product.category?.name && <p><span className="font-medium text-gray-700">Category:</span> {product.category.name}</p>}
            {product.bodyType?.length > 0 && (
              <p><span className="font-medium text-gray-700">Body Type:</span> {product.bodyType.join(', ')}</p>
            )}
            {product.occasion?.length > 0 && (
              <p><span className="font-medium text-gray-700">Occasion:</span> {product.occasion.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{review.user?.name}</span>
                      <div className="flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded text-xs">
                        <FiStar className="w-3 h-3 text-green-600 fill-green-600" />
                        <span className="font-semibold text-green-700">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <Product key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;