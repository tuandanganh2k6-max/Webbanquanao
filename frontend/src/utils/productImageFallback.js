const PRODUCT_IMAGE_FALLBACKS = {
  'Áo Sơ Mi Flannel Caro Đỏ': 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop',
  'Áo Khoác Gió Windbreaker Tech': 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop',
};

export const getProductImageFallback = (productName) => PRODUCT_IMAGE_FALLBACKS[productName] || '';

export const handleProductImageError = (event, productName) => {
  const fallbackImage = getProductImageFallback(productName);

  if (!fallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = fallbackImage;
};
