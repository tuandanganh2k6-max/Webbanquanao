import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const PRICE_RANGES = [
  { label: 'Dưới 200.000đ', min: 0, max: 200000 },
  { label: '200.000 – 500.000đ', min: 200000, max: 500000 },
  { label: '500.000 – 1.000.000đ', min: 500000, max: 1000000 },
  { label: 'Trên 1.000.000đ', min: 1000000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp → cao', value: 'price_asc' },
  { label: 'Giá cao → thấp', value: 'price_desc' },
  { label: 'A → Z', value: 'name_asc' },
];

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Extract unique categories from real product data
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [allProducts]);

  // ===== FILTERING LOGIC =====
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p =>
        selectedCategories.some(cat =>
          p.category?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // 3. Price range filter
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }

    // 4. In stock filter
    if (inStockOnly) {
      result = result.filter(p => p.countInStock > 0);
    }

    // 5. Sort
    switch (sortBy) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc':   result.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break;
      case 'newest':
      default:           result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategories, selectedPriceRange, inStockOnly, sortBy]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('newest');
  };

  const activeFilterCount =
    selectedCategories.length +
    (selectedPriceRange !== null ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="mb-10 p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl overflow-hidden relative border border-slate-800">
          <div className="relative z-10">
            <span className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2 block">Duyệt theo bộ sưu tập</span>
            <h1 className="text-5xl font-black mb-4 tracking-tighter">Cửa Hàng Trực Tuyến</h1>
            <p className="text-slate-400 max-w-lg font-medium">Khám phá toàn bộ sản phẩm mới nhất được cập nhật trực tiếp từ kho hàng của T-Shop.</p>
          </div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

          {/* Search bar inside banner */}
          <div className="relative mt-8 max-w-lg">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, danh mục, thương hiệu..."
              className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-all"
            />
          </div>
        </div>

        {/* Filters and List */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filter */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                  Bộ Lọc
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[9px] rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="space-y-8">

                {/* Category Filter */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">
                    Danh mục ({categories.length})
                  </label>
                  <div className="space-y-2">
                    {loading ? (
                      [1,2,3].map(i => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" />)
                    ) : categories.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Chưa có danh mục</p>
                    ) : (
                      categories.map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group py-1">
                          <div
                            onClick={() => toggleCategory(cat)}
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                              selectedCategories.includes(cat)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-slate-200 group-hover:border-blue-400'
                            }`}
                          >
                            {selectedCategories.includes(cat) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </div>
                          <span
                            onClick={() => toggleCategory(cat)}
                            className={`text-sm font-bold transition-colors cursor-pointer ${
                              selectedCategories.includes(cat) ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                            }`}
                          >
                            {cat}
                          </span>
                          <span className="ml-auto text-[9px] text-slate-300 font-bold">
                            {allProducts.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Khoảng giá</label>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                        className={`w-full text-left px-4 py-2.5 rounded-[1rem] text-sm font-bold transition-all ${
                          selectedPriceRange === idx
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock Filter */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Tình trạng</label>
                  <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-bold transition-all ${
                      inStockOnly
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${inStockOnly ? 'bg-white border-white' : 'border-slate-300'}`}></div>
                    Chỉ còn hàng
                    <span className="ml-auto text-[9px]">
                      {allProducts.filter(p => p.countInStock > 0).length} sp
                    </span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">

            {/* Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500">
                Hiển thị <span className="text-slate-900 font-black text-base">{filteredProducts.length}</span>
                <span className="text-slate-400"> / {allProducts.length} sản phẩm</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map(cat => (
                  <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="hover:text-blue-900">✕</button>
                  </span>
                ))}
                {selectedPriceRange !== null && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black">
                    {PRICE_RANGES[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(null)} className="hover:text-indigo-900">✕</button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black">
                    Còn hàng
                    <button onClick={() => setInStockOnly(false)} className="hover:text-green-900">✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-xs font-black">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-slate-900">✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[420px] bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center gap-4">
                <div className="text-6xl">🔍</div>
                <p className="font-black text-slate-700 text-xl">Không tìm thấy sản phẩm nào</p>
                <p className="text-slate-400 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button onClick={clearAllFilters} className="mt-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-sm">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col group">
                    <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {product.countInStock === 0 && (
                        <div className="absolute top-5 right-5 bg-slate-900/90 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full backdrop-blur-md">
                          Hết hàng
                        </div>
                      )}
                    </Link>
                    <div className="p-7 flex flex-col flex-grow">
                      <span className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-widest leading-none">{product.category}</span>
                      <Link to={`/product/${product._id}`} className="text-lg font-black text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 block mb-4 leading-tight">
                        {product.name}
                      </Link>
                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Giá bán lẻ</p>
                          <span className="text-2xl font-black text-slate-900 tracking-tighter">
                            {product.price.toLocaleString('vi-VN')} <span className="text-sm">đ</span>
                          </span>
                        </div>
                        <Link to={`/product/${product._id}`} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Shop;
