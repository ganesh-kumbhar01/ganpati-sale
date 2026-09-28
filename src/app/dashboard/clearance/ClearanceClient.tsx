"use client";

import React from 'react';
import { Product } from '@prisma/client';
import { ImageIcon, Flame } from 'lucide-react';

export default function ClearanceClient({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No Clearance Items</h3>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          You haven't marked any murtis for clearance yet. You can mark slow-moving items in the Products section.
        </p>
      </div>
    );
  }

  const totalDeadStockValue = products.reduce((acc, p) => acc + (p.qtyAvailable * p.purchasePrice), 0);
  const totalExpectedRevenue = products.reduce((acc, p) => acc + (p.qtyAvailable * p.sellingPrice), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Cost (Fasa Hua Paisa)</h3>
          <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">₹{totalDeadStockValue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Cost price of all clearance items.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Expected</h3>
          <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">₹{totalExpectedRevenue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Selling price of all clearance items.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Murti Details</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Qty</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-base">{product.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{product.size || 'N/A'} • {product.material}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {product.qtyAvailable} left
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400">₹{(product.purchasePrice * product.qtyAvailable).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 mt-1">₹{product.purchasePrice.toLocaleString('en-IN')} / piece</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{(product.sellingPrice * product.qtyAvailable).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 mt-1">₹{product.sellingPrice.toLocaleString('en-IN')} / piece</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
