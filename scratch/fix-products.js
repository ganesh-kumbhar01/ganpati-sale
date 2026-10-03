const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');

content = content.replace(/Trash2, Camera, ImageIcon } from 'lucide-react';/, "Trash2, Camera, ImageIcon, Flame } from 'lucide-react';");

const toggleFn = `  const handleToggleClearance = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(\`/api/products/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isClearance: !currentStatus })
      });
      if (res.ok) {
        toast.success(!currentStatus ? 'Marked for Clearance' : 'Removed from Clearance');
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.error);
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };\n\n`;

content = content.replace(/const handleDelete = async/, toggleFn + '  const handleDelete = async');

const btnHtml = `                      <button onClick={(e) => { e.stopPropagation(); handleToggleClearance(product.id, product.isClearance || false); }} className={\`p-2 rounded-full transition-colors inline-flex \${product.isClearance ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'}\`} title={product.isClearance ? 'Remove from Clearance' : 'Mark for Clearance'}>
                        <Flame className="w-5 h-5" />
                      </button>\n`;

content = content.replace(/<button onClick=\{\(\) => handleDelete\(product.id\)\}/, btnHtml + '                      <button onClick={() => handleDelete(product.id)}');

fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', content, 'utf8');
console.log('Fixed ProductsClient');
