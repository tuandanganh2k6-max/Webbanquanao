import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
        } else {
          setError(data.message || 'Lỗi khi tải danh sách đơn hàng');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold italic animate-pulse">ĐANG TẢI LỊCH SỬ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-slate-900">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Lịch sử <span className="text-blue-600">Giao dịch</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi các đơn hàng bạn đã thực hiện tại T-Shop.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Bạn chưa có đơn hàng nào</h3>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">Hãy khám phá bộ sưu tập mới nhất của chúng tôi và bắt đầu mua sắm ngay hôm nay.</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-500 group cursor-pointer"
              >
                <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Đơn hàng #{order._id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <div className="flex -space-x-3 overflow-hidden mb-4">
                      {order.orderItems.map((item, idx) => (
                        <img 
                          key={idx}
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-xl border-4 border-white object-cover shadow-sm bg-slate-50"
                        />
                      ))}
                      {order.orderItems.length > 4 && (
                        <div className="w-12 h-12 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 z-10 shadow-sm">
                          +{order.orderItems.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800 line-clamp-1">
                        {order.orderItems.map(i => i.name).join(', ')}
                      </p>
                      <span className="text-[10px] font-bold text-blue-600 whitespace-nowrap">Xem chi tiết →</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 md:text-right border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-widest">Tổng cộng</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">{order.totalPrice.toLocaleString('vi-VN')} <span className="text-sm">đ</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         order.isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {order.isPaid ? 'Đã trả' : 'Chờ trả'}
                       </span>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         order.isDelivered ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                       }`}>
                         {order.isDelivered ? 'Thành công' : 'Đang xử lý'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 sm:p-12 shadow-2xl relative animate-in zoom-in duration-300 my-8">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div className="mb-10">
                <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Order Specification</span>
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">Đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <p className="text-slate-400 text-sm mt-1">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>

              <div className="space-y-8">
                {/* Items List */}
                <div className="bg-slate-50 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Chi tiết mặt hàng</h3>
                  <div className="space-y-6">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 sm:gap-6">
                        <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shadow-sm border border-white" />
                        <div className="flex-grow flex flex-col justify-center">
                          <h4 className="font-black text-slate-800 text-sm sm:text-base leading-tight mb-1">{item.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 italic">{item.category}</p>
                          <div className="flex justify-between items-end">
                            <p className="text-sm font-bold text-slate-500">{item.qty} x {item.price.toLocaleString('vi-VN')} đ</p>
                            <p className="text-lg font-black text-blue-600">{(item.qty * item.price).toLocaleString('vi-VN')} đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Địa chỉ giao hàng</h4>
                    <p className="font-black text-slate-800 text-sm mb-1">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-sm text-slate-500 font-bold uppercase">{selectedOrder.shippingAddress.city}</p>
                    <p className="text-sm text-slate-500 font-bold mt-3">SĐT: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Thanh toán</h4>
                      <p className="text-sm font-bold text-slate-700 uppercase">{selectedOrder.paymentMethod || 'COD'}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 mt-4">
                       <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Tổng tiền</p>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter">
                          {selectedOrder.totalPrice.toLocaleString('vi-VN')} <span className="text-sm">đ</span>
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
