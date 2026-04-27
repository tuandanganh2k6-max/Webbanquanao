import { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';

const SideAds = () => {
  const [ads, setAds] = useState([]);
  const [closedLeft, setClosedLeft] = useState(false);
  const [closedRight, setClosedRight] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ads`);
        const data = await res.json();
        if (res.ok) {
          setAds(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      }
    };
    fetchAds();
  }, []);

  const formatUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const AdBlock = ({ ad, side, onClose }) => {
    if (!ad) {
      return (
        <div className="w-[160px] h-[600px] bg-slate-900 rounded-[2rem] border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/5 hover:bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5"
            title="Tắt quảng cáo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            </div>
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-4">Quảng cáo<br/>tại đây</h4>
            <div className="w-8 h-1 bg-indigo-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase leading-relaxed mb-8">Nâng tầm thương hiệu của bạn với T-Shop</p>
            <p className="text-indigo-400 text-xs font-black tracking-widest bg-white/5 py-3 px-4 rounded-xl border border-white/5">0912.XXX.XXX</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative group">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-black/20 hover:bg-black/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all shadow-xl border border-white/10"
          title="Tắt quảng cáo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <a 
          href={formatUrl(ad.url)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-[160px] h-[600px] bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-500"
        >
          <div className="h-full relative flex flex-col">
            <img src={ad.image} alt={ad.brandName} className="flex-grow w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Sponsored</span>
              <h4 className="text-white text-base font-black truncate">{ad.brandName}</h4>
            </div>
          </div>
        </a>
      </div>
    );
  };

  return (
    <>
      {/* Left Ad */}
      {!closedLeft && (
        <div className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-40 animate-in slide-in-from-left duration-700">
          <AdBlock ad={ads[0]} side="left" onClose={() => setClosedLeft(true)} />
        </div>
      )}

      {/* Right Ad */}
      {!closedRight && (
        <div className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-40 animate-in slide-in-from-right duration-700">
          <AdBlock ad={ads[1] || ads[0]} side="right" onClose={() => setClosedRight(true)} />
        </div>
      )}
    </>
  );
};

export default SideAds;
