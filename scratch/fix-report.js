const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/seasons/[id]/report/page.tsx', 'utf8');

// 1. Add unsold calculations
const calcHook = `  // 5. Expense Breakdown`;
const newCalcs = `  // 4b. Unsold (Dead Stock) Analysis
  const unsoldProducts = season.products.filter(p => p.qtyAvailable > 0);
  const totalUnsoldCost = unsoldProducts.reduce((sum, p) => sum + (p.purchasePrice * p.qtyAvailable), 0);
  const totalUnsoldExpected = unsoldProducts.reduce((sum, p) => sum + (p.sellingPrice * p.qtyAvailable), 0);

  // 5. Expense Breakdown`;
content = content.replace(calcHook, newCalcs);

// 2. Inject JSX before Footer
const jsxHook = `        </div>
        
        {/* Footer */}`;
const newJsx = `            {/* Unsold Stock Analysis */}
            {unsoldProducts.length > 0 && (
              <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 print:border-slate-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Package className="w-5 h-5" /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">Unsold Stock Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-sm p-6 text-white print:border print:border-rose-200 print:bg-none print:text-rose-900" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <h3 className="text-lg font-medium text-rose-100 print:text-rose-800">Total Cost (Fasa Hua Paisa)</h3>
                    <p className="text-3xl font-extrabold mt-2">₹{totalUnsoldCost.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white print:border print:border-emerald-200 print:bg-none print:text-emerald-900" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <h3 className="text-lg font-medium text-emerald-100 print:text-emerald-800">Total Expected</h3>
                    <p className="text-3xl font-extrabold mt-2">₹{totalUnsoldExpected.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-black">Murti Details</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-black">Unsold Qty</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-black">Total Cost</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-black">Total Expected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 print:divide-slate-300 print:bg-white">
                      {unsoldProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm print:text-black">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.size || 'N/A'} • {p.material}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-orange-600">
                            {p.qtyAvailable}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-rose-600 print:text-black">₹{(p.purchasePrice * p.qtyAvailable).toLocaleString('en-IN')}</div>
                            <div className="text-xs text-slate-500 print:text-slate-600">₹{p.purchasePrice.toLocaleString('en-IN')} / piece</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-emerald-600 print:text-black">₹{(p.sellingPrice * p.qtyAvailable).toLocaleString('en-IN')}</div>
                            <div className="text-xs text-slate-500 print:text-slate-600">₹{p.sellingPrice.toLocaleString('en-IN')} / piece</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        
        {/* Footer */}`;
content = content.replace(jsxHook, newJsx);

fs.writeFileSync('src/app/dashboard/seasons/[id]/report/page.tsx', content, 'utf8');
console.log('Added unsold analysis to report');
