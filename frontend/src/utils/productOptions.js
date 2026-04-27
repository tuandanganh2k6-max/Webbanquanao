export const DEFAULT_PRODUCT_SIZES = ['S', 'M', 'L', 'XL'];

export const getAvailableSizes = (product) => {
  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }

  return DEFAULT_PRODUCT_SIZES;
};
