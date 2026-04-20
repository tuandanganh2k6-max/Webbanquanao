import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Management = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [data, setData] = useState({ 
    revenue: { totalRevenue: 0, dailyStats: [], monthlyStats: [] }, 
    products: [], 
    users: [], 
    ads: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const [adForm, setAdForm] = useState({ brandName: '', duration: '1 Tháng', fee: 0, image: '', url: '' });
  const [productForm, setProductForm] = useState({ name: '', price: 0, description: '', image: '', category: '', brand: '', countInStock: 0 });
  const [showProductModal, setShowProductModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerForm, setManagerForm] = useState({ name: '', email: '', password: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/staff/login');
      return;
    }
    setUserInfo(user);
    fetchAllData(user);
  }, [navigate]);

  const fetchAllData = async (user) => {
    setLoading(true);
    setError('');
    const headers = { Authorization: `Bearer ${user.token}` };
    try {
      // Fetch public + revenue data concurrently
      const [revRes, prodRes] = await Promise.all([
        fetch('/api/orders/revenue', { headers }).catch(() => null),
        fetch('/api/products').catch(() => null)
      ]);

      if (prodRes?.ok) {
        const prodData = await prodRes.json();
        setData(prev => ({ ...prev, products: Array.isArray(prodData) ? prodData : [] }));
      }
      if (revRes?.ok) {
        const revData = await revRes.json();
        setData(prev => ({ ...prev, revenue: revData }));
      }

      // Admin-only: fetch users and ads
      if (user.role === 'admin') {
        const [uRes, aRes] = await Promise.all([
          fetch('/api/users', { headers }).catch(() => null),
          fetch('/api/ads', { headers }).catch(() => null),
          fetch('/api/orders', { headers }).catch(() => null)
        ]);
        if (uRes?.ok) {
          const uData = await uRes.json();
          setData(prev => ({ ...prev, users: Array.isArray(uData) ? uData : [] }));
        }
        if (aRes?.ok) {
          const aData = await aRes.json();
          setData(prev => ({ ...prev, ads: Array.isArray(aData) ? aData : [] }));
        }
        if (oRes?.ok) {
          const oData = await oRes.json();
          setData(prev => ({ ...prev, orders: Array.isArray(oData) ? oData : [] }));
        }
      }
    } catch (err) {
      console.error('fetchAllData error:', err);
      setError('Lỗi đồng bộ dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.role === 'admin') {
      // Admin data is already loaded inside fetchAllData
    }
  }, [userInfo]);

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(adForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Lỗi đăng ký');
      setData(prev => ({ ...prev, ads: [...prev.ads, resData] }));
      setAdForm({ brandName: '', duration: '1 Tháng', fee: 0, image: '', url: '' });
      alert('Ký kết thành công!');
    } catch (err) { alert(err.message); }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ quảng cáo này?')) return;
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        setData(prev => ({ ...prev, ads: prev.ads.filter(a => a._id !== id) }));
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi xóa quảng cáo');
      }
    } catch (err) { alert('Lỗi kết nối'); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(productForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Lỗi thêm sp');
      setData(prev => ({ ...prev, products: [...prev.products, resData] }));
      setShowProductModal(false);
      setProductForm({ name: '', price: 0, description: '', image: '', category: '', brand: '', countInStock: 0 });
      alert('Thêm sản phẩm thành công!');
    } catch (err) { alert(err.message); }
  };

  const deleteProduct = async (id) => {
    setConfirmDelete(null); // close confirm bar
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        // Success: remove from UI immediately
        setData(prev => ({ ...prev, products: prev.products.filter(p => p._id !== id) }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('Lỗi xóa sản phẩm: ' + (errData.message || res.status));
      }
    } catch (err) { 
      console.error('Delete Error:', err);
      alert('Lỗi kết nối: ' + err.message); 
    }
  };

  const updateStock = async (id, newStock) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ countInStock: newStock })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật');
      setData(prev => ({ ...prev, products: prev.products.map(p => p._id === id ? { ...p, countInStock: newStock } : p) }));
    } catch (err) { alert(err.message); }
  };

  const deleteUser = async (id) => {
    setConfirmDeleteUser(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, users: prev.users.filter(u => u._id !== id) }));
        alert(resData.message);
      } else {
        alert('Lỗi: ' + resData.message);
      }
    } catch (err) { alert('Lỗi kết nối'); }
  };

  const createManager = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(managerForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Tạo thất bại');
      setData(prev => ({ ...prev, users: [resData, ...prev.users] }));
      setShowManagerModal(false);
      setManagerForm({ name: '', email: '', password: '' });
      alert(`Đã tạo tài khoản Manager cho "${resData.name}" thành công!`);
    } catch (err) { alert(err.message); }
  };

  const handleDeliver = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (!res.ok) throw new Error('Lỗi cập nhật giao hàng');
      setData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o._id === id ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() } : o)
      }));
      alert('Đã cập nhật trạng thái đơn hàng thành công!');
    } catch (err) { alert(err.message); }
  };

  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const lastActiveDate = new Date(lastActive);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActiveDate > fiveMinutesAgo;
  };

  const isAdmin = userInfo?.role === 'admin';

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 italic">SYNCING DATABASE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Management <span className="text-blue-600">Hub</span></h1>
            <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Active Staff: <span className="text-slate-800">{userInfo?.name}</span> | Role: <span className="text-blue-600">{userInfo?.role}</span></p>
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('revenue')} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Doanh Thu</button>
            <button onClick={() => setActiveTab('products')} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Kho Hàng</button>
            <button onClick={() => setActiveTab('orders_list')} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'orders_list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Đơn Hàng</button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Thành Viên</button>
                <button onClick={() => setActiveTab('ads')} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'ads' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Quảng Cáo</button>
              </>
            )}
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold italic">Warning: {error}</div>}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-700">
               <h2 className="text-sm font-bold opacity-30 uppercase tracking-[0.4em] mb-2">Financial Index</h2>
               <p className="text-6xl font-black mb-4 tracking-tighter">{data.revenue?.totalRevenue?.toLocaleString('vi-VN')} <span className="text-2xl text-slate-600 font-mono">VND</span></p>
               <div className="flex gap-4">
                  <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span> Live Monitoring
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Daily Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest leading-loose">
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Volume</th>
                        <th className="pb-4 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(data.revenue?.dailyStats || []).map(s => (
                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-sm font-bold text-slate-700">{s._id}</td>
                          <td className="py-4 text-sm text-slate-400 font-medium">{s.count} transactions</td>
                          <td className="py-4 text-sm font-black text-blue-600 text-right">{s.total.toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Monthly Analytics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest leading-loose">
                        <th className="pb-4">Period</th>
                        <th className="pb-4">Growth</th>
                        <th className="pb-4 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(data.revenue?.monthlyStats || []).map(s => (
                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-sm font-bold text-slate-700">{s._id}</td>
                          <td className="py-4 text-sm text-slate-400 font-medium">{s.count} deals</td>
                          <td className="py-4 text-sm font-black text-indigo-600 text-right">{s.total.toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <h2 className="text-2xl font-black text-slate-800 uppercase italic">Inventory Controller</h2>
               {isAdmin && (
                 <button onClick={() => setShowProductModal(true)} className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all active:scale-95">
                   + ADD PRODUCT
                 </button>
               )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] leading-loose">
                    <th className="p-6">Entity</th>
                    <th className="p-6">Costing</th>
                    <th className="p-6">Availability</th>
                    <th className="p-6 text-center">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.products.map(p => (
                    <tr key={p._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 line-clamp-1">{p.name}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{p.category} • {p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-black text-slate-700">{p.price.toLocaleString('vi-VN')} đ</td>
                      <td className="p-6">
                         <div className="flex items-center gap-3">
                           <input 
                             type="number" 
                             disabled={!isAdmin}
                             value={p.countInStock} 
                             onChange={(e) => updateStock(p._id, parseInt(e.target.value))}
                             className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-center"
                           />
                           <div className={`w-2 h-2 rounded-full ${p.countInStock > 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                        {confirmDelete === p._id ? (
                          <div className="flex items-center gap-2 justify-center">
                            <button onClick={() => deleteProduct(p._id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all">
                              XÁC NHẬN XÓA
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-200 transition-all">
                              HỦY
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(p._id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders_list' && (
          <div className="space-y-6 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">Order Fulfillment</h2>
              <div className="flex gap-2">
                <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400">Total: {data.orders.length}</span>
                <span className="px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black uppercase text-amber-600">Pending: {data.orders.filter(o => !o.isDelivered).length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.orders.map(order => (
                <div 
                  key={order._id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:shadow-xl hover:border-blue-100 transition-all duration-500 cursor-pointer"
                >
                  <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-xs italic shrink-0 shadow-2xl">
                      ORD
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg tracking-tighter uppercase leading-none">#{order._id.slice(-6).toUpperCase()}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Customer: <span className="text-slate-900">{order.user?.name || 'Anonymous'}</span></p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      <p className="text-[8px] font-bold text-blue-600 mt-2">CLICK TO VIEW ITEMS →</p>
                    </div>
                  </div>

                  <div className="flex-grow w-full max-w-md">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Ship to Address</p>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-700 leading-tight">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                        <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-tight">Contact: {order.shippingAddress.phone}</p>
                     </div>
                  </div>

                  <div className="w-full lg:w-auto text-center lg:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Value</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{order.totalPrice.toLocaleString('vi-VN')} <span className="text-sm">đ</span></p>
                    <div className="flex items-center gap-2 mt-2 justify-center lg:justify-end">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.isPaid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                         {order.isPaid ? 'PAID' : 'UNPAID'}
                       </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    {!order.isDelivered ? (
                      <button 
                        onClick={() => handleDeliver(order._id)}
                        className="px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1 transition-all active:scale-95"
                      >
                        MARK AS DELIVERED
                      </button>
                    ) : (
                      <div className="px-6 py-3 bg-slate-50 text-slate-300 text-xs font-black rounded-2xl flex items-center gap-2 border border-slate-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        COMPLETED
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {data.orders.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] italic text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No orders found in database history.
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {isAdmin && activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">Member Directory</h2>
                <p className="text-slate-400 text-sm mt-1">{data.users.length} tài khoản trong hệ thống</p>
              </div>
              <button
                onClick={() => setShowManagerModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm"
              >
                + TẠO QUẢN LÝ VIÊN
              </button>
            </div>

            {/* Role legend */}
            <div className="flex gap-3">
              {['admin','manager','user'].map(role => (
                <span key={role} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  role === 'manager' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {role} ({data.users.filter(u => u.role === role).length})
                </span>
              ))}
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.users.map(u => (
                <div key={u._id} className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all hover:shadow-lg ${
                  u._id === userInfo?._id ? 'border-blue-200 ring-1 ring-blue-200' : 'border-slate-100'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-lg uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-600' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm truncate">{u.name}</h4>
                          {u._id === userInfo?._id && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-black">BẠN</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                            u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>{u.role}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${isOnline(u.lastActive) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          <span className={`text-[8px] font-black uppercase ${isOnline(u.lastActive) ? 'text-green-600' : 'text-slate-400'}`}>
                            {isOnline(u.lastActive) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete control — cannot delete self or other admins */}
                    {u._id !== userInfo?._id && u.role !== 'admin' && (
                      confirmDeleteUser === u._id ? (
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button onClick={() => deleteUser(u._id)} className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg hover:bg-red-700 transition-all">XÓA</button>
                          <button onClick={() => setConfirmDeleteUser(null)} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-lg hover:bg-slate-200 transition-all">HỦY</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteUser(u._id)} className="flex-shrink-0 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-[9px] text-slate-300 mt-3 font-mono">Gia nhập: {new Date(u.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {isAdmin && activeTab === 'ads' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right duration-500">
             <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[3rem] border border-slate-800">
                <form onSubmit={handleAdSubmit} className="space-y-6">
                   <h3 className="text-white font-black uppercase italic tracking-widest text-sm mb-4">New Contract</h3>
                   <input required type="text" value={adForm.brandName} onChange={(e) => setAdForm({...adForm, brandName: e.target.value})} placeholder="Brand Identity" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-700" />
                   <input required type="text" value={adForm.image} onChange={(e) => setAdForm({...adForm, image: e.target.value})} placeholder="Banner Image URL (HTTP/HTTPS)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-blue-400 placeholder-slate-700 underline" title="Paste the URL of the advertisement image here." />
                   <input type="text" value={adForm.url} onChange={(e) => setAdForm({...adForm, url: e.target.value})} placeholder="Target Link (Optional)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-700" />
                   <select value={adForm.duration} onChange={(e) => setAdForm({...adForm, duration: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                      <option value="1 Tháng">1 Month Standard</option>
                      <option value="3 Tháng">3 Months Professional</option>
                      <option value="6 Tháng">6 Months Exclusive</option>
                   </select>
                   <input required type="number" value={adForm.fee} onChange={(e) => setAdForm({...adForm, fee: Number(e.target.value)})} placeholder="Budget (VND)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                   <button className="w-full bg-blue-600 py-4 rounded-2xl text-white font-black shadow-lg">INITIALIZE</button>
                </form>
             </div>
             <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="pb-4">Partner</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.ads.map(ad => (
                      <tr key={ad._id} className="text-sm group">
                        <td className="py-4 font-black">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              <img src={ad.image} alt={ad.brandName} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <span>{ad.brandName}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-400">{ad.duration}</td>
                        <td className="py-4 text-right">
                          <p className="font-black text-blue-600">{ad.fee.toLocaleString()} đ</p>
                          <button onClick={() => deleteAd(ad._id)} className="text-[10px] font-black text-red-500 uppercase hover:underline">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}
      </div>

      {/* MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-3xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Manifest New Entity</h3>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identity Name</label>
                   <input required type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
                 </div>
                 <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Unit Cost (VND)</label>
                   <input required type="number" value={productForm.price || ''} onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
                 </div>
                 <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category Tag</label>
                   <input required type="text" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
                 </div>
                 <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Brand License</label>
                   <input required type="text" value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visual URL (HTTP/HTTPS)</label>
                   <input required type="text" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-medium text-blue-500 underline" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detailed Specification</label>
                   <textarea required rows="4" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-medium resize-none shadow-inner" />
                 </div>
                 <button className="md:col-span-2 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-600 transition-all uppercase tracking-[0.4em]">Confirm Listing</button>
              </form>
           </div>
        </div>
      )}

      {/* CREATE MANAGER MODAL */}
      {showManagerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowManagerModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Tạo Tài Khoản Manager</h3>
              <p className="text-slate-400 text-sm mt-1">Manager có quyền xem doanh thu và quản lý kho hàng.</p>
            </div>

            <form onSubmit={createManager} className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5">Họ và tên</label>
                <input
                  required
                  type="text"
                  value={managerForm.name}
                  onChange={(e) => setManagerForm({...managerForm, name: e.target.value})}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5">Email đăng nhập</label>
                <input
                  required
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({...managerForm, email: e.target.value})}
                  placeholder="manager@tshop.vn"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5">Mật khẩu</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({...managerForm, password: e.target.value})}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowManagerModal(false)} className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">Hủy</button>
                <button type="submit" className="py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 sm:p-14 shadow-2xl relative animate-in zoom-in duration-300 my-8">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedOrder(null); }} 
              className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-slate-50 pb-8">
              <div>
                <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Order Identity Card</span>
                <h2 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900">
                  ORD #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                   <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-[10px]">
                     {selectedOrder.user?.name?.[0] || 'A'}
                   </div>
                   <div>
                     <p className="text-xs font-black text-slate-800 leading-none">{selectedOrder.user?.name || 'Anonymous'}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{selectedOrder.user?.email || 'No email'}</p>
                   </div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status Report</p>
                <div className="flex gap-2 justify-start md:justify-end">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     selectedOrder.isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                   }`}>
                     {selectedOrder.isPaid ? 'PAID' : 'PENDING'}
                   </span>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     selectedOrder.isDelivered ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                   }`}>
                     {selectedOrder.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                   </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-3">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Product Manifest */}
              <div className="lg:col-span-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-blue-600"></span> Product Manifest
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 group hover:bg-white hover:border-slate-100 hover:shadow-lg transition-all duration-300">
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden shadow-sm border border-white">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{item.name}</h4>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-xs font-black text-slate-400 italic">QTY: <span className="text-blue-600">{item.qty}</span> x {item.price.toLocaleString('vi-VN')} đ</p>
                          <p className="text-lg font-black text-slate-900 tracking-tighter">{(item.qty * item.price).toLocaleString('vi-VN')} <span className="text-xs">đ</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment Data */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                   </div>
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Final Valuation</h4>
                   <p className="text-4xl font-black tracking-tighter">{selectedOrder.totalPrice.toLocaleString('vi-VN')} <span className="text-sm">VND</span></p>
                   <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Operation Status</p>
                      {!selectedOrder.isDelivered ? (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleDeliver(selectedOrder._id); setSelectedOrder(null); }}
                           className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 text-xs uppercase"
                         >
                           EXECUTE DELIVERY
                         </button>
                      ) : (
                         <div className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl text-center text-xs uppercase italic">
                           Fulfilled Task
                         </div>
                      )}
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Logistic Destination</h4>
                   <div className="space-y-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-black text-slate-800 leading-tight">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">{selectedOrder.shippingAddress.city}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Contact Protocol</p>
                        <p className="text-sm font-black text-blue-600">{selectedOrder.shippingAddress.phone}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
