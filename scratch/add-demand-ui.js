const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');

// Add Users import
content = content.replace(
  /import \{ Plus, Package, Loader2, Trash2, Camera, ImageIcon, Flame \} from 'lucide-react';/,
  "import { Plus, Package, Loader2, Trash2, Camera, ImageIcon, Flame, Users } from 'lucide-react';"
);

// Add state for demand modal
const demandState = `
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [demandProductId, setDemandProductId] = useState('');
  const [demandData, setDemandData] = useState({ customerName: '', customerPhone: '', notes: '' });

  const openDemandModal = (id: string) => {
    setDemandProductId(id);
    setDemandData({ customerName: '', customerPhone: '', notes: '' });
    setIsDemandModalOpen(true);
  };

  const handleDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: demandProductId, ...demandData }),
      });
      if (res.ok) {
        toast.success('Demand recorded successfully');
        setIsDemandModalOpen(false);
      } else {
        toast.error('Failed to record demand');
      }
    } catch (err) {
      toast.error('Error recording demand');
    }
    setLoading(false);
  };
`;

content = content.replace(
  /const \[isEditMode, setIsEditMode\] = useState\(false\);/,
  "const [isEditMode, setIsEditMode] = useState(false);\n" + demandState
);

// Add Button in Table
const demandButton = `
                        <button onClick={(e) => { e.stopPropagation(); openDemandModal(product.id); }} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 inline-flex" title="Record Lost Sale / Demand">
                          <Users className="w-5 h-5" />
                        </button>`;
content = content.replace(
  /<button onClick=\{\(\) => handleDelete\(product\.id\)\} className="text-slate-400 hover:text-rose-600/,
  demandButton + '\n                        <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-rose-600'
);

// Add Demand Modal
const demandModal = `
      {isDemandModalOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-md border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleDemandSubmit}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white mb-2" id="modal-title">
                      Record Lost Sale / Demand
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      Did a customer want this model but it was out of stock? Record it to plan better for next year.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Customer Name (Optional)</label>
                        <input type="text" value={demandData.customerName} onChange={e => setDemandData({...demandData, customerName: e.target.value})} placeholder="For waitlist" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number (Optional)</label>
                        <input type="tel" value={demandData.customerPhone} onChange={e => setDemandData({...demandData, customerPhone: e.target.value})} placeholder="To notify if available" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 pb-20 sm:pb-4">
                    <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 sm:py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Record Demand'}
                    </button>
                    <button type="button" onClick={() => setIsDemandModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 sm:py-2 text-base font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{isModalOpen && \(/,
  demandModal + '\n      {isModalOpen && ('
);

fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', content, 'utf8');
console.log('Added Demand UI to ProductsClient');
