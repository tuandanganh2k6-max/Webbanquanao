import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('userInfo');
    if (data) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/');
    window.location.reload();
  };

  const isStaff = userInfo && (userInfo.role === 'admin' || userInfo.role === 'manager');

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all">
              T-Shop.
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex space-x-8">
            <Link to="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-tight">Trang chủ</Link>
            <Link to="/shop" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-tight">Sản phẩm</Link>
            {isStaff && (
              <Link to="/management" className="text-sm font-black text-rose-600 hover:text-rose-500 transition-colors uppercase tracking-tight flex items-center gap-1">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                Quản lý
              </Link>
            )}
            {userInfo && (
              <Link to="/orders" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-tight">Lịch sử</Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {userInfo ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <span className="hidden sm:block text-sm font-bold text-slate-700 truncate max-w-[120px]">
                  {userInfo.name}
                </span>
                <button 
                  onClick={logoutHandler}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-black text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all uppercase tracking-tighter"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 shadow-md transition-all active:scale-95">
                Đăng nhập
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
