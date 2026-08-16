export const GARMENT_TYPES = [
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'trouser', label: 'Trouser' },
];

export const PRODUCT_TYPES = {
  tshirt: [
    { value: 'polo', label: 'Polo' },
    { value: 'half-sleeve', label: 'Half Sleeve' },
    { value: 'full-sleeve', label: 'Full Sleeve' },
    { value: 'v-neck', label: 'V-Neck' },
    { value: 'round-neck', label: 'Round Neck' },
    { value: 'henley', label: 'Henley' },
    { value: 'tank-top', label: 'Tank Top' },
  ],
  trouser: [
    { value: 'jeans', label: 'Jeans' },
    { value: 'chinos', label: 'Chinos' },
    { value: 'formal-trouser', label: 'Formal Trouser' },
    { value: 'cargo', label: 'Cargo' },
    { value: 'jogger', label: 'Jogger' },
    { value: 'track-pants', label: 'Track Pants' },
  ],
};

export const SIZE_OPTIONS = {
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  trouser: ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
};

export const DEFAULT_SIZES = {
  tshirt: ['S', 'M', 'L', 'XL'],
  trouser: ['30', '32', '34', '36'],
};

export const TROUSER_OPTIONS = {
  rise: ['low', 'mid', 'high'],
  legStyle: ['skinny', 'slim', 'straight', 'tapered', 'wide', 'bootcut'],
  waistType: ['fixed', 'elasticated', 'drawstring', 'adjustable'],
  closure: ['button', 'zip', 'drawstring', 'hook-and-bar', 'elastic'],
  length: ['short', 'regular', 'long'],
};

export const ALL_PRODUCT_TYPES = Object.values(PRODUCT_TYPES).flat().map(({ value }) => value);
export const ALL_SIZES = [...new Set(Object.values(SIZE_OPTIONS).flat())];

export function getDefaultSizeVariants(garmentType = 'tshirt') {
  return (DEFAULT_SIZES[garmentType] || DEFAULT_SIZES.tshirt).map((size) => ({
    size,
    stock: 0,
    price: '',
    comparePrice: '',
    salePrice: '',
    onSale: false,
    sku: '',
  }));
}
