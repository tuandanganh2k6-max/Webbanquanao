import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageFallback, handleProductImageError } from '../utils/productImageFallback';
import { getAvailableSizes } from '../utils/productOptions';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartQty, updateCartSize } = useCart();
  const navigate = useNavigate();

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const checkoutHandler = () => {
    navigate('/checkout');
  };

  const changeQty = (item, nextQty) => {
    const maxQty = item.countInStock > 0 ? item.countInStock : Infinity;
    const safeQty = Math.min(Math.max(1, nextQty), maxQty);
    updateCartQty(item.cartId, safeQty);
  };

  const changeSize = (item, nextSize) => {
    if (nextSize === item.size) return;
    updateCartSize(item.cartId, nextSize);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-500 mb-8 max-w-md">Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy lướt xem các sản phẩm tuyệt vời của chúng tôi nhé.</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <li key={item.cartId} className="p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-slate-50 transition-colors">
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={item.image || getProductImageFallback(item.name)}
                          alt={item.name}
                          onError={(event) => handleProductImageError(event, item.name)}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full text-center sm:text-left">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          <Link to={`/product/${item._id}`} className="hover:text-blue-600 transition-colors">{item.name}</Link>
                        </h3>

                        <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-500">
                          <span>
                            Phân loại: <span className="font-semibold text-slate-700">{item.color}</span>
                          </span>
                          <label className="flex items-center gap-2 justify-center sm:justify-start">
                            <span>Kích cỡ:</span>
                            <select
                              value={item.size}
                              onChange={(e) => changeSize(item, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {getAvailableSizes(item).map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <p className="text-lg font-black text-blue-600">{item.price.toLocaleString('vi-VN')} đ</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                          <button
                            onClick={() => changeQty(item, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-10 h-10 text-slate-600 font-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Giảm số lượng"
                          >
                            -
                          </button>
                          <div className="w-12 text-center text-slate-800 font-bold">{item.qty}</div>
                          <button
                            onClick={() => changeQty(item, item.qty + 1)}
                            disabled={item.countInStock > 0 && item.qty >= item.countInStock}
                            className="w-10 h-10 text-slate-600 font-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Xóa sản phẩm"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {item.countInStock > 0 && (
                        <div className="w-full sm:w-auto text-xs text-slate-400 font-semibold text-center sm:text-right">
                          Tồn kho: {item.countInStock}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Tóm Tắt Đơn Hàng</h2>
                <div className="flow-root">
                  <dl className="-my-4 text-sm divide-y divide-slate-100">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-slate-600">Tổng sản phẩm</dt>
                      <dd className="font-medium text-slate-900">{cartItems.reduce((a, c) => a + c.qty, 0)} món</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-slate-600">Phí giao hàng</dt>
                      <dd className="font-medium text-green-600">Miễn phí</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base font-bold text-slate-900">Tổng cộng ước tính</dt>
                      <dd className="text-2xl font-black text-blue-600">{itemsPrice.toLocaleString('vi-VN')} đ</dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-8">
                  <button onClick={checkoutHandler} className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all transform hover:-translate-y-0.5">
                    Tiến Hành Thanh Toán
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <Link to="/shop" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    Hoặc tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
