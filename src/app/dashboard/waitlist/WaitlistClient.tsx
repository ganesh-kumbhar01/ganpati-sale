"use client";

import React from 'react';
import { Users, Phone, Calendar, ImageIcon } from 'lucide-react';

export default function WaitlistClient({ demands }: { demands: any[] }) {
  // Group demands by product
  const productDemands = demands.reduce((acc, demand) => {
    if (!acc[demand.productId]) {
      acc[demand.productId] = {
        product: demand.product,
        totalLostSales: 0,
        waitlist: []
      };
    }
    acc[demand.productId].totalLostSales += 1;
    if (demand.customerName || demand.customerPhone) {
      acc[demand.productId].waitlist.push(demand);
    }
    return acc;
  }, {} as Record<string, any>);

  const demandList = Object.values(productDemands).sort((a: any, b: any) => b.totalLostSales - a.totalLostSales);

  if (demandList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="mx-auto w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Lost Sales Recorded</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          You haven't recorded any unmet demand or waitlisted customers yet. Use the 'Record Demand' button in the Products section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Demand & Waitlist</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track unmet demand to plan better for next season.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {demandList.map((item: any) => (
          <div key={item.product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.product.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.product.size || 'N/A'} • {item.product.material}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Missed</p>
                  <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{item.totalLostSales}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Waitlist</p>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{item.waitlist.length}</p>
                </div>
              </div>
            </div>
            
            {item.waitlist.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer Details</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Added On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {item.waitlist.map((waiter: any) => (
                      <tr key={waiter.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-white">{waiter.customerName || 'Anonymous'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {waiter.customerPhone ? (
                            <a href={`tel:${waiter.customerPhone}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                              <Phone className="w-3.5 h-3.5" />
                              {waiter.customerPhone}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400 italic">No number</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(waiter.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
