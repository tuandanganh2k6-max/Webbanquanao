import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { getProductImageFallback, handleProductImageError } from '../utils/productImageFallback';

const Checkout = () => {
  const { cartItems, selectedCartIds, clearSelectedCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({ address: '', city: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [cardInfo, setCardInfo] = useState({
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const selectedCartIdSet = new Set(selectedCartIds);
  const checkoutItems = cartItems.filter((item) => selectedCartIdSet.has(item.cartId));
  const itemsPrice = checkoutItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const addressStorageKey = userInfo?._id ? `savedAddresses:${userInfo._id}` : '';

  const readJsonResponse = async (res) => {
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const error = new Error('ADDRESS_API_UNAVAILABLE');
      error.code = 'ADDRESS_API_UNAVAILABLE';
      error.status = res.status;
      throw error;
    }

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || 'ADDRESS_API_ERROR');
      error.status = res.status;
      throw error;
    }

    return data;
  };

  const canUseLocalAddressFallback = (err) => {
    return err.code === 'ADDRESS_API_UNAVAILABLE' || err.status === 404 || err.message === 'ADDRESS_API_ERROR';
  };

  const normalizeSavedAddresses = (addresses) => {
    if (!Array.isArray(addresses)) return [];

    const cleanedAddresses = addresses
      .filter((item) => item?.address && item?.city && item?.phone)
      .map((item) => ({
        _id: item._id || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label: item.label || 'Địa chỉ giao hàng',
        address: item.address,
        city: item.city,
        phone: item.phone,
        isDefault: Boolean(item.isDefault),
      }));

    if (cleanedAddresses.length > 0 && !cleanedAddresses.some((item) => item.isDefault)) {
      cleanedAddresses[0].isDefault = true;
    }

    return cleanedAddresses;
  };

  const getLocalSavedAddresses = () => {
    if (!addressStorageKey) return [];

    try {
      return normalizeSavedAddresses(JSON.parse(localStorage.getItem(addressStorageKey)) || []);
    } catch (err) {
      return [];
    }
  };

  const setLocalSavedAddresses = (addresses) => {
    if (!addressStorageKey) return;
    localStorage.setItem(addressStorageKey, JSON.stringify(normalizeSavedAddresses(addresses)));
  };

  const setAddressList = (addresses) => {
    const nextAddresses = normalizeSavedAddresses(addresses);
    setSavedAddresses(nextAddresses);
    setLocalSavedAddresses(nextAddresses);
    return nextAddresses;
  };

  const saveAddressLocally = () => {
    const payload = getAddressPayload();
    let nextAddresses = getLocalSavedAddresses();

    if (editingAddressId) {
      nextAddresses = nextAddresses.map((item) => (
        item._id === editingAddressId ? { ...item, ...payload } : item
      ));
    } else {
      const newAddress = {
        _id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...payload,
      };
      nextAddresses = [...nextAddresses, newAddress];
    }

    if (payload.isDefault || nextAddresses.length === 1) {
      const activeId = editingAddressId || nextAddresses[nextAddresses.length - 1]._id;
      nextAddresses = nextAddresses.map((item) => ({
        ...item,
        isDefault: item._id === activeId,
      }));
    }

    const normalizedAddresses = setAddressList(nextAddresses);
    return editingAddressId
      ? normalizedAddresses.find((item) => item._id === editingAddressId)
      : normalizedAddresses[normalizedAddresses.length - 1];
  };

  const deleteAddressLocally = (addressId) => {
    const targetAddress = getLocalSavedAddresses().find((item) => item._id === addressId);
    const nextAddresses = getLocalSavedAddresses().filter((item) => item._id !== addressId);

    if (targetAddress?.isDefault && nextAddresses.length > 0) {
      nextAddresses[0].isDefault = true;
    }

    return setAddressList(nextAddresses);
  };

  const getAddressPayload = () => ({
    label: addressLabel,
    address: shipping.address,
    city: shipping.city,
    phone: shipping.phone,
    isDefault: addressIsDefault,
  });

  const applySavedAddress = (savedAddress) => {
    setSelectedAddressId(savedAddress._id);
    setShipping({
      address: savedAddress.address,
      city: savedAddress.city,
      phone: savedAddress.phone,
    });
  };

  useEffect(() => {
    if (!userInfo?.token) return;

    const fetchSavedAddresses = async () => {
      try {
        setAddressLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/users/addresses`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const data = await readJsonResponse(res);

        const addresses = setAddressList(data);
        setAddressIsDefault(addresses.length === 0);

        const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          setShipping((prev) => {
            if (prev.address || prev.city || prev.phone) return prev;

            return {
              address: defaultAddress.address,
              city: defaultAddress.city,
              phone: defaultAddress.phone,
            };
          });
        }
      } catch (err) {
        const localAddresses = setAddressList(getLocalSavedAddresses());
        setAddressIsDefault(localAddresses.length === 0);

        const defaultAddress = localAddresses.find((item) => item.isDefault) || localAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          setShipping((prev) => {
            if (prev.address || prev.city || prev.phone) return prev;

            return {
              address: defaultAddress.address,
              city: defaultAddress.city,
              phone: defaultAddress.phone,
            };
          });
        }

        if (!canUseLocalAddressFallback(err)) {
          setAddressMessage(err.message || 'Không thể tải địa chỉ đã lưu');
        }
      } finally {
        setAddressLoading(false);
      }
    };

    fetchSavedAddresses();
  }, [userInfo?.token]);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleCardFieldChange = (field, value) => {
    let nextValue = value;

    if (field === 'holderName') {
      nextValue = value.replace(/[0-9]/g, '').toUpperCase();
    }

    if (field === 'cardNumber') {
      nextValue = formatCardNumber(value);
    }

    if (field === 'expiry') {
      nextValue = formatExpiry(value);
    }

    if (field === 'cvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardInfo((prev) => ({ ...prev, [field]: nextValue }));
  };

  const isCardExpired = (expiry) => {
    const cleanExpiry = expiry.replace(/\D/g, '');
    if (cleanExpiry.length !== 4) return true;

    const month = Number(cleanExpiry.slice(0, 2));
    const year = Number(`20${cleanExpiry.slice(2)}`);

    if (month < 1 || month > 12) return true;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return year < currentYear || (year === currentYear && month < currentMonth);
  };

  const updateShippingField = (field, value) => {
    const nextValue = field === 'phone'
      ? value.replace(/\D/g, '').slice(0, 11)
      : value;

    setShipping((prev) => ({ ...prev, [field]: nextValue }));
    if (!editingAddressId) {
      setSelectedAddressId('');
    }
  };

  const resetAddressEditor = () => {
    setEditingAddressId('');
    setAddressLabel('');
    setAddressIsDefault(savedAddresses.length === 0);
    setAddressMessage('');
  };

  const editSavedAddress = (savedAddress) => {
    setEditingAddressId(savedAddress._id);
    setSelectedAddressId(savedAddress._id);
    setAddressLabel(savedAddress.label || '');
    setAddressIsDefault(Boolean(savedAddress.isDefault));
    setShipping({
      address: savedAddress.address,
      city: savedAddress.city,
      phone: savedAddress.phone,
    });
    setAddressMessage('');
  };

  const saveAddress = async () => {
    if (!shipping.address.trim() || !shipping.city.trim() || !shipping.phone.trim()) {
      setAddressMessage('Vui lòng nhập đầy đủ địa chỉ, thành phố và số điện thoại trước khi lưu.');
      return;
    }

    setAddressLoading(true);
    setAddressMessage('');

    try {
      const res = await fetch(
        editingAddressId
          ? `${API_BASE_URL}/api/users/addresses/${editingAddressId}`
          : `${API_BASE_URL}/api/users/addresses`,
        {
          method: editingAddressId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(getAddressPayload()),
        }
      );
      const data = await readJsonResponse(res);
      const addresses = setAddressList(data);
      const activeAddress = editingAddressId
        ? addresses.find((item) => item._id === editingAddressId)
        : addresses[addresses.length - 1];

      if (activeAddress) {
        setSelectedAddressId(activeAddress._id);
      }
      setAddressMessage(editingAddressId ? 'Đã cập nhật địa chỉ.' : 'Đã lưu địa chỉ mới.');
      setEditingAddressId('');
      setAddressLabel('');
      setAddressIsDefault(addresses.length === 0);
    } catch (err) {
      if (!canUseLocalAddressFallback(err)) {
        setAddressMessage(err.message || 'Không thể lưu địa chỉ');
        return;
      }

      const activeAddress = saveAddressLocally();
      if (activeAddress) {
        setSelectedAddressId(activeAddress._id);
      }
      setAddressMessage(editingAddressId ? 'Đã cập nhật địa chỉ.' : 'Đã lưu địa chỉ mới.');
      setEditingAddressId('');
      setAddressLabel('');
      setAddressIsDefault(savedAddresses.length === 0);
    } finally {
      setAddressLoading(false);
    }
  };

  const deleteSavedAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    setAddressLoading(true);
    setAddressMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await readJsonResponse(res);
      const addresses = setAddressList(data);
      setAddressMessage('Đã xóa địa chỉ.');

      if (editingAddressId === addressId) {
        resetAddressEditor();
      }

      if (selectedAddressId === addressId) {
        const nextAddress = addresses.find((item) => item.isDefault) || addresses[0];
        if (nextAddress) {
          applySavedAddress(nextAddress);
        } else {
          setSelectedAddressId('');
        }
      }
    } catch (err) {
      if (!canUseLocalAddressFallback(err)) {
        setAddressMessage(err.message || 'Không thể xóa địa chỉ');
        return;
      }

      const addresses = deleteAddressLocally(addressId);
      setAddressMessage('Đã xóa địa chỉ.');

      if (editingAddressId === addressId) {
        resetAddressEditor();
      }

      if (selectedAddressId === addressId) {
        const nextAddress = addresses.find((item) => item.isDefault) || addresses[0];
        if (nextAddress) {
          applySavedAddress(nextAddress);
        } else {
          setSelectedAddressId('');
        }
      }
    } finally {
      setAddressLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 20h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
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

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = shipping.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError('Vui lòng nhập số điện thoại hợp lệ từ 10 đến 11 chữ số.');
      setLoading(false);
      return;
    }

    if (paymentMethod === 'CARD') {
      const cleanCardNumber = cardInfo.cardNumber.replace(/\s/g, '');
      const cleanExpiry = cardInfo.expiry.replace(/\D/g, '');
      const cleanCvv = cardInfo.cvv.replace(/\D/g, '');

      if (!cardInfo.holderName.trim() || cleanCardNumber.length !== 16 || cleanExpiry.length !== 4 || cleanCvv.length < 3) {
        setError('Vui lòng nhập đầy đủ thông tin thẻ hợp lệ.');
        setLoading(false);
        return;
      }

      if (isCardExpired(cardInfo.expiry)) {
        setError('Thẻ đã hết hạn hoặc ngày hết hạn không hợp lệ.');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          orderItems: checkoutItems.map((item) => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            product: item._id,
          })),
          shippingAddress: shipping,
          paymentMethod,
          itemsPrice,
          totalPrice: itemsPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearSelectedCart();
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders');
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

  if (checkoutItems.length === 0 && !success) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Bạn chưa chọn sản phẩm nào để thanh toán!</h2>
        <Link to="/cart" className="text-blue-600 underline">Quay lại giỏ hàng để chọn sản phẩm</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Đặt hàng thành công!</h2>
          <p className="text-slate-600 mb-6">Cảm ơn bạn đã mua sắm tại T-Shop. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao.</p>
          <p className="text-sm text-slate-400">Tự động chuyển về trang đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Thanh Toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Thông Tin Giao Hàng</h2>
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Địa chỉ đã lưu</h3>
                    <p className="text-xs text-slate-500 mt-1">Chọn nhanh, sửa hoặc xóa địa chỉ giao hàng của bạn.</p>
                  </div>
                  {addressLoading && (
                    <span className="text-xs font-bold text-blue-600">Đang xử lý...</span>
                  )}
                </div>

                {savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAddresses.map((savedAddress) => (
                      <div
                        key={savedAddress._id}
                        className={`p-4 rounded-2xl border bg-white transition-all ${
                          selectedAddressId === savedAddress._id
                            ? 'border-blue-300 ring-2 ring-blue-100'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => applySavedAddress(savedAddress)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-black text-slate-800 text-sm">{savedAddress.label || 'Địa chỉ giao hàng'}</span>
                            {savedAddress.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Mặc định</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{savedAddress.address}, {savedAddress.city}</p>
                          <p className="text-xs font-bold text-blue-600 mt-2">{savedAddress.phone}</p>
                        </button>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                          <button
                            type="button"
                            onClick={() => editSavedAddress(savedAddress)}
                            className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedAddress(savedAddress._id)}
                            className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400 font-bold text-center">
                    Chưa có địa chỉ nào được lưu.
                  </div>
                )}

                {addressMessage && (
                  <p className="mt-4 text-xs font-bold text-slate-500">{addressMessage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên gợi nhớ</label>
                <input
                  type="text"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhà riêng / Công ty..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ Giao Hàng</label>
                <input
                  required
                  type="text"
                  value={shipping.address}
                  onChange={(e) => updateShippingField('address', e.target.value)}
                  autoComplete="street-address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Số nhà, Tên Đường..."
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Thành Phố</label>
                  <input
                    required
                    type="text"
                    value={shipping.city}
                    onChange={(e) => updateShippingField('city', e.target.value)}
                    autoComplete="address-level2"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Hà Nội / HCM..."
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10,11}"
                    minLength="10"
                    maxLength="11"
                    value={shipping.phone}
                    onChange={(e) => updateShippingField('phone', e.target.value)}
                    autoComplete="tel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="09xxxxxxxx"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={addressIsDefault}
                    onChange={(e) => setAddressIsDefault(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  Đặt làm địa chỉ mặc định
                </label>
                <div className="flex flex-wrap gap-2">
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={resetAddressEditor}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase hover:bg-slate-200 transition-all"
                    >
                      Hủy sửa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={addressLoading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-all"
                  >
                    {editingAddressId ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ này'}
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-4 mt-8">Phương Thức Thanh Toán</h2>

              <div className="space-y-4">
                <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-3 font-semibold text-slate-900">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </label>

                <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 font-semibold text-slate-900">Thanh toán bằng thẻ</span>
                  </div>
                  <p className="mt-2 ml-7 text-sm text-slate-500">Nhập thông tin thẻ để mô phỏng thanh toán online.</p>
                </label>
              </div>

              {paymentMethod === 'CARD' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-blue-100 bg-blue-50/60">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên chủ thẻ</label>
                    <input
                      required
                      type="text"
                      value={cardInfo.holderName}
                      onChange={(e) => handleCardFieldChange('holderName', e.target.value)}
                      autoComplete="cc-name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NGUYEN VAN A"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Số thẻ</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9 ]{19}"
                      maxLength="19"
                      value={cardInfo.cardNumber}
                      onChange={(e) => handleCardFieldChange('cardNumber', e.target.value)}
                      autoComplete="cc-number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày hết hạn</label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                      maxLength="5"
                      value={cardInfo.expiry}
                      onChange={(e) => handleCardFieldChange('expiry', e.target.value)}
                      autoComplete="cc-exp"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CVV</label>
                    <input
                      required
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{3,4}"
                      minLength="3"
                      maxLength="4"
                      value={cardInfo.cvv}
                      onChange={(e) => handleCardFieldChange('cvv', e.target.value)}
                      autoComplete="cc-csc"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500">Demo UI: hệ thống không lưu thông tin thẻ và chỉ mô phỏng thanh toán.</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                Phương thức đã chọn:
                <span className="ml-2 font-bold text-slate-900">
                  {paymentMethod === 'CARD' ? 'Thanh toán bằng thẻ' : 'Thanh toán khi nhận hàng (COD)'}
                </span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
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

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Đơn Hàng Của Bạn</h2>
              <div className="space-y-4 mb-6 border-b pb-6 max-h-96 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.cartId} className="flex gap-4">
                    <img
                      src={item.image || getProductImageFallback(item.name)}
                      alt={item.name}
                      onError={(event) => handleProductImageError(event, item.name)}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
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
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600">Thanh toán</span>
                <span className="font-semibold text-slate-900">{paymentMethod === 'CARD' ? 'Thẻ ngân hàng' : 'COD'}</span>
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
