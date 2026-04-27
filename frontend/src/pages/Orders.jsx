import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [msgText, setMsgText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/myorders`, {
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

  const sendMessage = async (orderId) => {
    if (!msgText.trim()) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ text: msgText, sender: 'User' })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedOrder(data);
        setOrders(prev => prev.map(o => o._id === orderId ? data : o));
        setMsgText('');
      }
    } catch (err) { console.error(err); }
  };

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

                     <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Thành công' ? 'bg-green-100 text-green-600' :
                          order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {order.status || (order.isDelivered ? 'Thành công' : 'Đang xử lý')}
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
                 <h2 className="text-3xl font-black tracking-tighter italic uppercase text-slate-900">Đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                 
                 {/* Visual Tracking Bar */}
                 <div className="mt-8 mb-10">
                    <div className="relative flex justify-between">
                      {/* Line Background */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                      <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-1000 ${
                        selectedOrder.status === 'Đã xác nhận' ? 'w-1/3' :
                        selectedOrder.status === 'Đang giao hàng' ? 'w-2/3' :
                        selectedOrder.status === 'Thành công' ? 'w-full' :
                        selectedOrder.status === 'Đã hủy' ? 'w-0 bg-red-400' : 'w-0'
                      }`}></div>

                      {/* Steps */}
                      {['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Thành công'].map((step, i) => {
                        const statuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Thành công'];
                        const currentIdx = statuses.indexOf(selectedOrder.status || 'Chờ xác nhận');
                        const isCompleted = currentIdx >= i;
                        const isCurrent = currentIdx === i;

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 'bg-white border-4 border-slate-100 text-slate-200'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                              ) : (
                                <span className="text-[10px] font-bold">{i + 1}</span>
                              )}
                            </div>
                            <span className={`text-[8px] font-black uppercase mt-3 tracking-tighter ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                    {selectedOrder.status === 'Đã hủy' && (
                      <div className="mt-4 p-3 bg-red-50 text-red-600 text-[10px] font-black uppercase text-center rounded-xl border border-red-100">Đơn hàng này đã bị hủy</div>
                    )}
                 </div>
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

                {/* Chat Section */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative shadow-2xl overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Trao đổi với Shop
                  </h3>
                  
                  <div className="max-h-48 overflow-y-auto mb-6 space-y-4 pr-2 scrollbar-none">
                    {(selectedOrder.messages || []).map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.sender === 'User' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl text-xs font-bold max-w-[80%] ${
                          m.sender === 'User' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] opacity-30 mt-1 font-black uppercase">{m.sender === 'User' ? 'Bạn' : 'Shop'} • {new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {(selectedOrder.messages || []).length === 0 && (
                      <p className="text-[10px] text-slate-500 italic text-center py-4">Chưa có tin nhắn nào. Hãy gửi câu hỏi cho shop!</p>
                    )}
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedOrder._id)}
                      placeholder="Gửi tin nhắn hoặc ghi chú cho shop..."
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-6 pr-12 text-sm text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button 
                      onClick={() => sendMessage(selectedOrder._id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-10 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
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
