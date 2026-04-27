import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import { getProductImageFallback, handleProductImageError } from '../utils/productImageFallback';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        setProducts(data.slice(0, 4)); // Get top 4 for featured
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-black mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-block py-1 px-3 mb-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 tracking-wider text-xs font-semibold uppercase backdrop-blur-sm">
            Bộ Sưu Tập Mới 2026
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 drop-shadow-md">
            Trải nghiệm phong cách <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">hiện đại.</span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-slate-300 mb-10 font-light drop-shadow">
            Khám phá những xu hướng thời trang mới nhất. Thiết kế tinh tế, chất lượng hoàn hảo. Tự tin thể hiện cá tính của bạn mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:bg-slate-50 hover:scale-105 transition-all duration-300">
              Mua Sắm Ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Sản Phẩm Mới Nhất</h2>
              <p className="text-slate-500">Được cập nhật liên tục từ cửa hàng.</p>
            </div>
            <Link to="/shop" className="hidden sm:block text-blue-600 font-medium hover:text-blue-800 group border-b border-transparent hover:border-blue-600 transition-all">
              Xem tất cả <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product._id} className="group flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <Link to={`/product/${product._id}`} className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={product.image || getProductImageFallback(product.name)}
                      alt={product.name}
                      onError={(event) => handleProductImageError(event, product.name)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.countInStock === 0 && (
                       <div className="absolute top-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full">Hết hàng</div>
                    )}
                  </Link>
                  <div className="p-6">
                    <span className="text-[10px] font-black text-indigo-500 mb-1 block uppercase tracking-widest">{product.category}</span>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-slate-900">{product.price.toLocaleString('vi-VN')} đ</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
