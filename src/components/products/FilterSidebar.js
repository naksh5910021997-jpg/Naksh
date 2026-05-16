'use client';

export default function FilterSidebar({ categories, filters, onFilterChange }) {
  const productTypes = [
    'polo', 'half-sleeve', 'full-sleeve', 'v-neck', 'round-neck', 'henley', 'tank-top',
  ];

  const fits = ['slim', 'regular', 'loose', 'oversized', 'athletic'];
  const patterns = ['solid', 'striped', 'printed', 'checkered', 'graphic', 'plain'];
  const fabrics = ['cotton', 'polyester', 'blend', 'linen', 'silk', 'other'];

  const inputStyles = "w-full px-4 py-3 bg-main-bg border border-accent-dim text-[11px] uppercase tracking-widest font-bold focus:outline-none focus:border-text transition-all duration-300 placeholder:text-text placeholder:opacity-60 placeholder:font-normal rounded-sm text-text";
  const labelStyles = "block text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-text opacity-60";

  return (
    <div className="bg-card-bg border border-accent-dim rounded-lg p-8 space-y-8 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text">Refine By</h3>
        <span className="text-[10px] font-mono text-text opacity-40">/ FILTERS</span>
      </div>

      {/* Search */}
      <div>
        <label className={labelStyles}>Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className={inputStyles}
        />
      </div>

      {/* Category */}
      <div>
        <label className={labelStyles}>Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Product Type */}
      <div>
        <label className={labelStyles}>Style</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">All Styles</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('-', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Fit */}
      <div>
        <label className={labelStyles}>Fit</label>
        <select
          value={filters.fit}
          onChange={(e) => onFilterChange({ fit: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">All Fits</option>
          {fits.map((fit) => (
            <option key={fit} value={fit}>
              {fit.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Pattern */}
      <div>
        <label className={labelStyles}>Pattern</label>
        <select
          value={filters.pattern}
          onChange={(e) => onFilterChange({ pattern: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">All Patterns</option>
          {patterns.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Fabric */}
      <div>
        <label className={labelStyles}>Fabric</label>
        <select
          value={filters.fabric}
          onChange={(e) => onFilterChange({ fabric: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">All Fabrics</option>
          {fabrics.map((fabric) => (
            <option key={fabric} value={fabric}>
              {fabric.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className={labelStyles}>Price Range (Rs )</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className={inputStyles}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className={inputStyles}
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className={labelStyles}>Minimum Rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => onFilterChange({ minRating: e.target.value })}
          className={`${inputStyles} cursor-pointer appearance-none`}
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      {/* Special Filters */}
      <div>
        <label className={labelStyles}>Special</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured === 'true'}
              onChange={(e) => onFilterChange({ featured: e.target.checked ? 'true' : '' })}
              className="w-4 h-4 text-text bg-main-bg border-accent-dim rounded focus:ring-text"
            />
            <span className="text-xs font-bold text-text uppercase tracking-widest">Featured</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.trending === 'true'}
              onChange={(e) => onFilterChange({ trending: e.target.checked ? 'true' : '' })}
              className="w-4 h-4 text-text bg-main-bg border-accent-dim rounded focus:ring-text"
            />
            <span className="text-xs font-bold text-text uppercase tracking-widest">Trending</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onSale === 'true'}
              onChange={(e) => onFilterChange({ onSale: e.target.checked ? 'true' : '' })}
              className="w-4 h-4 text-text bg-main-bg border-accent-dim rounded focus:ring-text"
            />
            <span className="text-xs font-bold text-text uppercase tracking-widest">On Sale</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onFilterChange({
            category: '',
            type: '',
            fit: '',
            pattern: '',
            fabric: '',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            search: '',
            featured: '',
            trending: '',
            onSale: '',
          })
        }
        className="w-full border border-text text-text py-4 text-[10px] uppercase font-black tracking-[0.3em] hover:bg-text hover:text-card-bg transition-all duration-500 rounded-sm"
      >
        Reset All Filters
      </button>
    </div>
  );
}