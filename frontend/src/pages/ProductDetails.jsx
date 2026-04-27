import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { getProductImageFallback, handleProductImageError } from '../utils/productImageFallback';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          setSelectedColor(data.colors?.[0] || 'Mặc định');
          setSelectedSize(data.sizes?.[0] || 'FreeSize');
        } else {
          setError(data.message || 'Sản phẩm không tồn tại');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold italic animate-pulse">ĐANG TẢI CHI TIẾT SẢN PHẨM...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-2xl font-black text-slate-800 mb-4">{error || 'Sản phẩm không tồn tại'}</h2>
        <Link to="/shop" className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
          QUAY LẠI CỬA HÀNG
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-blue-600 mb-8 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          BACK TO SHOP
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12 bg-white rounded-[3rem] p-8 lg:p-12 shadow-sm border border-slate-100">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 relative group shadow-2xl">
              <img
                src={product.image || getProductImageFallback(product.name)}
                alt={product.name}
                onError={(event) => handleProductImageError(event, product.name)}
                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">{product.brand || 'T-SHOP EXCLUSIVE'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-none tracking-tighter">{product.name}</h1>
            <p className="text-4xl text-blue-600 font-black mb-8 tracking-tighter">{product.price.toLocaleString('vi-VN')} <span className="text-xl">đ</span></p>
            <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium">{product.description}</p>
            
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Chọn Màu sắc: {selectedColor}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                     <button key={color} onClick={() => setSelectedColor(color)} className={`px-6 py-2.5 rounded-full border-2 text-sm font-black transition-all ${selectedColor === color ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}>
                       {color}
                     </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Chọn Kích cỡ: {selectedSize}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                     <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all ${selectedSize === size ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}>
                       {size}
                     </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end space-x-4 mb-10 pb-10 border-b border-slate-50">
              {product.countInStock > 0 ? (
                <>
                  <div className="flex-shrink-0">
                    <span className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Số lượng</span>
                    <select 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="block w-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 font-black outline-none transition-all cursor-pointer"
                    >
                      {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className={`flex-1 flex justify-center items-center h-[60px] rounded-2xl shadow-xl text-lg font-black text-white transition-all transform active:scale-95 ${added ? 'bg-green-600 shadow-green-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:-translate-y-1'}`}
                  >
                    {added ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        ĐÃ THÊM!
                      </span>
                    ) : 'THÊM VÀO GIỎ HÀNG'}
                  </button>
                </>
              ) : (
                <div className="flex-1 h-[60px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl font-black text-lg uppercase tracking-widest">
                  Hết hàng tạm thời
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tình trạng</p>
                <p className={`text-sm font-black uppercase ${product.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.countInStock > 0 ? `Còn hàng (${product.countInStock})` : 'Hết hàng'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Loại sản phẩm</p>
                <p className="text-sm font-black text-slate-800 uppercase">{product.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
