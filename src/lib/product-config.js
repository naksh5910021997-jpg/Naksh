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

// Age-wise sizes from the old Adult/Kids size type. No longer offered in the admin,
// but kept valid so products saved with them can still be loaded and edited.
export const LEGACY_KIDS_SIZES = ['9/12-M', '12/18-M', '18/24-M', '24/36-M', '3/4-Y', '4/5-Y', '5/6-Y', '6/7-Y', '7/8-Y', '9/10-Y'];

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
export const ALL_SIZES = [...new Set([...Object.values(SIZE_OPTIONS).flat(), ...LEGACY_KIDS_SIZES])];

// Adult and kids products use the same sizes.
export function getSizeOptions(garmentType = 'tshirt') {
  return SIZE_OPTIONS[garmentType] || SIZE_OPTIONS.tshirt;
}

// Trousers are labelled by waist.
export function getSizeLabel(garmentType) {
  return garmentType === 'trouser' ? 'Waist' : 'Size';
}

export function getDefaultSizeVariants(garmentType = 'tshirt') {
  const defaults = DEFAULT_SIZES[garmentType] || DEFAULT_SIZES.tshirt;
  return defaults.map((size) => ({
    size,
    stock: 0,
    price: '',
    comparePrice: '',
    salePrice: '',
    onSale: false,
    sku: '',
  }));
}
