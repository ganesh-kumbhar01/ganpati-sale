const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');

// Add Filter, Search icons to lucide-react import
content = content.replace(
  /import \{ Plus, Package, Loader2, Trash2, Camera, ImageIcon, Flame, Users \} from 'lucide-react';/,
  "import { Plus, Package, Loader2, Trash2, Camera, ImageIcon, Flame, Users, Search, Filter } from 'lucide-react';"
);

// Add filter states
const filterStates = `
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = filterMaterial === 'All' || p.material === filterMaterial;
    let matchesStock = true;
    if (filterStock === 'In Stock') matchesStock = p.qtyAvailable > 0;
    if (filterStock === 'Out of Stock') matchesStock = p.qtyAvailable === 0;
    
    return matchesSearch && matchesMaterial && matchesStock;
  });
`;

content = content.replace(
  /const \[products, setProducts\] = useState\(initialProducts\);/,
  "const [products, setProducts] = useState(initialProducts);\n" + filterStates
);

// Update map function
content = content.replace(
  /\{products\.map\(\(product\) => \(/g,
  "{filteredProducts.map((product: any) => ("
);

// Update empty state length check
content = content.replace(
  /\{products\.length === 0 && \(/g,
  "{filteredProducts.length === 0 && ("
);

// Add filter UI
const filterUI = `
      <div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="block w-full sm:w-auto rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="All">All Materials</option>
              <option value="POP">POP</option>
              <option value="Eco-friendly">Eco-friendly</option>
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="block w-full sm:w-auto rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="All">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Product
          </button>
        </div>
`;

content = content.replace(
  /      <div>\s*<div className="mb-6">\s*<button\s*onClick=\{openNewModal\}[\s\S]*?Add Product\s*<\/button>\s*<\/div>/,
  filterUI
);

fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', content, 'utf8');
console.log('Added filters to ProductsClient');
