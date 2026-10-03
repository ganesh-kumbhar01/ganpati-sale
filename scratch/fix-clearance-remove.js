const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/clearance/ClearanceClient.tsx', 'utf8');

// Imports
content = content.replace(
  /import \{ ImageIcon, Flame \} from 'lucide-react';/,
  "import { ImageIcon, Flame, Trash2 } from 'lucide-react';\nimport { useRouter } from 'next/navigation';\nimport toast from 'react-hot-toast';"
);

// Function inside component
content = content.replace(
  /export default function ClearanceClient\(\{[^\}]+\} \: \{[^\}]+\}\) \{/,
  "export default function ClearanceClient({ products }: { products: Product[] }) {\n  const router = useRouter();\n\n  const handleRemove = async (id: string) => {\n    try {\n      const res = await fetch(`/api/products/${id}`, {\n        method: 'PUT',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ isClearance: false })\n      });\n      if (res.ok) {\n        toast.success('Removed from Clearance Watchlist');\n        router.refresh();\n      } else {\n        toast.error('Failed to remove');\n      }\n    } catch (e) {\n      toast.error('Failed to remove');\n    }\n  };\n"
);

// Table Header
content = content.replace(
  /<th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expected<\/th>/,
  "<th className=\"px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider\">Total Expected</th>\n                <th className=\"px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider\">Action</th>"
);

// Table Body
const tdCode = `<td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{(product.sellingPrice * product.qtyAvailable).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 mt-1">₹{product.sellingPrice.toLocaleString('en-IN')} / piece</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => handleRemove(product.id)} className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Remove from Clearance">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>`;

content = content.replace(/<td className="px-6 py-4 whitespace-nowrap text-right">\s*<div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹\{\(product\.sellingPrice \* product\.qtyAvailable\)\.toLocaleString\('en-IN'\)\}<\/div>\s*<div className="text-xs text-slate-500 mt-1">₹\{product\.sellingPrice\.toLocaleString\('en-IN'\)\} \/ piece<\/div>\s*<\/td>/, tdCode);

fs.writeFileSync('src/app/dashboard/clearance/ClearanceClient.tsx', content, 'utf8');
console.log('Added remove button');
