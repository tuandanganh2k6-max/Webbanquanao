import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({ address: '', city: '', phone: '' });
  const [success, setSuccess] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 20h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Yêu cầu đăng nhập</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Bạn cần đăng nhập để tiếp tục quá trình thanh toán và bảo mật thông tin đơn hàng.</p>
          <div className="space-y-3">
            <Link to="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg">Đăng nhập</Link>
            <Link to="/register" className="block w-full py-4 bg-white text-slate-900 font-bold border-2 border-slate-900 rounded-2xl hover:bg-slate-50 transition-all">Đăng ký tài khoản mới</Link>
          </div>
          <Link to="/cart" className="inline-block mt-6 text-sm font-medium text-slate-400 hover:text-slate-600">Quay lại giỏ hàng</Link>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          orderItems: cartItems.map(item => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            product: item._id
          })),
          shippingAddress: shipping,
          itemsPrice: itemsPrice,
          totalPrice: itemsPrice, // Assuming no tax/shipping cost for now
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders'); // Redirect to orders history instead of home
        }, 3000);
      } else {
        setError(data.message || 'Lỗi khi đặt hàng');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Lỗi: Không thể thanh toán giỏ hàng trống!</h2>
        <Link to="/shop" className="text-blue-600 underline">Quay lại mua sắm</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Đặt hàng thành công!</h2>
          <p className="text-slate-600 mb-6">Cảm ơn bạn đã mua sắm tại T-Shop. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao.</p>
          <p className="text-sm text-slate-400">Tự động chuyển về trang chủ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Thanh Toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shipping Form */}
          <div className="w-full lg:w-2/3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Thông Tin Giao Hàng</h2>
            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ Giao Hàng</label>
                <input required type="text" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Số nhà, Tên Đường..." />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Thành Phố</label>
                  <input required type="text" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Hà Nội / HCM..." />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input required type="tel" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="09xxxxxxxx" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 mb-4 mt-8">Phương Thức Thanh Toán</h2>
              <div className="p-4 border border-indigo-200 rounded-xl bg-indigo-50 flex items-center">
                <input type="radio" checked readOnly className="w-4 h-4 text-indigo-600" />
                <span className="ml-3 font-semibold text-indigo-900">Thanh toán khi nhận hàng (COD)</span>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-8 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 active:scale-95'}`}
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? 'ĐANG XỬ LÝ...' : `Xác Nhận Đặt Hàng (${itemsPrice.toLocaleString('vi-VN')} đ)`}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Đơn Hàng Của Bạn</h2>
              <div className="space-y-4 mb-6 border-b pb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-500">Màu: {item.color} | Size: {item.size}</p>
                      <p className="text-sm font-semibold text-indigo-600">{item.qty} x {item.price.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Tạm tính</span>
                <span className="font-semibold">{itemsPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600">Phí giao hàng</span>
                <span className="font-semibold text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-xl font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-black text-blue-600">{itemsPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
