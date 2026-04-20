import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import SideAds from './components/SideAds';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffLogin from './pages/StaffLogin';
import Management from './pages/Management';
import Orders from './pages/Orders';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
          <SideAds />
          <Navbar />
          <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/management" element={<Management />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm mt-auto">
            &copy; {new Date().getFullYear()} Webbanquanao. All rights reserved.
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
